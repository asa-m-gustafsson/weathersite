import { start } from 'repl';
import {
  IDailyForecastListItem,
  IHourlyForecastListItem,
  WeatherSymbol,
} from '../models/forecast-models';
import DemoForecast from './demo-forecast.json';

export interface IForecastService {
  getDailyForecastList(
    longitude: number,
    latitude: number
  ): Promise<IDailyForecastListItem[]>;
  getDailyForecastAsString(
    longitude: number,
    latitude: number
  ): Promise<string>;
}

export default class ForecastService implements IForecastService {
  private _dateFormat: Intl.DateTimeFormat;
  private _timeFormat: Intl.DateTimeFormat;
  constructor() {
    this._dateFormat = new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    this._timeFormat = new Intl.DateTimeFormat('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  public getDailyForecastList = async (
    longitude: number,
    latitude: number
  ): Promise<IDailyForecastListItem[]> => {
    const requestUrl: string = this.getRequestUrl(longitude, latitude);

    const demoForecast = DemoForecast;

    // use demo data to not use api calls when developing
    return await this.formatSmhiResponseToDailyForecast(demoForecast);

    return await fetch(requestUrl)
      .then((response: Response) => response.json())
      .then((result) => {
        console.log(result);
        return this.formatSmhiResponseToDailyForecast(result);
      })
      .catch((e) => {
        console.log(e);
        return [];
      });
  };

  // function to get demo data. Discard later on.
  public getDailyForecastAsString = async (
    longitude: number,
    latitude: number
  ): Promise<string> => {
    const requestUrl: string = this.getRequestUrl(longitude, latitude);

    return await fetch(requestUrl)
      .then((response: Response) => response.json())
      .then((result: JSON) => {
        console.log(result);
        return JSON.stringify(result);
      })
      .catch((e) => {
        console.log(e);
        return '';
      });
  };

  private getRequestUrl = (longitude: number, latitude: number): string => {
    return `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${longitude}/lat/${latitude}/data.json`;
  };

  private formatSmhiResponseToDailyForecast = (
    smhiResponse
  ): IDailyForecastListItem[] => {
    const referenceDateTime: Date = new Date(smhiResponse['approvedTime']);
    let dailyForecastArray: IDailyForecastListItem[] = this.createDailyForecastArray(
      referenceDateTime,
      5
    );

    let formattedHourlyForecasts: IHourlyForecastListItem[] = this.extractHourlyForecastInfo(
      smhiResponse['timeSeries']
    );

    dailyForecastArray.forEach((dailyForecast: IDailyForecastListItem) => {
      let hourlyForecasts: IHourlyForecastListItem[] = formattedHourlyForecasts.filter(
        (hourlyForecast) => {
          return hourlyForecast.dateString === dailyForecast.dateString;
        }
      );
      // works so far! Next: get min- and max temp and calculate... everything.
      dailyForecast.hourlyForecasts = hourlyForecasts;
      dailyForecast.maxTemp = hourlyForecasts.reduce(
        (newMaxTemp: number, currentHourly: IHourlyForecastListItem) => {
          return Math.max(newMaxTemp, currentHourly.temperature);
        },
        dailyForecast.maxTemp
      );
      dailyForecast.minTemp = hourlyForecasts.reduce(
        (newMinTemp: number, currentHourly: IHourlyForecastListItem) => {
          return Math.min(newMinTemp, currentHourly.temperature);
        },
        dailyForecast.minTemp
      );
      let hourlyForSymbol = hourlyForecasts.find(
        (forecast: IHourlyForecastListItem) => {
          return forecast.timeString.includes('14');
        }
      );
      // assign daily weather symbol as the symbol from 14.00 if available,
      // otherwise the first available weather symbol.
      // hourlyForecasts is only empty if fetch is botched. Should this be edited out?
      dailyForecast.weatherSymbol = hourlyForSymbol
        ? hourlyForSymbol.weatherSymbol
        : hourlyForecasts.length
        ? hourlyForecasts[0].weatherSymbol
        : WeatherSymbol.Unknown;
      console.log(hourlyForSymbol);
    });

    console.log(dailyForecastArray);
    console.log(formattedHourlyForecasts);

    return dailyForecastArray;
  };

  private extractHourlyForecastInfo = (
    hourlyForecasts: any[]
  ): IHourlyForecastListItem[] => {
    let formattedHourlyForecasts: IHourlyForecastListItem[] = hourlyForecasts.map(
      (forecast) => {
        const params: any[] = forecast['parameters'];
        console.log(
          params.find((param) => {
            return param['name'] === 'spp';
          })
        );
        const hourlyDateTime: Date = new Date(forecast['validTime']);
        return {
          dateString: this._dateFormat.format(hourlyDateTime),
          timeString: this._timeFormat.format(hourlyDateTime),
          temperature: this.getParameterInfo(params, 't')['values'][0],
          weatherSymbol: this.getParameterInfo(params, 'Wsymb2')[
            'values'
          ][0] as WeatherSymbol,
        };
      }
    );
    return formattedHourlyForecasts;
  };

  private getParameterInfo = (params: any[], paramName: string): any => {
    return params.find((param) => {
      return param['name'] === paramName;
    });
  };

  // probably less efficient than new. Test these against each other when done to confirm.
  private oldFormatSmhiResponseToDailyForecast = (
    smhiResponse
  ): IDailyForecastListItem[] => {
    let forecastList: IDailyForecastListItem[] = [];
    const rawWeatherData: any[] = smhiResponse['timeSeries'];
    const referenceDateTime: Date = new Date(smhiResponse['referenceTime']);
    let forecastMaxDateTime: Date = new Date(smhiResponse['referenceTime']);
    forecastMaxDateTime.setDate(forecastMaxDateTime.getDate() + 5);
    const currentDateString: string = this._dateFormat.format(
      referenceDateTime
    );
    const currentTimeString: string = this._timeFormat.format(
      referenceDateTime
    );
    const maxDateString: string = this._dateFormat.format(
      referenceDateTime.getDate() + 5
    );
    // let this be null? How to not push this empty item into array on first round?
    let forecastItem: IDailyForecastListItem = this.getCleanForecastItem(
      new Date(0, 0, 0, 0, 0, 0)
    );
    console.log(rawWeatherData);
    rawWeatherData.forEach((weatherPoint) => {
      const pointDateTime = new Date(weatherPoint['validTime']);
      // Example: 2020-09-24T23:00:00Z
      console.log(weatherPoint['validTime']);
      // Example: 2020-09-25
      console.log(this._dateFormat.format(pointDateTime));
      // Example: 01:00:00
      console.log(this._timeFormat.format(pointDateTime));
      if (this._dateFormat.format(pointDateTime) > forecastItem.dateString) {
        console.log('new date. beginning new forecast item...');
      }
    });
    console.log(rawWeatherData);
    return forecastList;
  };

  private createDailyForecastArray = (
    startDate: Date,
    numberOfDays: number
  ): IDailyForecastListItem[] => {
    let forecastArray: IDailyForecastListItem[] = [];
    let newDate: Date = startDate;
    for (let i = 0; i < numberOfDays; i++) {
      console.log(newDate);
      console.log(startDate);
      forecastArray.push({
        dateString: this._dateFormat.format(newDate),
        minTemp: Number.MAX_SAFE_INTEGER,
        maxTemp: Number.MIN_SAFE_INTEGER,
        precipationAmount: 0,
        weatherSymbol: WeatherSymbol.Unknown,
        hourlyForecasts: [],
      });
      newDate.setDate(newDate.getDate() + 1);
    }
    return forecastArray;
  };

  // this should probably also be deleted. Only used by oldFormatSmhiResponse
  private getCleanForecastItem = (
    dateForItem: Date
  ): IDailyForecastListItem => {
    return {
      dateString: this._dateFormat.format(dateForItem),
      minTemp: Number.MAX_SAFE_INTEGER,
      maxTemp: Number.MIN_SAFE_INTEGER,
      precipationAmount: 0,
      weatherSymbol: WeatherSymbol.Unknown,
      hourlyForecasts: [],
    };
  };
}

export interface IForecastService {
  getForecast(longitude: number, latitude: number): string;
}

export default class ForecastService implements IForecastService {
  private _longitude: number;
  private _latitude: number;
  constructor() {}

  public getForecast = (longitude: number, latitude: number): string => {
    this._latitude = this._latitude;
    this._longitude = this._longitude;
    return this.getRequestUrl(longitude, latitude);
  };

  private getRequestUrl = (longitude: number, latitude: number): string => {
    return `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/
        version/2/geotype/point/lon/${longitude}/lat/${latitude}/data.json`;
  };
}

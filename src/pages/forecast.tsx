import React, { useEffect, useState } from 'react';
import ForecastService, {
  IForecastService,
} from '../services/forecast-service';
import { IDailyForecastListItem } from '../models/forecast-models';

const Forecast = () => {
  const _forecastService: IForecastService = new ForecastService();
  const [dailyForecast, setDailyForecast] = useState<IDailyForecastListItem[]>(
    []
  );
  // const [forecastString, setDailyForecastString] = useState<string>('');

  useEffect(() => {
    _forecastService
      .getDailyForecastList(16, 58)
      .then((result: IDailyForecastListItem[]) => {
        setDailyForecast(result);
      })
      .catch((e) => {
        console.log(e);
      });
    // _forecastService
    //   .getDailyForecastAsString(16, 58)
    //   .then((result: string) => {
    //     setDailyForecastString(result);
    //   })
    //   .catch((e) => {
    //     console.log(e);
    //   });
  }, []);

  console.log(dailyForecast);
  return (
    <>
      <h4>TEST</h4>
    </>
  );
};

export default Forecast;

import React from 'react';
import ForecastService, {
  IForecastService,
} from '../services/forecast-service';

const Forecast = () => {
  const test: IForecastService = new ForecastService();

  return (
    <>
      <h4>{test.getForecast(52, 16)}</h4>
      <h4>{test.getForecast(27, 88)}</h4>
    </>
  );
};

export default Forecast;

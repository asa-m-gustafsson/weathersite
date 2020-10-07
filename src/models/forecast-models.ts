export interface IDailyForecastListItem {
  dateString: string;
  minTemp: number;
  maxTemp: number;
  precipationAmount: number;
  weatherSymbol: WeatherSymbol;
  hourlyForecasts: IHourlyForecastListItem[];
}

export interface IHourlyForecastListItem {
  dateString: string;
  timeString: string;
  temperature: number;
  weatherSymbol: WeatherSymbol;
}

export interface IDetailedForecastItem {}

export enum WeatherSymbol {
  Unknown = 0,
  ClearSky = 1,
  NearlyClearSky = 2,
  VariableCloudiness = 3,
  HalfClearSky = 4,
  CloudySky = 5,
  Overcast = 6,
  Fog = 7,
  LightRainShowers = 8,
  ModerateRainShowers = 9,
  HeavyRainShowers = 10,
  Thunderstorm = 11,
  LightSleetShowers = 12,
  ModerateSleetShowers = 13,
  HeavySleetShowers = 14,
  LightSnowShowers = 15,
  ModerateSnowShowers = 16,
  HeavySnowShowers = 17,
  LightRain = 18,
  ModerateRain = 19,
  HeavyRain = 20,
  Thunder = 21,
  LightSleet = 22,
  ModerateSleet = 23,
  HeavySleet = 24,
  LightSnowfall = 25,
  ModerateSnowfall = 26,
  HeavySnowfall = 27,
}

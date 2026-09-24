const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
}

export interface Weather {
  location: string;
  temperatureCelsius: number;
}

/**
 * Looks up the current temperature for a city, in degrees Celsius.
 * Uses Open-Meteo, which needs no API key.
 */
export async function getWeather(city: string): Promise<Weather> {
  const place = await findCity(city);

  if (!place) {
    throw new Error(`Could not find a place called "${city}".`);
  }

  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', String(place.latitude));
  url.searchParams.set('longitude', String(place.longitude));
  url.searchParams.set('current', 'temperature_2m');

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather lookup failed with status ${response.status}.`);
  }

  const data = (await response.json()) as ForecastResponse;
  const temperatureCelsius = data.current?.temperature_2m;

  if (typeof temperatureCelsius !== 'number') {
    throw new Error('Weather lookup returned no temperature.');
  }

  return { location: place.name, temperatureCelsius };
}

/** Renders a weather result as a short, human readable message. */
export function formatWeather(weather: Weather): string {
  return `${weather.location}: ${Math.round(weather.temperatureCelsius)}°C`;
}

/** Convenience helper: city name in, short weather message out. */
export async function getWeatherReport(city: string): Promise<string> {
  return formatWeather(await getWeather(city));
}

async function findCity(city: string): Promise<GeocodingResult | undefined> {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set('name', city);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Location lookup failed with status ${response.status}.`);
  }

  const data = (await response.json()) as GeocodingResponse;

  return data.results?.[0];
}

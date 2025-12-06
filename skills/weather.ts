import { cli } from 'gunshi'

// Types for API responses
interface GeocodingResult {
  results?: Array<{
    name: string
    latitude: number
    longitude: number
    country: string
    admin1?: string
  }>
}

interface WeatherResponse {
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
  }
  current_units: {
    temperature_2m: string
    relative_humidity_2m: string
    apparent_temperature: string
    wind_speed_10m: string
    wind_direction_10m: string
  }
}

// Weather code to description mapping
const weatherCodeDescriptions: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
}

// Get weather emoji based on weather code
function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌧️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌦️'
  if (code <= 86) return '🌨️'
  return '⛈️'
}

// Get wind direction as compass
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

// Geocode city name to coordinates
async function geocodeCity(city: string): Promise<{ name: string; lat: number; lon: number; country: string; region?: string } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.statusText}`)
  }

  const data = await response.json() as GeocodingResult

  if (!data.results || data.results.length === 0) {
    return null
  }

  const result = data.results[0]
  return {
    name: result.name,
    lat: result.latitude,
    lon: result.longitude,
    country: result.country,
    region: result.admin1,
  }
}

// Fetch weather data
async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`)
  }

  return response.json() as Promise<WeatherResponse>
}

// Define the weather command
const command = {
  name: 'weather',
  description: 'Get the current weather for a city',
  args: {
    city: {
      type: 'positional' as const,
      description: 'City name to get weather for',
    },
    units: {
      type: 'string' as const,
      short: 'u',
      description: 'Temperature units (celsius or fahrenheit)',
      default: 'celsius',
    },
  },
  examples: `
# Get weather for London
weather London

# Get weather for New York in Fahrenheit
weather "New York" --units fahrenheit

# Using short option
weather Tokyo -u celsius
`.trim(),
  run: async (ctx: { values: { city: string; units: string } }) => {
    const { city, units } = ctx.values

    // Geocode the city
    console.log(`Fetching weather for "${city}"...`)

    const location = await geocodeCity(city)
    if (!location) {
      console.error(`Could not find city: ${city}`)
      process.exit(1)
    }

    // Fetch weather
    const weather = await fetchWeather(location.lat, location.lon)
    const current = weather.current
    const weatherUnits = weather.current_units

    // Convert temperature if needed
    let temperature = current.temperature_2m
    let feelsLike = current.apparent_temperature
    let tempUnit = weatherUnits.temperature_2m

    if (units.toLowerCase() === 'fahrenheit' || units.toLowerCase() === 'f') {
      temperature = (temperature * 9/5) + 32
      feelsLike = (feelsLike * 9/5) + 32
      tempUnit = '°F'
    }

    // Format output
    const weatherDesc = weatherCodeDescriptions[current.weather_code] || 'Unknown'
    const emoji = getWeatherEmoji(current.weather_code)
    const windDir = getWindDirection(current.wind_direction_10m)

    const locationStr = location.region
      ? `${location.name}, ${location.region}, ${location.country}`
      : `${location.name}, ${location.country}`

    console.log('')
    console.log(`Weather for ${locationStr}`)
    console.log('─'.repeat(40))
    console.log(`${emoji} ${weatherDesc}`)
    console.log(`🌡️  Temperature: ${temperature.toFixed(1)}${tempUnit}`)
    console.log(`🤒 Feels like: ${feelsLike.toFixed(1)}${tempUnit}`)
    console.log(`💧 Humidity: ${current.relative_humidity_2m}${weatherUnits.relative_humidity_2m}`)
    console.log(`💨 Wind: ${current.wind_speed_10m} ${weatherUnits.wind_speed_10m} ${windDir}`)
    console.log('')
  },
}

// Run the CLI
await cli(Bun.argv.slice(2), command, {
  name: 'weather',
  version: '1.0.0',
  description: 'A CLI tool to fetch current weather for any city',
})

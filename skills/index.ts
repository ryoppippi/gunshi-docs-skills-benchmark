import { cli } from 'gunshi'

interface WeatherData {
  current_condition: Array<{
    temp_C: string
    temp_F: string
    humidity: string
    weatherDesc: Array<{ value: string }>
    windspeedKmph: string
    winddir16Point: string
    FeelsLikeC: string
    FeelsLikeF: string
    uvIndex: string
  }>
  nearest_area: Array<{
    areaName: Array<{ value: string }>
    country: Array<{ value: string }>
    region: Array<{ value: string }>
  }>
}

const command = {
  name: 'weather',
  description: 'Fetch and display current weather for a city',
  args: {
    city: {
      type: 'positional' as const,
      description: 'City name to get weather for (e.g., "London", "Tokyo", "New York")'
    },
    fahrenheit: {
      type: 'boolean' as const,
      short: 'f',
      description: 'Display temperature in Fahrenheit instead of Celsius'
    },
    json: {
      type: 'boolean' as const,
      short: 'j',
      description: 'Output raw JSON data'
    }
  },
  examples: `
# Get weather for London
weather London

# Get weather for a city with spaces (use quotes)
weather "New York"

# Display temperature in Fahrenheit
weather Tokyo -f

# Output raw JSON data
weather Paris --json
`.trim(),
  run: async (ctx: {
    values: {
      city: string
      fahrenheit?: boolean
      json?: boolean
    }
  }) => {
    const { city, fahrenheit, json } = ctx.values

    try {
      const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)

      if (!response.ok) {
        console.error(`Error: Failed to fetch weather data (HTTP ${response.status})`)
        process.exit(1)
      }

      const data = await response.json() as WeatherData

      if (json) {
        console.log(JSON.stringify(data, null, 2))
        return
      }

      const current = data.current_condition[0]
      const location = data.nearest_area[0]

      const temp = fahrenheit ? `${current.temp_F}°F` : `${current.temp_C}°C`
      const feelsLike = fahrenheit ? `${current.FeelsLikeF}°F` : `${current.FeelsLikeC}°C`

      const locationName = location.areaName[0].value
      const country = location.country[0].value
      const region = location.region[0].value

      console.log()
      console.log(`Weather for ${locationName}, ${region}, ${country}`)
      console.log('─'.repeat(50))
      console.log(`  Condition:   ${current.weatherDesc[0].value}`)
      console.log(`  Temperature: ${temp} (feels like ${feelsLike})`)
      console.log(`  Humidity:    ${current.humidity}%`)
      console.log(`  Wind:        ${current.windspeedKmph} km/h ${current.winddir16Point}`)
      console.log(`  UV Index:    ${current.uvIndex}`)
      console.log()
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`)
      } else {
        console.error('Error: Failed to fetch weather data')
      }
      process.exit(1)
    }
  }
}

await cli(Bun.argv.slice(2), command, {
  name: 'weather',
  version: '1.0.0',
  description: 'A CLI tool to fetch current weather information'
})
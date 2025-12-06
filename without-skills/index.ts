import { cli, define } from "gunshi";

interface WeatherData {
  current_condition: Array<{
    temp_C: string;
    temp_F: string;
    weatherDesc: Array<{ value: string }>;
    humidity: string;
    windspeedKmph: string;
    winddir16Point: string;
    FeelsLikeC: string;
    FeelsLikeF: string;
  }>;
  nearest_area: Array<{
    areaName: Array<{ value: string }>;
    country: Array<{ value: string }>;
    region: Array<{ value: string }>;
  }>;
}

async function fetchWeather(city: string): Promise<WeatherData> {
  const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch weather: ${response.statusText}`);
  }

  return response.json();
}

function formatWeather(data: WeatherData): string {
  const current = data.current_condition[0];
  const area = data.nearest_area[0];

  const location = `${area.areaName[0].value}, ${area.country[0].value}`;
  const description = current.weatherDesc[0].value;
  const tempC = current.temp_C;
  const tempF = current.temp_F;
  const feelsLikeC = current.FeelsLikeC;
  const feelsLikeF = current.FeelsLikeF;
  const humidity = current.humidity;
  const windSpeed = current.windspeedKmph;
  const windDir = current.winddir16Point;

  const lines = [
    `Weather for ${location}`,
    "",
    `  Condition:   ${description}`,
    `  Temperature: ${tempC}°C / ${tempF}°F`,
    `  Feels Like:  ${feelsLikeC}°C / ${feelsLikeF}°F`,
    `  Humidity:    ${humidity}%`,
    `  Wind:        ${windSpeed} km/h ${windDir}`,
  ];

  const maxLength = Math.max(...lines.map((l) => l.length));
  const width = Math.max(maxLength + 4, 40);

  const horizontalLine = "─".repeat(width - 2);
  const formatLine = (line: string) => `│ ${line.padEnd(width - 4)} │`;

  return [
    `┌${horizontalLine}┐`,
    formatLine(lines[0]),
    `├${horizontalLine}┤`,
    ...lines.slice(2).map(formatLine),
    `└${horizontalLine}┘`,
  ].join("\n");
}

const command = define({
  name: "weather",
  description: "A CLI tool to fetch and display current weather",
  args: {
    city: {
      type: "positional",
      description: "City name to get weather for (e.g., London, Tokyo, 'New York')",
    },
  },
  run: async (ctx) => {
    const { city } = ctx.values;

    try {
      console.log(`Fetching weather for ${city}...`);
      const data = await fetchWeather(city);
      console.log(formatWeather(data));
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : "Failed to fetch weather"}`
      );
      process.exit(1);
    }
  },
});

await cli(process.argv.slice(2), command, {
  name: "weather",
  version: "1.0.0",
});

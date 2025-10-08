import { Cloud, CloudRain, Sun, Wind, CloudSnow, Zap } from 'lucide-react'

// Weather API configuration
const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5'

// Town coordinates for Guanacaste, Costa Rica
export const TOWN_COORDINATES = {
  tamarindo: { lat: 10.2969, lng: -85.8411 },
  nosara: { lat: 9.9763, lng: -85.6528 },
  flamingo: { lat: 10.4333, lng: -85.7833 },
  'playa-grande': { lat: 10.3267, lng: -85.8522 },
  samara: { lat: 9.8803, lng: -85.5267 }
} as const

export type TownKey = keyof typeof TOWN_COORDINATES

export interface WeatherCondition {
  temp: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  icon: any // Lucide icon component
}

export interface WeatherForecast {
  day: string
  high: number
  low: number
  condition: string
  icon: any
}

export interface WeatherData {
  current: WeatherCondition
  forecast: WeatherForecast[]
}

// Cache weather data for 30 minutes
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// Map OpenWeatherMap icons to Lucide icons
const getWeatherIcon = (iconCode: string) => {
  const iconMap: Record<string, any> = {
    '01d': Sun, // clear sky day
    '01n': Sun, // clear sky night
    '02d': Cloud, // few clouds day
    '02n': Cloud, // few clouds night
    '03d': Cloud, // scattered clouds
    '03n': Cloud,
    '04d': Cloud, // broken clouds
    '04n': Cloud,
    '09d': CloudRain, // shower rain
    '09n': CloudRain,
    '10d': CloudRain, // rain
    '10n': CloudRain,
    '11d': Zap, // thunderstorm
    '11n': Zap,
    '13d': CloudSnow, // snow
    '13n': CloudSnow,
    '50d': Wind, // mist
    '50n': Wind
  }

  return iconMap[iconCode] || Sun
}

// Convert Kelvin to Celsius
const kelvinToCelsius = (kelvin: number): number => Math.round(kelvin - 273.15)

// Get day name from date
const getDayName = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

// Fetch current weather
const fetchCurrentWeather = async (lat: number, lng: number): Promise<WeatherCondition> => {
  const response = await fetch(
    `${WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}`
  )

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    temp: kelvinToCelsius(data.main.temp),
    condition: data.weather[0].main,
    description: data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
    icon: getWeatherIcon(data.weather[0].icon)
  }
}

// Fetch 5-day forecast
const fetchWeatherForecast = async (lat: number, lng: number): Promise<WeatherForecast[]> => {
  const response = await fetch(
    `${WEATHER_API_BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&cnt=40`
  )

  if (!response.ok) {
    throw new Error(`Weather forecast API error: ${response.status}`)
  }

  const data = await response.json()

  // Group by day and get min/max temps
  const dailyData = new Map<string, { temps: number[], conditions: string[], icons: string[] }>()

  data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000)
    const dateKey = date.toDateString()

    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, { temps: [], conditions: [], icons: [] })
    }

    const dayData = dailyData.get(dateKey)!
    dayData.temps.push(kelvinToCelsius(item.main.temp))
    dayData.conditions.push(item.weather[0].main)
    dayData.icons.push(item.weather[0].icon)
  })

  // Convert to forecast format (skip today, show next 5 days)
  const forecast: WeatherForecast[] = []
  const entries = Array.from(dailyData.entries()).slice(1, 6) // Skip today, take next 5 days

  entries.forEach(([dateKey, data]) => {
    const high = Math.max(...data.temps)
    const low = Math.min(...data.temps)

    // Get most common condition
    const conditionCounts = data.conditions.reduce((acc: Record<string, number>, condition) => {
      acc[condition] = (acc[condition] || 0) + 1
      return acc
    }, {})

    const mostCommonCondition = Object.entries(conditionCounts)
      .sort(([,a], [,b]) => b - a)[0][0]

    // Get most common icon
    const iconCounts = data.icons.reduce((acc: Record<string, number>, icon) => {
      acc[icon] = (acc[icon] || 0) + 1
      return acc
    }, {})

    const mostCommonIcon = Object.entries(iconCounts)
      .sort(([,a], [,b]) => b - a)[0][0]

    forecast.push({
      day: getDayName(dateKey),
      high: Math.round(high),
      low: Math.round(low),
      condition: mostCommonCondition,
      icon: getWeatherIcon(mostCommonIcon)
    })
  })

  return forecast
}

// Main weather fetching function with caching
export const fetchWeatherData = async (town: TownKey): Promise<WeatherData> => {
  const cacheKey = `weather_${town}`
  const cached = weatherCache.get(cacheKey)

  // Return cached data if it's still fresh
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const coordinates = TOWN_COORDINATES[town]

  try {
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(coordinates.lat, coordinates.lng),
      fetchWeatherForecast(coordinates.lat, coordinates.lng)
    ])

    const weatherData: WeatherData = { current, forecast }

    // Cache the result
    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() })

    return weatherData
  } catch (error) {
    console.error('Error fetching weather data:', error)

    // Return fallback data if API fails
    return getFallbackWeatherData(town)
  }
}

// Fallback weather data for when API is unavailable
const getFallbackWeatherData = (town: TownKey): WeatherData => {
  const baseTemp = 28 // Base temperature for Guanacaste
  const tempVariation = Math.random() * 4 - 2 // ±2°C variation

  return {
    current: {
      temp: Math.round(baseTemp + tempVariation),
      condition: 'Partly Cloudy',
      description: 'Partly cloudy with pleasant weather',
      humidity: 70 + Math.floor(Math.random() * 20), // 70-90%
      windSpeed: 10 + Math.floor(Math.random() * 10), // 10-20 km/h
      icon: Cloud
    },
    forecast: [
      { day: 'Today', high: Math.round(baseTemp + 2), low: Math.round(baseTemp - 3), condition: 'Sunny', icon: Sun },
      { day: 'Tomorrow', high: Math.round(baseTemp + 1), low: Math.round(baseTemp - 2), condition: 'Partly Cloudy', icon: Cloud },
      { day: 'Wednesday', high: Math.round(baseTemp + 3), low: Math.round(baseTemp - 1), condition: 'Light Rain', icon: CloudRain },
      { day: 'Thursday', high: Math.round(baseTemp + 2), low: Math.round(baseTemp - 2), condition: 'Sunny', icon: Sun },
      { day: 'Friday', high: Math.round(baseTemp + 1), low: Math.round(baseTemp - 3), condition: 'Sunny', icon: Sun }
    ]
  }
}

// React hook for weather data
export const useWeather = (town: TownKey) => {
  const [weatherData, setWeatherData] = React.useState<WeatherData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchWeatherData(town)
        setWeatherData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weather data')
        // Set fallback data
        setWeatherData(getFallbackWeatherData(town))
      } finally {
        setLoading(false)
      }
    }

    loadWeather()
  }, [town])

  return { weatherData, loading, error }
}

// Import React for the hook
import React from 'react'
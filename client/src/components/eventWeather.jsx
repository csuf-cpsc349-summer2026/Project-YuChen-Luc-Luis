import { useEffect, useState } from "react";
import { getEventWeather } from "../services/weatherApi.js";

const weatherDescriptions = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorms",
    96: "Thunderstorms",
    99: "Severe thunderstorms"
};

function EventWeather({ city, state, date }) {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!city || !date) {
            setWeather(null);
            setMessage("Venue weather unavailable.");
            return;
        }

        let cancelled = false;

        async function loadWeather() {
            setLoading(true);
            setMessage("");

            try {
                const result = await getEventWeather(city, state, date);

                if (cancelled) {
                    return;
                }

                if (!result.available) {
                    setWeather(null);
                    setMessage(
                        result.message || "Forecast not available yet."
                    );
                    return;
                }

                setWeather(result);
            } catch (error) {
                console.error("Event weather error:", error);

                if (!cancelled) {
                    setWeather(null);
                    setMessage("Venue weather unavailable.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadWeather();

        return () => {
            cancelled = true;
        };
    }, [city, state, date]);

    if (loading) {
        return (
            <p className="event-weather">
                <strong>Weather:</strong> Loading forecast...
            </p>
        );
    }

    if (!weather) {
        return (
            <p className="event-weather">
                <strong>Weather:</strong>{" "}
                {message || "Forecast not available yet."}
            </p>
        );
    }

    const description =
        weatherDescriptions[weather.weatherCode] ||
        "Forecast available";

    return (
        <div className="event-weather">
            <p>
                <strong>Weather:</strong> {description}
            </p>

            <p>
                <strong>Temperature:</strong>{" "}
                {Math.round(weather.high)}°F high /{" "}
                {Math.round(weather.low)}°F low
            </p>

            <p>
                <strong>Rain chance:</strong>{" "}
                {weather.precipitationChance ?? 0}%
            </p>
        </div>
    );
}

export default EventWeather;
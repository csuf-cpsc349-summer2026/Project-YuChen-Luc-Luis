import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLocation } from "../services/locationApi.js";

function HomePage() {
    const [artistName, setArtistName] = useState("");

    const [location, setLocation] = useState({
        city: "Loading...",
        region: "Loading...",
        country: "Loading...",
    });

    const [locationError, setLocationError] = useState("");

    const [weather, setWeather] = useState({
        temperature: "--",
        feelsLike: "--",
        windSpeed: "--",
    });

    const navigate = useNavigate();

    useEffect(() => {
        async function loadLocationAndWeather() {
            try {
                setLocationError("");

                const data = await getLocation();

                setLocation({
                    city: data.city,
                    region: data.region,
                    country: data.country,
                });

                const params = new URLSearchParams({
                    city: data.city,
                    state: data.region,
                });

                const weatherResponse = await fetch(
                    `http://localhost:3000/api/weather/current?${params}`,
                    {
                        credentials: "include",
                    }
                );

                const weatherData = await weatherResponse.json();

                if (!weatherResponse.ok) {
                    throw new Error(
                        weatherData.error ||
                        "Could not load current weather."
                    );
                }

                setWeather({
                    temperature: weatherData.temperature,
                    feelsLike: weatherData.feelsLike,
                    windSpeed: weatherData.windSpeed,
                });
            } catch (error) {
                console.error(
                    "Homepage location/weather error:",
                    error
                );

                setLocation({
                    city: "Unavailable",
                    region: "Unavailable",
                    country: "Unavailable",
                });

                setWeather({
                    temperature: "--",
                    feelsLike: "--",
                    windSpeed: "--",
                });

                setLocationError(
                    "Could not load your location or weather."
                );
            }
        }

        loadLocationAndWeather();
    }, []);

    function handleSearch() {
        const trimmedArtist = artistName.trim();

        if (!trimmedArtist) {
            return;
        }

        navigate(
            `/search?artist=${encodeURIComponent(trimmedArtist)}`
        );
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            handleSearch();
        }
    }

    return (
        <>
            <section id="search-section">
                <h2>🎤 Search Artist</h2>

                <p className="search-description">
                    Search for artists, view their details, and save your
                    favorites.
                </p>

                <div className="home-search-controls">
                    <input
                        type="text"
                        id="home-artist-input"
                        placeholder="Enter artist name..."
                        value={artistName}
                        onChange={(event) =>
                            setArtistName(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                    />

                    <button
                        type="button"
                        id="home-search-btn"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </div>
            </section>

            <section id="location-section">
                <h2>📍 Your Current Location</h2>

                <div id="location-card">
                    <p>
                        <strong>City:</strong> {location.city}
                    </p>

                    <p>
                        <strong>Region:</strong> {location.region}
                    </p>

                    <p>
                        <strong>Country:</strong> {location.country}
                    </p>

                    {locationError && (
                        <p className="error-message">
                            {locationError}
                        </p>
                    )}
                </div>
            </section>

            <section id="weather-section">
                <h2>☀️ Current Weather</h2>

                <div id="weather-card">
                    <p>
                        <strong>Temperature:</strong>{" "}
                        {weather.temperature} °F
                    </p>

                    <p>
                        <strong>Feels Like:</strong>{" "}
                        {weather.feelsLike} °F
                    </p>

                    <p>
                        <strong>Wind Speed:</strong>{" "}
                        {weather.windSpeed} mph
                    </p>
                </div>
            </section>
        </>
    );
}

export default HomePage;
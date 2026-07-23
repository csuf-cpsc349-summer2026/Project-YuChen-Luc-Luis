import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLocation } from "../services/locationApi.js";
import { getWeather } from "../services/weatherApi.js";

function HomePage() {
    const [artistName, setArtistName] = useState("");

    const [location, setLocation] = useState({
        city: "Loading...",
        region: "Loading...",
        country: "Loading...",
    });

    const [locationError, setLocationError] = useState("");
    const navigate = useNavigate();
    const [weather, setWeather] = useState({
    temperature: "--",
    });

    useEffect(() => {
        async function loadLocation() {
            try {
                const data = await getLocation();

                setLocation({
                    city: data.city,
                    region: data.region,
                    country: data.country,
                });

                const weatherData = await getWeather(
                    data.latitude,
                    data.longitude
                );

                setWeather({
                    temperature: weatherData.temperature,
                });
            } catch (error) {
                console.error(error);

                setLocation({
                    city: "Unavailable",
                    region: "Unavailable",
                    country: "Unavailable",
                });

                setWeather({
                    temperature: "--",
                });

                setLocationError("Could not load your location or weather.");
            }
        }
        

        loadLocation();
    }, []);

    function handleSearch() {
        const trimmedArtist = artistName.trim();

        if (!trimmedArtist) {
            return;
        }

        navigate(`/search?artist=${encodeURIComponent(trimmedArtist)}`);
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            handleSearch();
        }
    }

    return (
        <>
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

                    {locationError && <p>{locationError}</p>}
                </div>
            </section>

            <section id="weather-section">
                <h2>☀️ Current Weather</h2>

                <div id="weather-card">
                    <p>
                        <strong>Temperature:</strong> {weather.temperature} °C
                    </p>
                </div>
            </section>

            <section id="search-section">
                <h2>🎤 Search Artist</h2>

                <input
                    type="text"
                    id="artist-input"
                    placeholder="Enter artist name..."
                    value={artistName}
                    onChange={(event) => setArtistName(event.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <button
                    type="button"
                    id="search-btn"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </section>
        </>
    );
}

export default HomePage;
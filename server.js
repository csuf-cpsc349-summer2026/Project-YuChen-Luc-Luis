import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import SpotifyWebApi from "spotify-web-api-node";

dotenv.config();

console.log(
    "Ticketmaster loaded:",
    Boolean(process.env.TICKETMASTER_API_KEY)
);

const app = express();
const PORT = process.env.PORT || 3000;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Music Discovery API is running.");
});

async function authenticateSpotify() {
    const tokenData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(tokenData.body.access_token);
}

app.get("/api/search", async (request, response) => {
    try {
        const query = request.query.query?.trim();

        if (!query) {
            return response.status(400).json({
                error: "Search query is required."
            });
        }

        await authenticateSpotify();

        const searchData = await spotifyApi.searchArtists(query, {
            limit: 10
        });

        const artists = searchData.body.artists.items.map((artist) => ({
            id: artist.id,
            name: artist.name,
            image: artist.images?.[0]?.url || "",
            genres: artist.genres || [],
            popularity: artist.popularity ?? null,
            followers: artist.followers?.total ?? 0
        }));

        return response.json(artists);
    } catch (error) {
        console.error(
            "Spotify search failed:",
            error.body || error.message
        );

        return response.status(error.statusCode || 500).json({
            error: "Unable to search Spotify."
        });
    }
});

app.get("/api/artist/:id", async (request, response) => {
    try {
        const artistId = request.params.id?.trim();

        console.log("Server received artist ID:", JSON.stringify(artistId));

        if (!artistId) {
            return response.status(400).json({
                error: "Artist ID is required."
            });
        }

        await authenticateSpotify();

        const artistData = await spotifyApi.getArtist(artistId);
        const artist = artistData.body;

        return response.json({
            id: artist.id,
            name: artist.name,
            image: artist.images?.[0]?.url || "",
            spotifyUrl: artist.external_urls?.spotify || "",
            genres: artist.genres || [],
            popularity: artist.popularity ?? null,
            followers: artist.followers?.total ?? 0
        });
    } catch (error) {
        console.error(
            "Artist endpoint error:",
            error.body || error.message
        );

        return response.status(error.statusCode || 500).json({
            error: "Unable to load artist information."
        });
    }
});

app.get("/api/events", async (req, res) => {
    const artist = req.query.artist?.trim();

    if (!artist) {
        return res.status(400).json({
            error: "Artist name is required."
        });
    }

    if (!process.env.TICKETMASTER_API_KEY) {
        return res.status(500).json({
            error: "Ticketmaster API key is missing."
        });
    }

    const params = new URLSearchParams({
        apikey: process.env.TICKETMASTER_API_KEY,
        keyword: artist,
        classificationName: "music",
        countryCode: "US",
        size: "20",
        sort: "date,asc"
    });

    try {
        const response = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?${params}`
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Ticketmaster response:", data);

            return res.status(response.status).json({
                error: "Ticketmaster request failed."
            });
        }

        const events = data._embedded?.events ?? [];

        const formattedEvents = events.map((event) => {
            const venue = event._embedded?.venues?.[0];

            const eventImage =
                event.images?.find(
                    (image) =>
                        image.ratio === "16_9" &&
                        image.width >= 640
                )?.url ||
                event.images?.find(
                    (image) => image.ratio === "16_9"
                )?.url ||
                event.images?.[0]?.url ||
                "";

            return {
                id: event.id,
                name: event.name,
                image: eventImage,
                date: event.dates?.start?.localDate ?? "",
                time: event.dates?.start?.localTime ?? "",
                venue: venue?.name ?? "Venue unavailable",
                city: venue?.city?.name ?? "",
                state:
                    venue?.state?.stateCode ??
                    venue?.state?.name ??
                    "",
                ticketUrl: event.url ?? ""
            };
        });

        return res.json({
            events: formattedEvents
        });
    } catch (error) {
        console.error("Ticketmaster error:", error);

        return res.status(500).json({
            error: "Could not load Ticketmaster events."
        });
    }
});

app.get("/api/weather", async (req, res) => {
    const city = req.query.city?.trim();
    const state = req.query.state?.trim();
    const date = req.query.date?.trim();

    if (!city) {
        return res.status(400).json({
            error: "A venue city is required."
        });
    }

    if (!date) {
        return res.status(400).json({
            error: "An event date is required."
        });
    }

    try {
        const eventDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(eventDate.getTime())) {
            return res.status(400).json({
                error: "The event date is invalid."
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const daysAway = Math.round(
            (eventDate.getTime() - today.getTime()) /
                millisecondsPerDay
        );

        if (daysAway < 0 || daysAway > 15) {
            return res.json({
                available: false,
                message: "Forecast not available yet."
            });
        }

        const geocodeParams = new URLSearchParams({
            name: city,
            count: "10",
            language: "en",
            format: "json",
            countryCode: "US"
        });

        const geocodeResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?${geocodeParams}`
        );

        const geocodeData = await geocodeResponse.json();

        if (!geocodeResponse.ok) {
            console.error(
                "Open-Meteo geocoding response:",
                geocodeData
            );

            throw new Error("Unable to locate the venue city.");
        }

        const locations = geocodeData.results ?? [];
        const requestedState = state?.toLowerCase() ?? "";

        const location =
            locations.find((result) => {
                const adminName =
                    result.admin1?.toLowerCase() ?? "";

                const adminCode =
                    result.admin1_code
                        ?.split("-")
                        .at(-1)
                        ?.toLowerCase() ?? "";

                return (
                    !requestedState ||
                    adminName === requestedState ||
                    adminName.startsWith(requestedState) ||
                    adminCode === requestedState
                );
            }) ?? locations[0];

        if (!location) {
            return res.status(404).json({
                available: false,
                message: "Venue location could not be found."
            });
        }

        const weatherParams = new URLSearchParams({
            latitude: String(location.latitude),
            longitude: String(location.longitude),
            daily: [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_probability_max"
            ].join(","),
            temperature_unit: "fahrenheit",
            timezone: "auto",
            start_date: date,
            end_date: date
        });

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?${weatherParams}`
        );

        const weatherData = await weatherResponse.json();

        if (!weatherResponse.ok) {
            console.error(
                "Open-Meteo weather response:",
                weatherData
            );

            throw new Error("Unable to retrieve the forecast.");
        }

        if (!weatherData.daily?.time?.length) {
            return res.json({
                available: false,
                message: "Forecast not available yet."
            });
        }

        return res.json({
            available: true,
            date: weatherData.daily.time[0],
            weatherCode: weatherData.daily.weather_code[0],
            high: weatherData.daily.temperature_2m_max[0],
            low: weatherData.daily.temperature_2m_min[0],
            precipitationChance:
                weatherData.daily.precipitation_probability_max[0],
            location: {
                city: location.name,
                state: location.admin1 ?? state ?? ""
            }
        });
    } catch (error) {
        console.error(
            "Weather route error:",
            error.message
        );

        return res.status(500).json({
            error:
                error.message ||
                "Unable to retrieve venue weather."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
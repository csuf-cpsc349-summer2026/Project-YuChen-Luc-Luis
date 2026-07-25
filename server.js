import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import SpotifyWebApi from "spotify-web-api-node";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

app.use(cors());
app.use(express.json());

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

            return {
                id: event.id,
                name: event.name,
                image: event.images?.[0]?.url ?? "",
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

        res.json({
            events: formattedEvents
        });
    } catch (error) {
        console.error("Ticketmaster error:", error);

        res.status(500).json({
            error: "Could not load Ticketmaster events."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
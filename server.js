require("dotenv").config();

const express = require("express");
const path = require("path");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();
const PORT = 3000;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

app.use(express.static(path.join(__dirname)));

app.get("/api/search", async (request, response) => {
    try {
        const query = request.query.query?.trim();

        if (!query) {
            return response.status(400).json({
                error: "Search query is required."
            });
        }

        const tokenData = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(tokenData.body.access_token);

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

        response.json(artists);
    } catch (error) {
        console.error(
            "Spotify search failed:",
            error.body || error.message
        );

        response.status(500).json({
            error: "Unable to search Spotify."
        });
    }
});

app.get("/api/artist/:id", async (request, response) => {
    try {
        const artistId = request.params.id;

        console.log("Artist endpoint reached:", artistId);

        const tokenData = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(tokenData.body.access_token);

        console.log("Spotify token received");

        const artistData = await spotifyApi.getArtist(artistId);
        const artist = artistData.body;

        console.log("Artist received:", artist.name);

        response.json({
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

        response.status(error.statusCode || 500).json({
            error: "Unable to load artist information."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
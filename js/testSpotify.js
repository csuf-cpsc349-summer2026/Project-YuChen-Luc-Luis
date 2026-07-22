const spotifyApi = require("./spotify");

async function getArtistPageData(artistName) {
    try {
        // Get an app access token
        const tokenData = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(tokenData.body.access_token);

        // Search for the artist
        const searchResults = await spotifyApi.searchArtists(artistName);
        const artists = searchResults.body.artists.items;

        if (artists.length === 0) {
            console.log(`No artist found for "${artistName}".`);
            return;
        }

        const artist = artists[0];

        console.log("\nArtist Information");
        console.log("------------------");
        console.log("Name:", artist.name);

        console.log(
            "Genres:",
            artist.genres?.join(", ") || "Not available"
        );

        console.log(
            "Followers:",
            artist.followers?.total?.toLocaleString() || "Not available"
        );

        console.log(
            "Popularity:",
            artist.popularity !== undefined
                ? `${artist.popularity}/100`
                : "Not available"
        );

        console.log(
            "Image:",
            artist.images?.[0]?.url || "Not available"
        );

        console.log(
            "Spotify:",
            artist.external_urls?.spotify || "Not available"
        );

        // Get albums and singles
        const albumResults = await spotifyApi.getArtistAlbums(artist.id, {
            include_groups: "album,single",
            country: "US",
            limit: 10,
        });

        // Remove duplicate release names
        const uniqueReleases = [];
        const seenNames = new Set();

        for (const album of albumResults.body.items) {
            const normalizedName = album.name.toLowerCase();

            if (!seenNames.has(normalizedName)) {
                seenNames.add(normalizedName);
                uniqueReleases.push(album);
            }
        }

        console.log("\nRecent Releases");
        console.log("------------------");

        uniqueReleases.slice(0, 5).forEach((album, index) => {
            console.log(`${index + 1}. ${album.name}`);
            console.log(`   Type: ${album.album_type}`);
            console.log(`   Released: ${album.release_date}`);

            console.log(
                `   Image: ${album.images?.[0]?.url || "Not available"}`
            );

            console.log(
                `   Spotify: ${
                    album.external_urls?.spotify || "Not available"
                }`
            );
        });
    } catch (error) {
        console.error(
            "Spotify request failed:",
            error.body || error.message
        );
    }
}

getArtistPageData("The Weeknd");
require("dotenv").config();

const AUDIO_DB_API_KEY = process.env.AUDIODB_API_KEY;

if (!AUDIO_DB_API_KEY) {
    throw new Error("Missing AUDIODB_API_KEY in .env");
}

async function getAudioDbArtistData(artistName) {
    if (!artistName || !artistName.trim()) {
        throw new Error("An artist name is required.");
    }

    const encodedArtistName = encodeURIComponent(artistName.trim());

    const url =
        `https://www.theaudiodb.com/api/v1/json/` +
        `${AUDIO_DB_API_KEY}/search.php?s=${encodedArtistName}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `TheAudioDB request failed: ${response.status} ${response.statusText}`
        );
    }

    const data = await response.json();
    const artists = data.artists;

    if (!artists || artists.length === 0) {
        return null;
    }

    const artist = artists[0];

    return {
        id: artist.idArtist,
        name: artist.strArtist,
        biography: artist.strBiographyEN || "Biography not available",
        country: artist.strCountry || "Country not available",
        genre: artist.strGenre || "Genre not available",
        style: artist.strStyle || "Style not available",
        mood: artist.strMood || "Mood not available",
        formedYear: artist.intFormedYear || "Not available",
        website: artist.strWebsite || "",
        facebook: artist.strFacebook || "",
        twitter: artist.strTwitter || "",

        images: {
            thumbnail: artist.strArtistThumb || "",
            logo: artist.strArtistLogo || "",
            banner: artist.strArtistBanner || "",
            fanArt: artist.strArtistFanart || "",
            wideThumbnail: artist.strArtistWideThumb || "",
        },
    };
}

module.exports = {
    getAudioDbArtistData,
};
export async function getArtist(artistId) {
    console.log("Artist API ID:", artistId);

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/artist/${encodeURIComponent(
            artistId
        )}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
                "Unable to load artist information."
        );
    }

    return data;
}
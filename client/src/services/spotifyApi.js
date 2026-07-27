export async function searchArtists(artistName) {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search?query=${encodeURIComponent(
            artistName
        )}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Artist search failed."
        );
    }

    return data;
}
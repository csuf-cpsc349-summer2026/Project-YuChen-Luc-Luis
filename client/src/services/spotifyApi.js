export async function searchArtists(artistName) {
    const response = await fetch(
        `http://localhost:3000/api/search?query=${encodeURIComponent(artistName)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Artist search failed.");
    }

    return data;
}
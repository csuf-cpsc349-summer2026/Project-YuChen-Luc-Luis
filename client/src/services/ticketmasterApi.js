const API_BASE_URL =
    import.meta.env.VITE_API_URL;

export async function searchEvents(artist) {
    const params = new URLSearchParams({
        artist
    });

    const response = await fetch(
        `${API_BASE_URL}/api/events?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
                "Unable to load Ticketmaster events."
        );
    }

    return data.events || [];
}
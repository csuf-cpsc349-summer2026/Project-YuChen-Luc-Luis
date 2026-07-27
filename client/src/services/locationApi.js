export async function getLocation() {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/location`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to fetch location."
        );
    }

    return data;
}
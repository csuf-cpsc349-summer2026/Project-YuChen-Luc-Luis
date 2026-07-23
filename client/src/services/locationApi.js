export async function getLocation() {
    const response = await fetch("http://ip-api.com/json/");

    if (!response.ok) {
        throw new Error("Failed to fetch location.");
    }

    const data = await response.json();

    return {
        city: data.city,
        region: data.regionName,
        country: data.country,
        latitude: data.lat,
        longitude: data.lon,
    };
}
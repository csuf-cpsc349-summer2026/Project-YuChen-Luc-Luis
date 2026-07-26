export async function getLocation() {
    const response = await fetch("https://ipapi.co/json/");

    if (!response.ok) {
        throw new Error("Failed to fetch location.");
    }

    const data = await response.json();

    return {
        city: data.city,
        region: data.region,
        country: data.country_name,
        latitude: data.latitude,
        longitude: data.longitude,
    };
}
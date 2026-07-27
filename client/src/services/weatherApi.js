const API_BASE_URL =
    import.meta.env.VITE_API_URL;

export async function getCurrentWeather(
    latitude,
    longitude
) {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: "temperature_2m",
        temperature_unit: "celsius",
        timezone: "auto"
    });

    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            "Unable to load current weather."
        );
    }

    return {
        temperature:
            data.current?.temperature_2m ?? "--"
    };
}

export async function getEventWeather(
    city,
    state,
    date
) {
    const params = new URLSearchParams({
        city,
        date
    });

    if (state) {
        params.set("state", state);
    }

    const response = await fetch(
        `${API_BASE_URL}/api/weather?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
                "Unable to load venue weather."
        );
    }

    return data;
}
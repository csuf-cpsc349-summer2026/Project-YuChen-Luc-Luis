const API_BASE_URL =
    import.meta.env.VITE_API_URL;

export async function getCurrentWeather(
    latitude,
    longitude
) {
    if (
        typeof latitude !== "number" ||
        typeof longitude !== "number"
    ) {
        throw new Error(
            "Valid coordinates are required to load weather."
        );
    }

    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),

        current: [
            "temperature_2m",
            "apparent_temperature",
            "wind_speed_10m",
        ].join(","),

        temperature_unit: "fahrenheit",
        wind_speed_unit: "mph",
        timezone: "auto",
    });

    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.reason ||
            "Unable to load current weather."
        );
    }

    if (!data.current) {
        throw new Error(
            "Current weather data is unavailable."
        );
    }

    return {
        temperature:
            data.current.temperature_2m ?? "--",

        feelsLike:
            data.current.apparent_temperature ?? "--",

        windSpeed:
            data.current.wind_speed_10m ?? "--",
    };
}

export async function getEventWeather(
    city,
    state,
    date
) {
    const params = new URLSearchParams({
        city,
        date,
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
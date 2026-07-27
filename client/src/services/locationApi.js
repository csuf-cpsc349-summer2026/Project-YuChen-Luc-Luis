function getBrowserCoordinates() {
    return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
            reject(
                new Error(
                    "Geolocation is not supported by this browser."
                )
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject(
                            new Error(
                                "Location permission was denied. Please allow location access in your browser."
                            )
                        );
                        break;

                    case error.POSITION_UNAVAILABLE:
                        reject(
                            new Error(
                                "Your current location is unavailable."
                            )
                        );
                        break;

                    case error.TIMEOUT:
                        reject(
                            new Error(
                                "The location request timed out."
                            )
                        );
                        break;

                    default:
                        reject(
                            new Error(
                                "Unable to determine your current location."
                            )
                        );
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    });
}

async function reverseGeocode(latitude, longitude) {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        localityLanguage: "en",
    });

    const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`
    );

    if (!response.ok) {
        throw new Error(
            "Unable to determine the city for your location."
        );
    }

    const data = await response.json();

    return {
        city:
            data.city ||
            data.locality ||
            data.principalSubdivision ||
            "Unavailable",

        region:
            data.principalSubdivision ||
            "Unavailable",

        country:
            data.countryName ||
            "Unavailable",
    };
}

export async function getLocation() {
    const coordinates =
        await getBrowserCoordinates();

    const locationDetails =
        await reverseGeocode(
            coordinates.latitude,
            coordinates.longitude
        );

    return {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        city: locationDetails.city,
        region: locationDetails.region,
        country: locationDetails.country,
    };
}
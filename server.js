import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import SpotifyWebApi from "spotify-web-api-node";
import session from "express-session";
import crypto from "crypto";

dotenv.config();

console.log(
    "Ticketmaster loaded:",
    Boolean(process.env.TICKETMASTER_API_KEY)
);

console.log(
    "Session secret loaded:",
    Boolean(process.env.SESSION_SECRET)
);

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(
                new Error(`CORS blocked origin: ${origin}`)
            );
        },
        credentials: true
    })
);

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "temporary-development-session-secret",
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        }
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Music Discovery API is running.");
});

let spotifyTokenExpirationTime = 0;

async function authenticateSpotify() {
    const now = Date.now();

    if (
        spotifyApi.getAccessToken() &&
        now < spotifyTokenExpirationTime
    ) {
        return;
    }

    const tokenData =
        await spotifyApi.clientCredentialsGrant();

    spotifyApi.setAccessToken(
        tokenData.body.access_token
    );

    const expiresInSeconds =
        tokenData.body.expires_in ?? 3600;

    spotifyTokenExpirationTime =
        now + (expiresInSeconds - 60) * 1000;
}

app.get("/api/search", async (req, res) => {
    try {
        const query = req.query.query?.trim();

        if (!query) {
            return res.status(400).json({
                error: "Search query is required."
            });
        }

        await authenticateSpotify();

        const searchData =
            await spotifyApi.searchArtists(query, {
                limit: 10
            });

        const artists =
            searchData.body.artists.items.map(
                (artist) => ({
                    id: artist.id,
                    name: artist.name,
                    image:
                        artist.images?.[0]?.url || "",
                    popularity:
                        artist.popularity ?? 0,
                    spotifyUrl:
                        artist.external_urls
                            ?.spotify || ""
                })
            );

        return res.json(artists);
    } catch (error) {
        console.error(
            "Spotify search failed:",
            error.body || error.message
        );

        return res
            .status(error.statusCode || 500)
            .json({
                error: "Unable to search Spotify."
            });
    }
});

app.get("/api/artist/:id", async (req, res) => {
    try {
        const artistId = req.params.id?.trim();

        if (!artistId) {
            return res.status(400).json({
                error: "Artist ID is required."
            });
        }

        await authenticateSpotify();

        const [
            artistData,
            albumsData
        ] = await Promise.all([
            spotifyApi.getArtist(artistId),

            spotifyApi.getArtistAlbums(
                artistId,
                {
                    include_groups: "album,single",
                    market: "US",
                    limit: 10
                }
            )
        ]);

        const artist = artistData.body;

        const albums = albumsData.body.items
            .filter(
                (album, index, allAlbums) =>
                    index ===
                    allAlbums.findIndex(
                        (item) =>
                            item.name.toLowerCase() ===
                            album.name.toLowerCase()
                    )
            )
            .slice(0, 6)
            .map((album) => ({
                id: album.id,
                name: album.name,
                image:
                    album.images?.[0]?.url || "",
                releaseDate:
                    album.release_date || "",
                albumType:
                    album.album_type || "",
                spotifyUrl:
                    album.external_urls?.spotify ||
                    ""
            }));

        return res.json({
            id: artist.id,
            name: artist.name,
            image:
                artist.images?.[0]?.url || "",
            spotifyUrl:
                artist.external_urls?.spotify ||
                "",
            albums
            
        });
    } catch (error) {
        console.error(
            "Artist endpoint error:",
            error.body || error.message
        );

        return res
            .status(error.statusCode || 500)
            .json({
                error:
                    "Unable to load artist information."
            });
    }
});

app.get("/api/events", async (req, res) => {
    const artist = req.query.artist?.trim();

    if (!artist) {
        return res.status(400).json({
            error: "Artist name is required."
        });
    }

    if (!process.env.TICKETMASTER_API_KEY) {
        return res.status(500).json({
            error:
                "Ticketmaster API key is missing."
        });
    }

    const params = new URLSearchParams({
        apikey:
            process.env.TICKETMASTER_API_KEY,
        keyword: artist,
        classificationName: "music",
        countryCode: "US",
        size: "20",
        sort: "date,asc"
    });

    try {
        const ticketmasterResponse =
            await fetch(
                `https://app.ticketmaster.com/discovery/v2/events.json?${params}`
            );

        const data =
            await ticketmasterResponse.json();

        if (!ticketmasterResponse.ok) {
            console.error(
                "Ticketmaster response:",
                data
            );

            return res
                .status(
                    ticketmasterResponse.status
                )
                .json({
                    error:
                        "Ticketmaster request failed."
                });
        }

        const events =
            data._embedded?.events ?? [];

        const formattedEvents = events.map(
            (event) => {
                const venue =
                    event._embedded?.venues?.[0];

                const eventImage =
                    event.images?.find(
                        (image) =>
                            image.ratio === "16_9" &&
                            image.width >= 640
                    )?.url ||
                    event.images?.find(
                        (image) =>
                            image.ratio === "16_9"
                    )?.url ||
                    event.images?.[0]?.url ||
                    "";

                return {
                    id: event.id,
                    name: event.name,
                    image: eventImage,
                    date:
                        event.dates?.start
                            ?.localDate ?? "",
                    time:
                        event.dates?.start
                            ?.localTime ?? "",
                    venue:
                        venue?.name ??
                        "Venue unavailable",
                    city:
                        venue?.city?.name ?? "",
                    state:
                        venue?.state?.stateCode ??
                        venue?.state?.name ??
                        "",
                    ticketUrl:
                        event.url ?? ""
                };
            }
        );

        return res.json({
            events: formattedEvents
        });
    } catch (error) {
        console.error(
            "Ticketmaster error:",
            error
        );

        return res.status(500).json({
            error:
                "Could not load Ticketmaster events."
        });
    }
});

app.get(
    "/api/insights/concerts-by-state",
    async (req, res) => {
        if (!process.env.TICKETMASTER_API_KEY) {
            return res.status(500).json({
                error: "Ticketmaster API key is missing."
            });
        }

        try {
            const now = new Date()
                .toISOString()
                .replace(/\.\d{3}Z$/, "Z");

            const params = new URLSearchParams({
                apikey:
                    process.env.TICKETMASTER_API_KEY,
                classificationName: "music",
                countryCode: "US",
                startDateTime: now,
                sort: "date,asc",
                size: "200"
            });

            const url =
                `https://app.ticketmaster.com/discovery/v2/events.json?${params}`;

            console.log(
                "Concert insights URL:",
                url.replace(
                    process.env.TICKETMASTER_API_KEY,
                    "HIDDEN_API_KEY"
                )
            );

            const ticketmasterResponse =
                await fetch(url);

            const ticketmasterData =
                await ticketmasterResponse.json();

            if (!ticketmasterResponse.ok) {
                console.error(
                    "Ticketmaster insights response:",
                    ticketmasterData
                );

                return res
                    .status(
                        ticketmasterResponse.status
                    )
                    .json({
                        error:
                            ticketmasterData
                                .fault?.faultstring ||
                            ticketmasterData
                                .message ||
                            "Ticketmaster request failed.",
                        details:
                            ticketmasterData
                    });
            }

            const events =
                ticketmasterData._embedded
                    ?.events ?? [];

            const stateCounts =
                events.reduce(
                    (counts, event) => {
                        const venue =
                            event._embedded
                                ?.venues?.[0];

                        const state =
                            venue?.state
                                ?.name ||
                            venue?.state
                                ?.stateCode;

                        if (!state) {
                            return counts;
                        }

                        counts[state] =
                            (counts[state] ||
                                0) + 1;

                        return counts;
                    },
                    {}
                );

            const concertsByState =
                Object.entries(
                    stateCounts
                )
                    .map(
                        ([
                            state,
                            concerts
                        ]) => ({
                            state,
                            concerts
                        })
                    )
                    .sort(
                        (a, b) =>
                            b.concerts -
                            a.concerts
                    )
                    .slice(0, 10);

            return res.json({
                concertsByState,
                totalConcerts:
                    events.length,
                statesRepresented:
                    Object.keys(
                        stateCounts
                    ).length,
                busiestState:
                    concertsByState[0]
                        ?.state || null
            });
        } catch (error) {
            console.error(
                "Concert insights error:",
                error
            );

            return res.status(500).json({
                error:
                    error.message ||
                    "Unable to load concert insights."
            });
        }
    }
);

app.get("/api/weather", async (req, res) => {
    const city = req.query.city?.trim();
    const state = req.query.state?.trim();
    const date = req.query.date?.trim();

    if (!city) {
        return res.status(400).json({
            error: "A venue city is required."
        });
    }

    if (!date) {
        return res.status(400).json({
            error: "An event date is required."
        });
    }

    try {
        const eventDate = new Date(
            `${date}T00:00:00`
        );

        if (
            Number.isNaN(
                eventDate.getTime()
            )
        ) {
            return res.status(400).json({
                error:
                    "The event date is invalid."
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const millisecondsPerDay =
            1000 * 60 * 60 * 24;

        const daysAway = Math.round(
            (eventDate.getTime() -
                today.getTime()) /
                millisecondsPerDay
        );

        if (
            daysAway < 0 ||
            daysAway > 15
        ) {
            return res.json({
                available: false,
                message:
                    "Forecast not available yet."
            });
        }

        const geocodeParams =
            new URLSearchParams({
                name: city,
                count: "10",
                language: "en",
                format: "json",
                countryCode: "US"
            });

        const geocodeResponse =
            await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?${geocodeParams}`
            );

        const geocodeData =
            await geocodeResponse.json();

        if (!geocodeResponse.ok) {
            throw new Error(
                "Unable to locate the venue city."
            );
        }

        const locations =
            geocodeData.results ?? [];

        const requestedState =
            state?.toLowerCase() ?? "";

        const location =
            locations.find((result) => {
                const adminName =
                    result.admin1
                        ?.toLowerCase() ?? "";

                const adminCode =
                    result.admin1_code
                        ?.split("-")
                        .at(-1)
                        ?.toLowerCase() ?? "";

                return (
                    !requestedState ||
                    adminName ===
                        requestedState ||
                    adminName.startsWith(
                        requestedState
                    ) ||
                    adminCode ===
                        requestedState
                );
            }) ?? locations[0];

        if (!location) {
            return res.status(404).json({
                available: false,
                message:
                    "Venue location could not be found."
            });
        }

        const weatherParams =
            new URLSearchParams({
                latitude: String(
                    location.latitude
                ),
                longitude: String(
                    location.longitude
                ),
                daily: [
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "precipitation_probability_max"
                ].join(","),
                temperature_unit:
                    "fahrenheit",
                timezone: "auto",
                start_date: date,
                end_date: date
            });

        const weatherResponse =
            await fetch(
                `https://api.open-meteo.com/v1/forecast?${weatherParams}`
            );

        const weatherData =
            await weatherResponse.json();

        if (!weatherResponse.ok) {
            throw new Error(
                "Unable to retrieve the forecast."
            );
        }

        if (
            !weatherData.daily?.time?.length
        ) {
            return res.json({
                available: false,
                message:
                    "Forecast not available yet."
            });
        }

        return res.json({
            available: true,
            date:
                weatherData.daily.time[0],
            weatherCode:
                weatherData.daily
                    .weather_code[0],
            high:
                weatherData.daily
                    .temperature_2m_max[0],
            low:
                weatherData.daily
                    .temperature_2m_min[0],
            precipitationChance:
                weatherData.daily
                    .precipitation_probability_max[0],
            location: {
                city: location.name,
                state:
                    location.admin1 ??
                    state ??
                    ""
            }
        });
    } catch (error) {
        console.error(
            "Weather route error:",
            error.message
        );

        return res.status(500).json({
            error:
                error.message ||
                "Unable to retrieve venue weather."
        });
    }
});

app.get(
    "/api/auth/login",
    (req, res) => {
        const state = crypto.randomUUID();

        req.session.spotifyState = state;

        const scopes = [
            "user-read-private",
            "user-read-email",
            "user-top-read"
        ];

        const authorizeUrl =
            spotifyApi.createAuthorizeURL(
                scopes,
                state
            );

        res.redirect(authorizeUrl);
    }
);

app.get(
    "/api/auth/callback",
    async (req, res) => {
        const code = req.query.code;
        const state = req.query.state;

        if (!code) {
            return res
                .status(400)
                .send(
                    "Spotify authorization code is missing."
                );
        }

        if (
            !state ||
            state !==
                req.session.spotifyState
        ) {
            return res
                .status(400)
                .send(
                    "Spotify state verification failed."
                );
        }

        try {
            const tokenData =
                await spotifyApi.authorizationCodeGrant(
                    code
                );

            req.session.spotifyAccessToken =
                tokenData.body.access_token;

            req.session.spotifyRefreshToken =
                tokenData.body.refresh_token;

            delete req.session.spotifyState;

            req.session.save((error) => {
                if (error) {
                    console.error(
                        "Session save error:",
                        error
                    );

                    return res
                        .status(500)
                        .send(
                            "Unable to save session."
                        );
                }

                res.redirect(
                    process.env.CLIENT_URL || "http://127.0.0.1:5173"
                );
            });
        } catch (error) {
            console.error(
                "Spotify callback error:",
                error.body ||
                    error.message
            );

            return res
                .status(500)
                .send(
                    "Spotify authorization failed."
                );
        }
    }
);

app.get(
    "/api/auth/me",
    async (req, res) => {
        const accessToken =
            req.session
                .spotifyAccessToken;

        if (!accessToken) {
            return res
                .status(401)
                .json({
                    connected: false,
                    error:
                        "Spotify account is not connected."
                });
        }

        try {
            spotifyApi.setAccessToken(
                accessToken
            );

            const userData =
                await spotifyApi.getMe();

            const user =
                userData.body;

            return res.json({
                connected: true,
                user: {
                    id: user.id,
                    displayName:
                        user.display_name,
                    image:
                        user.images?.[0]
                            ?.url || "",
                    spotifyUrl:
                        user.external_urls
                            ?.spotify || ""
                }
            });
        } catch (error) {
            console.error(
                "Spotify profile error:",
                error.body ||
                    error.message
            );

            return res
                .status(
                    error.statusCode || 500
                )
                .json({
                    connected: false,
                    error:
                        "Unable to load Spotify profile."
                });
        }
    }
);

app.get(
    "/api/auth/top-artists",
    async (req, res) => {
        const accessToken =
            req.session
                .spotifyAccessToken;

        if (!accessToken) {
            return res
                .status(401)
                .json({
                    error:
                        "Spotify account is not connected."
                });
        }

        try {
            spotifyApi.setAccessToken(
                accessToken
            );

            const topArtistsData =
                await spotifyApi.getMyTopArtists(
                    {
                        limit: 10,
                        time_range:
                            "medium_term"
                    }
                );

            const artists =
                topArtistsData.body.items.map(
                    (artist, index) => ({
                        id: artist.id,
                        name: artist.name,
                        image:
                            artist.images?.[0]
                                ?.url || "",
                        rank: index + 1,
                        rankScore:
                            topArtistsData.body.items.length -
                            index,
                        spotifyUrl:
                            artist.external_urls
                                ?.spotify ||
                            ""
                    })
                );

            return res.json({
                artists
            });
        } catch (error) {
            console.error(
                "Spotify top artists error:",
                error.body ||
                    error.message
            );

            return res
                .status(
                    error.statusCode || 500
                )
                .json({
                    error:
                        "Unable to load your top Spotify artists."
                });
        }
    }
);

app.post(
    "/api/auth/logout",
    (req, res) => {
        delete req.session
            .spotifyAccessToken;

        delete req.session
            .spotifyRefreshToken;

        delete req.session
            .spotifyState;

        req.session.save((error) => {
            if (error) {
                console.error(
                    "Session save error:",
                    error
                );

                return res
                    .status(500)
                    .json({
                        error:
                            "Unable to disconnect Spotify."
                    });
            }

            return res.json({
                success: true
            });
        });
    }
);

app.get("/api/weather/current", async (req, res) => {
    const city = req.query.city?.trim();
    const state = req.query.state?.trim();

    if (!city) {
        return res.status(400).json({
            error: "A city is required."
        });
    }

    try {
        const geocodeParams = new URLSearchParams({
            name: city,
            count: "10",
            language: "en",
            format: "json",
            countryCode: "US"
        });

        const geocodeResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?${geocodeParams}`
        );

        const geocodeData = await geocodeResponse.json();
        const locations = geocodeData.results ?? [];
        const requestedState = state?.toLowerCase() ?? "";

        const location =
            locations.find((result) => {
                const adminName =
                    result.admin1?.toLowerCase() ?? "";

                const adminCode =
                    result.admin1_code
                        ?.split("-")
                        .at(-1)
                        ?.toLowerCase() ?? "";

                return (
                    !requestedState ||
                    adminName === requestedState ||
                    adminName.startsWith(requestedState) ||
                    adminCode === requestedState
                );
            }) ?? locations[0];

        if (!location) {
            return res.status(404).json({
                error: "Location could not be found."
            });
        }

        const weatherParams = new URLSearchParams({
            latitude: String(location.latitude),
            longitude: String(location.longitude),
            current: [
                "temperature_2m",
                "apparent_temperature",
                "weather_code",
                "precipitation",
                "wind_speed_10m"
            ].join(","),
            temperature_unit: "fahrenheit",
            wind_speed_unit: "mph",
            timezone: "auto"
        });

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?${weatherParams}`
        );

        const weatherData = await weatherResponse.json();

        if (!weatherResponse.ok || !weatherData.current) {
            throw new Error("Current weather is unavailable.");
        }

        return res.json({
            available: true,
            temperature: weatherData.current.temperature_2m,
            feelsLike: weatherData.current.apparent_temperature,
            weatherCode: weatherData.current.weather_code,
            precipitation: weatherData.current.precipitation,
            windSpeed: weatherData.current.wind_speed_10m,
            location: {
                city: location.name,
                state: location.admin1 ?? state ?? ""
            }
        });
    } catch (error) {
        console.error("Current weather route error:", error);

        return res.status(500).json({
            error: "Unable to retrieve current weather."
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});
import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

function InsightsPage() {
    const [topArtists, setTopArtists] =
        useState([]);

    const [concertsByState, setConcertsByState] =
        useState([]);

    const [concertStats, setConcertStats] =
        useState({
            totalConcerts: 0,
            statesRepresented: 0,
            busiestState: ""
        });

    const [loadingArtists, setLoadingArtists] =
        useState(true);

    const [loadingConcerts, setLoadingConcerts] =
        useState(true);

    const [artistError, setArtistError] =
        useState("");

    const [concertError, setConcertError] =
        useState("");

    useEffect(() => {
        async function loadTopArtists() {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/top-artists`,
                    {
                        credentials: "include"
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                            "Could not load top artists."
                    );
                }

                setTopArtists(
                    data.artists ?? []
                );
            } catch (error) {
                console.error(error);
                setArtistError(error.message);
            } finally {
                setLoadingArtists(false);
            }
        }

        loadTopArtists();
    }, []);

    useEffect(() => {
        async function loadConcertInsights() {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/insights/concerts-by-state`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                            data.message ||
                            "Could not load concert insights."
                    );
                }

                setConcertsByState(
                    data.concertsByState ?? []
                );

                setConcertStats({
                    totalConcerts:
                        data.totalConcerts ?? 0,
                    statesRepresented:
                        data.statesRepresented ?? 0,
                    busiestState:
                        data.busiestState ??
                        "Unavailable"
                });
            } catch (error) {
                console.error(error);
                setConcertError(error.message);
            } finally {
                setLoadingConcerts(false);
            }
        }

        loadConcertInsights();
    }, []);

    return (
        <main className="insights-page">
            <section>
                <h2>Spotify Top Artists</h2>

                <p>
                    Your top Spotify artists ranked by
                    your recent listening.
                </p>

                {loadingArtists && (
                    <p>Loading top artists...</p>
                )}

                {artistError && (
                    <div className="spotify-connect-card">
                        <h3>Spotify Personalization</h3>

                        <p>
                            Connect your Spotify account to unlock
                            personalized insights.
                        </p>

                        <ul>
                            <li>Your Top 10 Artists</li>
                            <li>Your Listening Rank on artist pages</li>
                            <li>Personalized listening insights</li>
                        </ul>

                        <a
                            className="spotify-connect-button"
                            href={`${import.meta.env.VITE_API_URL}/api/auth/login`}
                        >
                            Connect Spotify
                        </a>
                    </div>
                )}

                {!loadingArtists &&
                    !artistError &&
                    topArtists.length > 0 && (
                        <div className="chart-container">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={topArtists}
                                    layout="vertical"
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 35,
                                        bottom: 10
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        type="number"
                                        domain={[0, 10]}
                                        allowDecimals={false}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={120}
                                    />

                                    <Tooltip
                                        formatter={(
                                            value,
                                            name,
                                            item
                                        ) => [
                                            `#${item.payload.rank}`,
                                            "Spotify Rank"
                                        ]}
                                    />

                                    <Bar
                                        dataKey="rankScore"
                                        name="Listening Rank"
                                        fill="#1db954"
                                        radius={[
                                            0,
                                            6,
                                            6,
                                            0
                                        ]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
            </section>

            <section>
                <h2>
                    Upcoming Concerts by State
                </h2>

                <p>
                    Top states among 200 upcoming U.S.
                    music events returned by Ticketmaster.
                </p>

                <div className="concert-stat-grid">
                    <article className="concert-stat-card">
                        <span>
                            Upcoming Concerts
                        </span>

                        <strong>
                            {
                                concertStats.totalConcerts
                            }
                        </strong>
                    </article>

                    <article className="concert-stat-card">
                        <span>
                            States Represented
                        </span>

                        <strong>
                            {
                                concertStats.statesRepresented
                            }
                        </strong>
                    </article>

                    <article className="concert-stat-card">
                        <span>
                            Busiest State
                        </span>

                        <strong>
                            {concertStats.busiestState ||
                                "Unavailable"}
                        </strong>
                    </article>
                </div>

                {loadingConcerts && (
                    <p>
                        Loading concert insights...
                    </p>
                )}

                {concertError && (
                    <p className="insight-error">
                        {concertError}
                    </p>
                )}

                {!loadingConcerts &&
                    !concertError &&
                    concertsByState.length > 0 && (
                        <div className="chart-container">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={concertsByState}
                                    layout="vertical"
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 35,
                                        bottom: 10
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="state"
                                        width={120}
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            value,
                                            "Upcoming Concerts"
                                        ]}
                                    />

                                    <Bar
                                        dataKey="concerts"
                                        name="Upcoming Concerts"
                                        fill="#2563eb"
                                        radius={[
                                            0,
                                            6,
                                            6,
                                            0
                                        ]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                {!loadingConcerts &&
                    !concertError &&
                    concertsByState.length === 0 && (
                        <p>
                            No upcoming concert data was
                            available.
                        </p>
                    )}
            </section>
        </main>
    );
}

export default InsightsPage;
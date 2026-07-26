import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getArtist } from "../services/artistApi.js";
import { searchEvents } from "../services/ticketmasterApi.js";

import { useFavorites } from "../context/FavoritesContext.jsx";
import { useShows } from "../context/ShowsContext.jsx";

import LoginWarningModal from "../components/LoginWarningModal.jsx";
import EventWeather from "../components/EventWeather.jsx";

function ArtistPage() {
    const { id } = useParams();

    const [artist, setArtist] = useState(null);
    const [status, setStatus] = useState("Loading artist...");
    const [showLoginWarning, setShowLoginWarning] = useState(false);

    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [eventsMessage, setEventsMessage] = useState("");

    const {
        toggleFavorite,
        isFavorite,
        user
    } = useFavorites();

    const {
        toggleShow,
        isShowSaved
    } = useShows();

    useEffect(() => {
        async function loadArtist() {
            try {
                const data = await getArtist(id);

                setArtist(data);
                setStatus("");
            } catch (error) {
                console.error(error);
                setStatus(error.message);
            }
        }

        loadArtist();
    }, [id]);

    useEffect(() => {
        if (!artist?.name) {
            return;
        }

        async function loadEvents() {
            setEventsLoading(true);
            setEvents([]);
            setEventsMessage("");

            try {
                const results = await searchEvents(artist.name);

                setEvents(results);

                if (results.length === 0) {
                    setEventsMessage(
                        `No upcoming shows found for ${artist.name}.`
                    );
                }
            } catch (error) {
                console.error(error);
                setEventsMessage(error.message);
            } finally {
                setEventsLoading(false);
            }
        }

        loadEvents();
    }, [artist?.name]);

    async function handleFavoriteClick() {
        if (!user) {
            setShowLoginWarning(true);
            return;
        }

        await toggleFavorite(artist);
    }

    if (status) {
        return (
            <section>
                <p>{status}</p>
            </section>
        );
    }

    if (!artist) {
        return null;
    }

    const genres = artist.genres?.length
        ? artist.genres.join(", ")
        : "Genre not available";

    const favorited = isFavorite(artist.id);

    return (
        <>
            <section className="artist-page">
                {artist.image && (
                    <img
                        src={artist.image}
                        alt={artist.name}
                        className="artist-page-image"
                    />
                )}

                <div className="artist-page-info">
                    <h2>{artist.name}</h2>

                    <p>
                        <strong>Genres:</strong> {genres}
                    </p>

                    <p>
                        <strong>Followers:</strong>{" "}
                        {Number(
                            artist.followers || 0
                        ).toLocaleString()}
                    </p>

                    <p>
                        <strong>Popularity:</strong>{" "}
                        {artist.popularity ?? "Not available"}
                    </p>

                    <button
                        type="button"
                        className={
                            favorited
                                ? "favorite-btn active"
                                : "favorite-btn"
                        }
                        onClick={handleFavoriteClick}
                    >
                        {favorited
                            ? "★ Remove Favorite"
                            : "☆ Add Favorite"}
                    </button>

                    {artist.spotifyUrl ? (
                        <a
                            href={artist.spotifyUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Open on Spotify
                        </a>
                    ) : (
                        <button
                            type="button"
                            className="external-link-unavailable"
                            disabled
                        >
                            Spotify Page Unavailable
                        </button>
                    )}
                </div>
            </section>

            <section className="artist-shows-section">
                <h2>🎟️ Upcoming Shows</h2>

                {eventsLoading && (
                    <p>Loading upcoming shows...</p>
                )}

                {eventsMessage && (
                    <p>{eventsMessage}</p>
                )}

                <div className="events-grid">
                    {events.map((event) => {
                        const saved = isShowSaved(event.id);

                        return (
                            <article
                                className="event-card"
                                key={event.id}
                            >
                                {event.image && (
                                    <img
                                        src={event.image}
                                        alt={event.name}
                                        className="event-image"
                                    />
                                )}

                                <div className="event-info">
                                    <h3>{event.name}</h3>

                                    <p>
                                        <strong>Date:</strong>{" "}
                                        {event.date || "Unavailable"}
                                    </p>

                                    <p>
                                        <strong>Time:</strong>{" "}
                                        {event.time || "Unavailable"}
                                    </p>

                                    <p>
                                        <strong>Venue:</strong>{" "}
                                        {event.venue || "Unavailable"}
                                    </p>

                                    <p>
                                        <strong>Location:</strong>{" "}
                                        {[event.city, event.state]
                                            .filter(Boolean)
                                            .join(", ") ||
                                            "Unavailable"}
                                    </p>

                                    <EventWeather
                                        city={event.city}
                                        state={event.state}
                                        date={event.date}
                                    />

                                    <div className="event-actions">
                                        <button
                                            type="button"
                                            className={
                                                saved
                                                    ? "show-save-btn active"
                                                    : "show-save-btn"
                                            }
                                            onClick={() =>
                                                toggleShow(event)
                                            }
                                        >
                                            {saved
                                                ? "★ Saved"
                                                : "☆ Save Show"}
                                        </button>

                                        {event.ticketUrl ? (
                                            <a
                                                href={event.ticketUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View Tickets
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                className="ticket-unavailable-btn"
                                                disabled
                                            >
                                                Tickets Unavailable
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <LoginWarningModal
                isOpen={showLoginWarning}
                onClose={() => setShowLoginWarning(false)}
            />
        </>
    );
}

export default ArtistPage;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtist } from "../services/artistApi.js";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { searchEvents } from "../services/ticketmasterApi.js";
import { useShows } from "../context/ShowsContext.jsx";
import EventWeather from "../components/EventWeather.jsx";

function ArtistPage() {
    const { id } = useParams();

    const [artist, setArtist] = useState(null);
    const [status, setStatus] = useState("Loading artist...");

    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [eventsMessage, setEventsMessage] = useState("");

    const { toggleFavorite, isFavorite } = useFavorites();
    const { toggleShow, isShowSaved } = useShows();

    useEffect(() => {
        async function loadArtist() {
            try {
                const data = await getArtist(id);
                console.log("Artist data from backend:", data);

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

    const latestRelease = artist.albums?.[0] ?? null;
    
    const formattedReleaseDate = latestRelease?.releaseDate
    
    ? new Date(latestRelease.releaseDate).toLocaleDateString(
          "en-US",
          {
              month: "long",
              day: "numeric",
              year: "numeric"
          }
      )
    : "Date unavailable";

    const formattedType = latestRelease?.albumType
    ? latestRelease.albumType.charAt(0).toUpperCase() +
      latestRelease.albumType.slice(1)
    : "Release";

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

                    <div className="artist-page-actions">
                        <button
                            type="button"
                            className={
                                favorited
                                    ? "favorite-btn active"
                                    : "favorite-btn"
                            }
                            onClick={() => toggleFavorite(artist)}
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
                </div>
            </section>

            {latestRelease && (
                <section className="latest-release-section">
                    <h2>💿 Latest Release</h2>

                    <article className="latest-release-card">
                        {latestRelease.image && (
                            <img
                                src={latestRelease.image}
                                alt={latestRelease.name}
                                className="latest-release-image"
                            />
                        )}

                        <div className="latest-release-info">
                            <h3>{latestRelease.name}</h3>

                            <p>
                                <strong>Type:</strong> {formattedType}
                            </p>

                            <p>
                                <strong>Released:</strong> {formattedReleaseDate}
                            </p>

                            {latestRelease.spotifyUrl && (
                                <a
                                    href={latestRelease.spotifyUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Open Release on Spotify
                                </a>
                            )}
                        </div>
                    </article>
                </section>
            )}

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
        </>
    );
}

export default ArtistPage;
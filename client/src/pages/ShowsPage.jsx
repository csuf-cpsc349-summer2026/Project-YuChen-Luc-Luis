import { useShows } from "../context/ShowsContext.jsx";

function ShowsPage() {
    const { savedShows, removeShow } = useShows();

    return (
        <section id="shows-section">
            <h2>🎟️ Saved Shows</h2>

            <p className="shows-description">
                Concerts you bookmarked from artist pages.
            </p>

            {savedShows.length === 0 ? (
                <div className="empty-shows">
                    <p>You have not saved any shows yet.</p>
                    <p>
                        Open an artist page and click “Save Show” on an
                        upcoming concert.
                    </p>
                </div>
            ) : (
                <div className="events-grid">
                    {savedShows.map((event) => (
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
                                        .join(", ") || "Unavailable"}
                                </p>

                                <div className="event-actions">
                                    <button
                                        type="button"
                                        className="show-save-btn active"
                                        onClick={() =>
                                            removeShow(event.id)
                                        }
                                    >
                                        Remove Show
                                    </button>

                                    {event.ticketUrl && (
                                        <a
                                            href={event.ticketUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View Tickets
                                        </a>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ShowsPage;
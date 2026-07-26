import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext.jsx";

function FavoritesPage() {
    const {
        favorites,
        removeFavorite,
        user,
        authLoading,
        favoritesLoading,
        message
    } = useFavorites();

    if (authLoading) {
        return (
            <section id="favorites-section">
                <h2>Favorite Artists</h2>
                <p>Loading...</p>
            </section>
        );
    }

    if (!user) {
        return (
            <section id="favorites-section">
                <h2>Favorite Artists</h2>

                <div className="empty-favorites">
                    <p>You have not added any favorite artists yet.</p>

                    <Link to="/search">
                        Search for artists
                    </Link>
                </div>
            </section>
        );
    }

    if (favoritesLoading) {
        return (
            <section id="favorites-section">
                <h2>Favorite Artists</h2>
                <p>Loading your favorites...</p>
            </section>
        );
    }

    return (
        <section id="favorites-section">
            <h2>Favorite Artists</h2>

            {message && (
                <p className="login-message">
                    {message}
                </p>
            )}

            {favorites.length === 0 ? (
                <div className="empty-favorites">
                    <p>You have not added any favorite artists yet.</p>

                    <Link to="/search">
                        Search for artists
                    </Link>
                </div>
            ) : (
                <div id="favorite-artists">
                    {favorites.map((artist) => {
                        const genres = artist.genres?.length
                            ? artist.genres.join(", ")
                            : "Genre not available";

                        return (
                            <article
                                className="artist-result-card"
                                key={artist.id}
                            >
                                {artist.image && (
                                    <img
                                        src={artist.image}
                                        alt={artist.name}
                                        className="artist-result-image"
                                    />
                                )}

                                <div className="artist-result-info">
                                    <h3>{artist.name}</h3>

                                    <p>
                                        <strong>Genres:</strong>{" "}
                                        {genres}
                                    </p>

                                    <p>
                                        <strong>Followers:</strong>{" "}
                                        {Number(
                                            artist.followers || 0
                                        ).toLocaleString()}
                                    </p>

                                    <div className="artist-result-actions">
                                        <Link to={`/artist/${artist.id}`}>
                                            View Artist
                                        </Link>

                                        <button
                                            type="button"
                                            className="favorite-btn active"
                                            onClick={() =>
                                                removeFavorite(artist.id)
                                            }
                                        >
                                            ★ Remove Favorite
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default FavoritesPage;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtist } from "../services/artistApi.js";
import { useFavorites } from "../context/FavoritesContext.jsx";

function ArtistPage() {
    const { id } = useParams();

    const [artist, setArtist] = useState(null);
    const [status, setStatus] = useState("Loading artist...");

    const { toggleFavorite, isFavorite } = useFavorites();

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
                    {Number(artist.followers || 0).toLocaleString()}
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
                    onClick={() => toggleFavorite(artist)}
                >
                    {favorited
                        ? "★ Remove Favorite"
                        : "☆ Add Favorite"}
                </button>

                {artist.spotifyUrl && (
                    <a
                        href={artist.spotifyUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Open on Spotify
                    </a>
                )}
            </div>
        </section>
    );
}

export default ArtistPage;
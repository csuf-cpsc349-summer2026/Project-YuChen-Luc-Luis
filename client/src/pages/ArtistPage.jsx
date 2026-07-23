import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtist } from "../services/artistApi.js";

function ArtistPage() {
    const { id } = useParams();
    console.log("React artist ID:", id);

    const [artist, setArtist] = useState(null);
    const [status, setStatus] = useState("Loading artist...");

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
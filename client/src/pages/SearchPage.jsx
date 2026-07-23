import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { searchArtists } from "../services/spotifyApi.js";

function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const artistQuery = searchParams.get("artist") || "";

    const [artistName, setArtistName] = useState(artistQuery);
    const [artists, setArtists] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setArtistName(artistQuery);

        if (!artistQuery) {
            setArtists([]);
            setStatus("No artist search was provided.");
            return;
        }

        async function loadArtists() {
            setLoading(true);
            setStatus(`Searching for "${artistQuery}"...`);
            setArtists([]);

            try {
                const results = await searchArtists(artistQuery);

                setArtists(results);

                if (results.length === 0) {
                    setStatus("No artists found.");
                } else {
                    setStatus("");
                }
            } catch (error) {
                console.error(error);
                setStatus(error.message);
                setArtists([]);
            } finally {
                setLoading(false);
            }
        }

        loadArtists();
    }, [artistQuery]);

    function runSearch() {
        const trimmedArtist = artistName.trim();

        if (!trimmedArtist) {
            setStatus("Please enter an artist name.");
            return;
        }

        navigate(`/search?artist=${encodeURIComponent(trimmedArtist)}`);
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            runSearch();
        }
    }

    return (
        <section id="search-results-section">
            <h2>🎤 Search Artists</h2>

            <div className="artist-search-controls">
                <input
                    type="text"
                    id="artist-input"
                    placeholder="Enter artist name..."
                    value={artistName}
                    onChange={(event) => setArtistName(event.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <button
                    type="button"
                    id="search-btn"
                    onClick={runSearch}
                    disabled={loading}
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {status && <p id="search-status">{status}</p>}

            <div id="artist-results">
                {artists.map((artist) => {
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
                                    <strong>Genres:</strong> {genres}
                                </p>

                                <p>
                                    <strong>Followers:</strong>{" "}
                                    {Number(
                                        artist.followers || 0
                                    ).toLocaleString()}
                                </p>

                                <Link to={`/artist/${artist.id}`}>
                                    View Artist
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default SearchPage;
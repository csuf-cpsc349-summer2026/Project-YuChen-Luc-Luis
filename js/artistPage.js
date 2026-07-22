const artistStatus = document.querySelector("#artist-status");
const artistCard = document.querySelector("#artist-card");

const params = new URLSearchParams(window.location.search);
const artistId = params.get("id");

if (!artistId) {
    artistStatus.textContent = "No artist was selected.";
} else {
    loadArtist(artistId);
}

async function loadArtist(id) {
    try {
        const response = await fetch(
            `/api/artist/${encodeURIComponent(id)}`
        );

        const artist = await response.json();

        if (!response.ok) {
            throw new Error(
                artist.error || "Unable to load artist."
            );
        }

        renderArtist(artist);
        artistStatus.textContent = "";
    } catch (error) {
        console.error(error);
        artistStatus.textContent = error.message;
    }
}

function renderArtist(artist) {
    const genres = artist.genres?.length
        ? artist.genres.join(", ")
        : "Genre not available";

    const popularity = artist.popularity ?? "Not available";

    artistCard.innerHTML = `
        <article class="artist-detail-card">
            ${
                artist.image
                    ? `
                        <img
                            src="${artist.image}"
                            alt="${escapeHtml(artist.name)}"
                            class="artist-detail-image"
                        >
                    `
                    : ""
            }

            <div class="artist-detail-info">
                <h2>${escapeHtml(artist.name)}</h2>

                <p>
                    <strong>Genres:</strong>
                    ${escapeHtml(genres)}
                </p>

                <p>
                    <strong>Popularity:</strong>
                    ${popularity}
                </p>

                <p>
                    <strong>Followers:</strong>
                    ${Number(artist.followers || 0).toLocaleString()}
                </p>

                ${
                    artist.spotifyUrl
                        ? `
                            <a
                                href="${artist.spotifyUrl}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open on Spotify
                            </a>
                        `
                        : ""
                }
            </div>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
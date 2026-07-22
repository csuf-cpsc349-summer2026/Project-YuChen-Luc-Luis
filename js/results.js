const artistInput = document.querySelector("#artist-input");
const searchButton = document.querySelector("#search-btn");
const searchStatus = document.querySelector("#search-status");
const artistResults = document.querySelector("#artist-results");

const params = new URLSearchParams(window.location.search);
const query = params.get("query");

if (query) {
    artistInput.value = query;
    searchArtists(query);
} else {
    artistResults.innerHTML = "<p>No artist search was provided.</p>";
}

searchButton.addEventListener("click", runSearch);

artistInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        runSearch();
    }
});

function runSearch() {
    const artistName = artistInput.value.trim();

    if (!artistName) {
        searchStatus.textContent = "Please enter an artist name.";
        return;
    }

    window.location.href =
        `results.html?query=${encodeURIComponent(artistName)}`;
}

async function searchArtists(artistName) {
    searchStatus.textContent = `Searching for "${artistName}"...`;
    artistResults.innerHTML = "";

    try {
        const response = await fetch(
            `/api/search?query=${encodeURIComponent(artistName)}`
        );

        const artists = await response.json();

        if (!response.ok) {
            throw new Error(artists.error || "Artist search failed.");
        }

        renderArtists(artists);
        searchStatus.textContent = "";
    } catch (error) {
        searchStatus.textContent = error.message;
        artistResults.innerHTML = "";
    }
}

function renderArtists(artists) {
    if (!artists.length) {
        artistResults.innerHTML = "<p>No artists found.</p>";
        return;
    }

    artistResults.innerHTML = artists
        .map((artist) => {
            const image = artist.image
                ? `
                    <img
                        src="${artist.image}"
                        alt="${escapeHtml(artist.name)}"
                        class="artist-result-image"
                    >
                `
                : "";

            const genres = artist.genres?.length
                ? artist.genres.join(", ")
                : "Genre not available";

            return `
                <article class="artist-result-card">
                    ${image}

                    <div class="artist-result-info">
                        <h3>${escapeHtml(artist.name)}</h3>

                        <p>
                            <strong>Genres:</strong>
                            ${escapeHtml(genres)}
                        </p>

                        <p>
                            <strong>Followers:</strong>
                            ${Number(artist.followers || 0).toLocaleString()}
                        </p>

                        <a href="artist.html?id=${encodeURIComponent(artist.id)}">
                            View Artist
                        </a>
                    </div>
                </article>
            `;
        })
        .join("");
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


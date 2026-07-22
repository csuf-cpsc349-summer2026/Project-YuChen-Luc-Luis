const artistInput = document.querySelector("#artist-input");
const searchButton = document.querySelector("#search-btn");
const searchStatus = document.querySelector("#search-status");
const artistResults = document.querySelector("#artist-results");

searchButton.addEventListener("click", handleSearch);

artistInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});

function handleSearch() {
    const artistName = artistInput.value.trim();

    if (!artistName) {
        searchStatus.textContent = "Please enter an artist name.";
        return;
    }

    searchStatus.textContent = "";

    artistResults.innerHTML = `
        <p>You searched for: <strong>${escapeHtml(artistName)}</strong></p>
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
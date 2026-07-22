// Run when the page loads
window.onload = function () {
    getLocation();
};

// Artist Search
const searchButton = document.querySelector("#search-btn");
const artistInput = document.querySelector("#artist-input");

searchButton.addEventListener("click", searchArtist);

artistInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchArtist();
    }
});

function searchArtist() {
    const artist = artistInput.value.trim();

    if (!artist) {
        return;
    }

    window.location.href =
        `results.html?query=${encodeURIComponent(artist)}`;
}
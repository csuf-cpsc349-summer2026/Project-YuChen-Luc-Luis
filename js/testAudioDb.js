const { getAudioDbArtistData } = require("./audioDb");

async function testAudioDb() {
    try {
        const artist = await getAudioDbArtistData("The Weeknd");

        if (!artist) {
            console.log("Artist not found.");
            return;
        }

        console.log("\nTheAudioDB Artist Information");
        console.log("-----------------------------");

        console.log("Name:", artist.name);
        console.log("ID:", artist.id);
        console.log("Country:", artist.country);
        console.log("Genre:", artist.genre);
        console.log("Style:", artist.style);
        console.log("Mood:", artist.mood);
        console.log("Formed:", artist.formedYear);

        console.log("\nArtwork");
        console.log("-----------------------------");
        console.log("Thumbnail:", artist.images.thumbnail || "Not available");
        console.log("Logo:", artist.images.logo || "Not available");
        console.log("Banner:", artist.images.banner || "Not available");

        console.log("\nBiography");
        console.log("-----------------------------");
        console.log(artist.biography);
    } catch (error) {
        console.error("TheAudioDB test failed:", error.message);
    }
}

testAudioDb();
// Get the user's current location
async function getLocation() {
    try {

        const response = await fetch("http://ip-api.com/json/");

        if (!response.ok) {
            throw new Error("Failed to fetch location.");
        }

        const data = await response.json();

        document.getElementById("city").textContent = data.city;
        document.getElementById("region").textContent = data.regionName;
        document.getElementById("country").textContent = data.country;

        // Get current weather using the latitude and longitude
        getWeather(data.lat, data.lon);

        console.log(data);

    } catch (error) {

        console.error(error);

        document.getElementById("city").textContent = "Unavailable";
        document.getElementById("region").textContent = "Unavailable";
        document.getElementById("country").textContent = "Unavailable";
        document.getElementById("temperature").textContent = "--";
    }
}
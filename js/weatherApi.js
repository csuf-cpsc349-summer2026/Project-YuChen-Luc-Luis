// Get the current weather
async function getWeather(latitude, longitude) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch weather.");
        }

        const data = await response.json();

        document.getElementById("temperature").textContent =
            data.current.temperature_2m;

    } catch (error) {

        console.error(error);

        document.getElementById("temperature").textContent = "--";
    }
}
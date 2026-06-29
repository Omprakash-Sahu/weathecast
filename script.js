
function setDay(timeDayDate) {
    const dayOptions = { weekday: 'long' };
    const dayString = timeDayDate.toLocaleDateString('en-US', dayOptions);
    
    const day = document.getElementById("day");
    day.textContent = dayString + ", ";
}

function setTime(timeDayDate) {
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    const timeString = timeDayDate.toLocaleTimeString('en-US', timeOptions);
    const time = document.getElementById("hr-min");
    time.textContent = timeString.slice(0, -3);

    const ampm = document.getElementById("am-pm");
    ampm.textContent = timeString.slice(-2);
}

function setDate(timeDayDate) {
    const dateOptions = {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    };
    const dateString = timeDayDate.toLocaleDateString('en-US', dateOptions);
    const date = document.getElementById("dd-mm-yy");
    date.textContent = dateString;
}

function capitalizeFirstLetter(str) {
    if(!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderCurrentWeather(data) {

    const localTimeDayDate = new Date((data.dt + data.timezone) * 1000 + new Date().getTimezoneOffset() * 60000);

    setTime(localTimeDayDate);
    setDay(localTimeDayDate);
    setDate(localTimeDayDate);

    const currentTemp = document.getElementById('temp-value__figure');
    currentTemp.textContent = Math.round(data.main.temp);

    const locationName = document.getElementById('current-weather__loc-name');
    locationName.textContent = data.name;

    const locationFeel = document.getElementById('current-weather__loc-feel');
    locationFeel.textContent = capitalizeFirstLetter(data.weather[0].description);

    const windSpeed = document.getElementById("wind-speed");
    windSpeed.textContent = data.wind.speed + " m/s";

    const humidity = document.getElementById("humidity");
    humidity.textContent = data.main.humidity + "%";
    
    const visibility = document.getElementById("visibility");
    visibility.textContent = (data.visibility/1000).toFixed(1) + "km";

    const pressure = document.getElementById("pressure");
    pressure.textContent = data.main.pressure + " hPa";

    const weatherIcon = document.getElementById("weather-icon");
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

}

async function fetchCurrentWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=28.61&lon=77.21&units=metric&appid=${API_KEY}`);
        if (!response.ok) {
            throw new Error("Failed to fetch weather data.");
        }
        const data = await response.json();
        renderCurrentWeather(data);
    } catch (error) {
        console.log(error);
    }
}

fetchCurrentWeather();


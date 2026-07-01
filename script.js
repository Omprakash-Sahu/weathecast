let lat = 28.61;
let lon = 77.21;

function getTime(timeDayDate) {
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    const timeString = timeDayDate.toLocaleTimeString('en-US', timeOptions);

    return timeString;
}

function getAMPM(timeDayDate) {
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    const timeString = timeDayDate.toLocaleTimeString('en-US', timeOptions);

    return timeString.slice(-2)
}

function getDay(timeDayDate) {
    const dayOptions = { weekday: 'long' };
    const dayString = timeDayDate.toLocaleDateString('en-US', dayOptions);
    
    return dayString;
}

function getDate(timeDayDate) {
    const dateOptions = {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    };
    const dateString = timeDayDate.toLocaleDateString('en-US', dateOptions);
    return dateString;
}

function capitalizeFirstLetter(str) {
    if(!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderCurrentWeather(data) {

    const localTimeDayDate = new Date((data.dt + data.timezone) * 1000 + new Date().getTimezoneOffset() * 60000);

    const timeString = getTime(localTimeDayDate);
    const ampmString = getAMPM(localTimeDayDate);
    const dayString = getDay(localTimeDayDate);
    const dateString = getDate(localTimeDayDate);

    const time = document.getElementById("hr-min");
    time.textContent = timeString.slice(0, -3);

    const ampm = document.getElementById("am-pm");
    ampm.textContent = timeString.slice(-2);

    const day = document.getElementById("day");
    day.textContent = dayString + ", ";

    const date = document.getElementById("dd-mm-yy");
    date.textContent = dateString;

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

async function fetchCurrentWeather(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        if (!response.ok) {
            throw new Error("Failed to fetch weather data.");
        }
        const data = await response.json();
        renderCurrentWeather(data);
    } catch (error) {
        console.log(error);
    }
}

fetchCurrentWeather(lat, lon);

// -----------------------------------------------------------------

function getForecastDayDate(dateTimeString) {
    const dateObj = new Date(dateTimeString.replace(' ', 'T'));
    const day = dateObj.toLocaleDateString('en-US', { weekday: 'long'});
    const date = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    const dayDate = day + ", " + date;
    return dayDate;
}

function getForecastTime(dateTimeString) {
    const dateObj = new Date(dateTimeString.replace(' ', 'T'));
    const hours = dateObj.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    const time12 = hours % 12 || 12;
    const time = time12 + " " + ampm;
    return time;
}

function renderForecastData(data) {

    let prevDay = "";
    const forecastDaysSection = document.querySelector(".forecast__days");
    let dayCard;
    let hourlyDetails;

    for (let i = 0; i < data.list.length; i++) {

        const day = data.list[i].dt_txt.slice(0, 10);

        if (day!==prevDay) {            

            dayCard = document.createElement('div');
            dayCard.classList.add('forecast__day-card');
            forecastDaysSection.appendChild(dayCard)

            const dayOverview = document.createElement('div');
            dayOverview.classList.add('forecast__day-overview');
            dayCard.appendChild(dayOverview);
            
            const dayDate = document.createElement('p');
            dayDate.classList.add('forecast__day-date');
            dayDate.textContent = getForecastDayDate(data.list[i].dt_txt);
            dayOverview.appendChild(dayDate);
            
            const dayExpandBtn = document.createElement('button');
            dayExpandBtn.classList.add('forecast__day-expand-btn');
            dayOverview.appendChild(dayExpandBtn);
            
            const dropdownIcon = document.createElement('img');
            dropdownIcon.src = "/assets/dropdown.svg";
            dayExpandBtn.appendChild(dropdownIcon);
            
            hourlyDetails = document.createElement('div');
            hourlyDetails.classList.add('forecast__hourly-details');
            dayCard.appendChild(hourlyDetails);
        }
        prevDay = day;
        
        const hourCard = document.createElement('div');
        hourCard.classList.add('forecast__hour-card');
        hourlyDetails.appendChild(hourCard);
        
        const hour = document.createElement('p');
        hour.classList.add('forecast__hour');
        hour.textContent = getForecastTime(data.list[i].dt_txt);
        hourCard.appendChild(hour);
        
        const hourDescription = document.createElement('p');
        hourDescription.classList.add('forecast__hour-description');
        hourDescription.textContent = capitalizeFirstLetter(data.list[i].weather[0].description);
        hourCard.appendChild(hourDescription);
        
        const hourWeather = document.createElement('div');
        hourWeather.classList.add('forecast__hour-weather');
        hourCard.appendChild(hourWeather);
        
        const hourWeatherIcon = document.createElement('img');
        hourWeatherIcon.classList.add('forecast__hour-weather-icon');
        hourWeatherIcon.src = `https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png`
        hourWeather.appendChild(hourWeatherIcon);
        
        const hourTemp = document.createElement('p');
        hourTemp.classList.add('forecast__hour-temp');
        hourTemp.textContent = Math.round(data.list[i].main.temp) + " °C";
        hourWeather.appendChild(hourTemp);

    }
}

async function fetchForecastData(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        if(!response.ok) {
            throw new Error("Failed to fetch forecast data.");
        }
        const data = await response.json();
        renderForecastData(data);
    } catch (error) {
        console.log(error)
    }
}

fetchForecastData(lat, lon);

const forecastDaysSection = document.querySelector(".forecast__days");

forecastDaysSection.addEventListener('click', (e) => {
    console.log("click event fired.");
    
    const dropdown = e.target.closest('.forecast__day-expand-btn');
    if(!dropdown) return;

    const dayCard = dropdown.closest(".forecast__day-card");
    const dayOverview = dayCard.querySelector('.forecast__day-overview');
    const hourlyDetails = dayCard.querySelector(".forecast__hourly-details");

    dropdown.classList.toggle('forecast__day-expand-btn--expanded');
    dayOverview.classList.toggle('forecast__day-overview--border-bottom');
    hourlyDetails.classList.toggle('forecast__hourly-details--visible');
})

// -----------------------------------------------------------------


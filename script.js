function showError() {
    const errorCard = document.querySelector('.show-error');
    errorCard.classList.add('show-error--visible');
}

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
        showError();
    }
}

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

    const forecastDaysSection = document.querySelector(".forecast__days");
    forecastDaysSection.replaceChildren();
    let prevDay = "";
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
            dropdownIcon.src = "./assets/dropdown.svg";
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
        showError();
    }
}

const forecastDaysSection = document.querySelector(".forecast__days");

forecastDaysSection.addEventListener('click', (e) => {
    
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

const searchInputBox = document.querySelector('.header__search-input');
const searchResults = document.querySelector('.search-results');

function showSearchError(errorStr) {
    searchResults.replaceChildren();
    searchResults.classList.remove('search-results--visible');
    const searchResultItem = document.createElement('li');
    searchResultItem.classList.add('search-results__item');
    searchResultItem.classList.add('search-results__item--not-found');
    searchResultItem.textContent = errorStr;
    searchResults.appendChild(searchResultItem);       
    searchResults.classList.add('search-results--visible');
}

function renderLocationData(data) {

    if (!searchInputBox.value) return;

    searchResults.replaceChildren();
    searchResults.classList.remove('search-results--visible');

    if(data.length === 0) {
        showSearchError("No locations found");
        return;
    }

    for (let i = 0; i < data.length; i++) {
        const location = data[i];
        const searchResultItem = document.createElement('li');
        searchResultItem.classList.add('search-results__item');
        searchResultItem.textContent = data[i].name + (data[i].state ? (", " + data[i].state) : '');
        searchResultItem.dataset.lat = data[i].lat;
        searchResultItem.dataset.lon = data[i].lon;
        searchResults.appendChild(searchResultItem);       
    }

    searchResults.classList.add('search-results--visible');
}

async function fetchLocations(loc) {
    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${loc}&limit=5&appid=${API_KEY}`)
        if (!response.ok) {
            throw new Error("Failed to fetch location data.");
        }
        const data = await response.json();
        renderLocationData(data);
    } catch (error) {
        console.log(error);    
        showSearchError("Check your connection & try again");   
    }
}

let timer;

searchInputBox.addEventListener('input', (e) => {
    e.preventDefault();
    clearTimeout(timer);
    if (e.target.value.trim() === '') {
        const searchResults = document.querySelector('.search-results');
        searchResults.classList.remove('search-results--visible');
    }
    else {
        timer = setTimeout(() => {
            fetchLocations(searchInputBox.value);
        }, 300);
    }
})

searchResults.addEventListener('click', (e) => {
    const searchResultItem = e.target.closest('.search-results__item');
    if(!searchResultItem) return;

    fetchCurrentWeather(searchResultItem.dataset.lat, searchResultItem.dataset.lon);
    fetchForecastData(searchResultItem.dataset.lat, searchResultItem.dataset.lon);
    localStorage.setItem('lat', searchResultItem.dataset.lat);
    localStorage.setItem('lon', searchResultItem.dataset.lon);
    searchResults.replaceChildren();
    searchResults.classList.remove('search-results--visible');
    searchInputBox.value = '';
})

function initialWeatherFetch() {
    let lat = localStorage.getItem('lat');
    let lon = localStorage.getItem('lon');

    if (lat && lon) {
        fetchCurrentWeather(lat, lon);
        fetchForecastData(lat, lon);
    } else {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                localStorage.setItem('lat', latitude);
                localStorage.setItem('lon', longitude);
                fetchCurrentWeather(latitude, longitude);
                fetchForecastData(latitude, longitude);
            },
            (error) => {
                fetchCurrentWeather(28.63, 77.22);
                fetchForecastData(28.63, 77.22);
            }
        );
    }
}

initialWeatherFetch();
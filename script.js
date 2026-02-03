// ==================== CONFIGURATION ====================
const API_KEY = '72f530de79e7536c58badc05ac037980';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherData = document.getElementById('weatherData');

// Fetch current weather data
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getWindDirection(degrees) {
    const directions = ['North', 'NorthEast', 'East', 'SouthEast', 'South', 'SouthWest', 'West', 'NorthWest'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
    document.getElementById('lastUpdated').textContent = now.toLocaleString('en-US');
}

async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        return data;
    } catch (err) {
        throw err;
    }
}

// Fetch 7-day forecast
async function fetchForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Forecast data not available');
        }
        
        const data = await response.json();
        return data;
    } catch (err) {
        throw err;
    }
}

// Process forecast data to get daily averages
function processForecastData(forecastData) {
    const dailyData = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                humidity: [],
                windSpeed: [],
                description: item.weather[0].description,
                icon: item.weather[0].icon
            };
        }
        
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].humidity.push(item.main.humidity);
        dailyData[date].windSpeed.push(item.wind.speed);
    });
    
    // Calculate averages
    const processedData = Object.keys(dailyData).slice(0, 7).map(date => {
        const data = dailyData[date];
        return {
            date: date,
            avgTemp: (data.temps.reduce((a, b) => a + b, 0) / data.temps.length).toFixed(1),
            maxTemp: Math.max(...data.temps).toFixed(1),
            minTemp: Math.min(...data.temps).toFixed(1),
            avgHumidity: (data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length).toFixed(0),
            avgWindSpeed: (data.windSpeed.reduce((a, b) => a + b, 0) / data.windSpeed.length).toFixed(1),
            description: data.description,
            icon: data.icon
        };
    });
    
    return processedData;
}

function applyWeatherBackground(weatherCondition) {
    // Reset body classes
    document.body.className = '';

    // Remove previous effects
    document.querySelectorAll('.rain, .snow').forEach(el => el.remove());

    if (weatherCondition.includes('clear')) {
        document.body.classList.add('sunny');
    } 
    else if (weatherCondition.includes('cloud')) {
        document.body.classList.add('cloudy');
    } 
    else if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) {
        document.body.classList.add('rainy');

        const rain = document.createElement('div');
        rain.className = 'rain';
        document.body.appendChild(rain);
    } 
    else if (weatherCondition.includes('snow')) {
        document.body.classList.add('snowy');

        const snow = document.createElement('div');
        snow.className = 'snow';
        document.body.appendChild(snow);
    }
}


// Display current weather data
function displayWeather(data) {
    document.getElementById('cityName').textContent = data.name + ', ' + data.sys.country;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('temperature').textContent = Math.round(data.main.temp) + '°';
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('windSpeed').textContent = data.wind.speed.toFixed(1);
    document.getElementById('pressure').textContent = data.main.pressure;
    document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1);
    document.getElementById('sunrise').textContent = formatTime(data.sys.sunrise);
    document.getElementById('sunset').textContent = formatTime(data.sys.sunset);
    document.getElementById('cloudiness').textContent = data.clouds.all + '%';
    document.getElementById('windDirection').textContent = getWindDirection(data.wind.deg);

    applyWeatherBackground(data.weather[0].main.toLowerCase());
    
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    
    createCurrentWeatherChart(data);
}
// Display 7-day forecast
function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';
    
    forecastData.forEach(day => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">${day.date}</div>
            <img src="http://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.description}" class="forecast-icon">
            <div class="forecast-temp">${day.avgTemp}°C</div>
            <div class="forecast-range">
                <span class="temp-high">↑${day.maxTemp}°</span>
                <span class="temp-low">↓${day.minTemp}°</span>
            </div>
            <div class="forecast-desc">${day.description}</div>
        `;
        forecastContainer.appendChild(forecastCard);
    });
    
    createForecastChart(forecastData);
}

// Create current weather chart
function createCurrentWeatherChart(data) {
    const canvas = document.getElementById('currentChart');
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = 250;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const labels = ['Temperature', 'Feels Like', 'Humidity', 'Wind Speed'];
    const values = [
        data.main.temp,
        data.main.feels_like,
        data.main.humidity / 2,
        data.wind.speed * 3
    ];
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
    
    const barWidth = 60;
    const barSpacing = (canvas.width - (barWidth * values.length)) / (values.length + 1);
    const maxValue = Math.max(...values);
    const chartHeight = canvas.height - 60;
    
    values.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = barSpacing + (barWidth + barSpacing) * index;
        const y = canvas.height - barHeight - 30;
        
        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth, barHeight);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(value), x + barWidth / 2, y - 5);
        
        ctx.font = '11px Arial';
        ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 10);
    });
}

// Create forecast temperature chart
function createForecastChart(forecastData) {
    const canvas = document.getElementById('forecastChart');
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    const temps = forecastData.map(day => parseFloat(day.avgTemp));
    const maxTemps = forecastData.map(day => parseFloat(day.maxTemp));
    const minTemps = forecastData.map(day => parseFloat(day.minTemp));
    
    const maxValue = Math.max(...maxTemps);
    const minValue = Math.min(...minTemps);
    const range = maxValue - minValue;
    
    const xStep = chartWidth / (forecastData.length - 1);
    
    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
        
        const temp = maxValue - (range / 5) * i;
        ctx.fillStyle = '#999';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(temp.toFixed(0) + '°', padding - 10, y + 4);
    }
    
    // Draw max temp line
    ctx.strokeStyle = '#FF6384';
    ctx.lineWidth = 3;
    ctx.beginPath();
    maxTemps.forEach((temp, index) => {
        const x = padding + xStep * index;
        const y = padding + chartHeight - ((temp - minValue) / range) * chartHeight;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw average temp line
    ctx.strokeStyle = '#36A2EB';
    ctx.lineWidth = 3;
    ctx.beginPath();
    temps.forEach((temp, index) => {
        const x = padding + xStep * index;
        const y = padding + chartHeight - ((temp - minValue) / range) * chartHeight;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw min temp line
    ctx.strokeStyle = '#4BC0C0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    minTemps.forEach((temp, index) => {
        const x = padding + xStep * index;
        const y = padding + chartHeight - ((temp - minValue) / range) * chartHeight;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw points and labels
    forecastData.forEach((day, index) => {
        const x = padding + xStep * index;
        
        // Draw points
        [maxTemps[index], temps[index], minTemps[index]].forEach((temp, i) => {
            const y = padding + chartHeight - ((temp - minValue) / range) * chartHeight;
            ctx.fillStyle = ['#FF6384', '#36A2EB', '#4BC0C0'][i];
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw date labels
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x, canvas.height - 10);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(day.date.split(',')[0], 0, 0);
        ctx.restore();
    });
    
    // Draw legend
    const legendY = 15;
    const legendX = canvas.width - 150;
    const legends = [
        { color: '#FF6384', text: 'Max Temp' },
        { color: '#36A2EB', text: 'Avg Temp' },
        { color: '#4BC0C0', text: 'Min Temp' }
    ];
    
    legends.forEach((legend, index) => {
        ctx.fillStyle = legend.color;
        ctx.fillRect(legendX, legendY + index * 20, 15, 3);
        ctx.fillStyle = '#333';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(legend.text, legendX + 20, legendY + index * 20 + 3);
    });
}

// Handle search
async function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        error.textContent = 'Please enter a city name';
        error.classList.remove('hidden');
        return;
    }
    
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    weatherData.classList.add('hidden');
    
    try {
        // Fetch current weather
        const currentData = await fetchWeather(city);
        
        // Fetch 7-day forecast using coordinates
        const forecastData = await fetchForecast(currentData.coord.lat, currentData.coord.lon);
        const processedForecast = processForecastData(forecastData);
        
        loading.classList.add('hidden');
        weatherData.classList.remove('hidden');
        
        displayWeather(currentData);
        displayForecast(processedForecast);
    } catch (err) {
        loading.classList.add('hidden');
        error.textContent = `Error: ${err.message}. Please check the city name and try again.`;
        error.classList.remove('hidden');
    }
}

// Event listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Load default city on page load
window.addEventListener('load', () => {
    handleSearch();
});


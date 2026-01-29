// DOM Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const loadingDiv = document.getElementById("loading");
const weatherContainer = document.getElementById("weather-container");
const errorMsg = document.getElementById("error-msg");

// Weather data elements
const cityNameEl = document.getElementById("city-name");
const dateEl = document.getElementById("date");
const tempEl = document.getElementById("temperature");
const descEl = document.getElementById("weather-desc");
const windEl = document.getElementById("wind-speed");
const humidityEl = document.getElementById("humidity");
const iconContainer = document.getElementById("weather-icon-container");

// Event Listeners
searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

// Initial Load
// Initial Load
// Parallax effect removed due to gradient focus

async function handleSearch() {
  const city = searchInput.value.trim();
  if (!city) return;

  // UI States
  loadingDiv.classList.remove("hidden");
  weatherContainer.classList.add("hidden");
  errorMsg.classList.add("hidden");

  try {
    await fetchWeatherData(city);
  } catch (error) {
    console.error(error);
    showError();
  } finally {
    loadingDiv.classList.add("hidden");
  }
}

async function fetchWeatherData(city) {
  // 1. Geocoding
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error("City not found");
  }

  const { latitude, longitude, name, country } = geoData.results[0];

  // 2. Weather Data
  // Using 'current' parameter for more detailed current weather (v1)
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
  const weatherRes = await fetch(weatherUrl);
  const weatherData = await weatherRes.json();

  updateUI(name, country, weatherData.current);
  // updateBackground removed as per user request for smoother gradient focus
}

function updateUI(city, country, current) {
  const { temperature_2m, wind_speed_10m, weather_code, relative_humidity_2m } =
    current;

  // Update Text
  cityNameEl.textContent = `${city}, ${country}`;
  tempEl.textContent = Math.round(temperature_2m);
  windEl.textContent = `${wind_speed_10m} km/h`;

  // Date
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  // Weather Code Interpretation
  const weatherInfo = getWeatherInfo(weather_code);
  descEl.textContent = weatherInfo.description;
  humidityEl.textContent = `${relative_humidity_2m}%`;

  // Update Icon
  iconContainer.innerHTML = `<i class="fas ${weatherInfo.icon}"></i>`;

  // Show Container
  weatherContainer.classList.remove("hidden");

  // Apply Code Specific Gradient to Body
  document.body.style.background = weatherInfo.gradient;
}

function showError() {
  errorMsg.classList.remove("hidden");
  document.body.style.background =
    "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)"; // Grey for error
}

// WMO Weather Interpretation
function getWeatherInfo(code) {
  // Default
  let icon = "fa-cloud";
  let description = "Unknown";
  // Deep Purple to Pink (generic)
  let gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

  if (code === 0) {
    icon = "fa-sun";
    description = "Clear Sky";
    // Bright Vibrant Orange to warm Yellow
    gradient = "linear-gradient(135deg, #FF4E50 0%, #F9D423 100%)";
  } else if ([1, 2, 3].includes(code)) {
    icon = "fa-cloud-sun";
    description = "Partly Cloudy";
    // Cyan to Blue
    gradient = "linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)";
  } else if ([45, 48].includes(code)) {
    icon = "fa-smog";
    description = "Foggy";
    // Mystical Grey/Purple
    gradient = "linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)";
  } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    icon = "fa-cloud-rain";
    description = "Rain";
    // Deep Blue to Purple
    gradient = "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    icon = "fa-snowflake";
    description = "Snow";
    // Cool White/Blue
    gradient = "linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)";
  } else if ([95, 96, 99].includes(code)) {
    icon = "fa-bolt";
    description = "Thunderstorm";
    // Dark intense Purple/Black
    gradient = "linear-gradient(135deg, #232526 0%, #414345 100%)";
  }

  return { icon, description, gradient };
}

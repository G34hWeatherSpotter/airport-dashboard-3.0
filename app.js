// ========== AIRPORT DATA ========== //
const AIRPORTS = [
  {
    name: "Heathrow (London, UK)",
    lat: 51.4706,
    lon: -0.4619,
    webcam: "https://www.youtube.com/embed/B8HS5FjvGqk"
  },
  {
    name: "Los Angeles Intl (LAX, USA)",
    lat: 33.9416,
    lon: -118.4085,
    webcam: "https://www.youtube.com/embed/2IM1Zgk2nAE"
  },
  {
    name: "Frankfurt (Germany)",
    lat: 50.0379,
    lon: 8.5622,
    webcam: "https://www.youtube.com/embed/4j7I4K9Xc0g"
  },
  {
    name: "Amsterdam Schiphol (Netherlands)",
    lat: 52.3105,
    lon: 4.7683,
    webcam: "https://www.youtube.com/embed/7xkJ-2ZC4mA"
  },
  {
    name: "Tokyo Haneda (Japan)",
    lat: 35.5494,
    lon: 139.7798,
    webcam: "https://www.youtube.com/embed/NyD2A3nav7A"
  },
  {
    name: "Sydney Kingsford Smith (Australia)",
    lat: -33.9399,
    lon: 151.1753,
    webcam: "https://www.youtube.com/embed/iQ4bR9F5s-Y"
  }
];

// ========== WEBCAM ========== //
const webcamSelect = document.getElementById('webcam-select');
const webcamFrame = document.getElementById('webcam-frame');
const webcamArea = document.getElementById('webcam-area');
const webcamSearch = document.getElementById('webcam-search');
const webcamCustom = document.getElementById('webcam-custom');
const webcamSearchBtn = document.getElementById('webcam-search-btn');
const webcamSearchLink = document.getElementById('webcam-search-link');

function populateWebcamSelect() {
  AIRPORTS.forEach((a, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = a.name;
    webcamSelect.appendChild(opt);
  });
  const custom = document.createElement('option');
  custom.value = "-1";
  custom.textContent = "Other airport...";
  webcamSelect.appendChild(custom);
}
populateWebcamSelect();

function setWebcam(idx) {
  if (idx == -1) {
    webcamArea.style.display = "none";
    webcamSearch.style.display = "";
    webcamSearchLink.innerHTML = "";
    webcamCustom.value = "";
  } else {
    webcamArea.style.display = "";
    webcamSearch.style.display = "none";
    webcamFrame.src = AIRPORTS[idx].webcam;
  }
}
webcamSelect.addEventListener('change', e => setWebcam(e.target.value));
setWebcam(0);

webcamSearchBtn.addEventListener('click', () => {
  const val = webcamCustom.value.trim();
  if (!val) return;
  const url = "https://www.youtube.com/results?search_query=" + encodeURIComponent(val + " airport live cam");
  webcamSearchLink.innerHTML = `Try searching for live cams here: <a href="${url}" target="_blank">${val} airport live cam</a>`;
});

// ========== WEATHER ========== //
const weatherSelect = document.getElementById('weather-select');
const weatherBtn = document.getElementById('weather-btn');
const weatherLoading = document.getElementById('weather-loading');
const weatherError = document.getElementById('weather-error');
const weatherResult = document.getElementById('weather-result');
const weatherSearchInput = document.getElementById('weather-search-input');
const weatherSearchBtn = document.getElementById('weather-search-btn');

// Populate dropdown
function populateWeatherSelect() {
  AIRPORTS.forEach((a, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = a.name;
    weatherSelect.appendChild(opt);
  });
}
populateWeatherSelect();

const weatherIcons = {
  0: "☀️",
  1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌦️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "🌨️",
  80: "🌧️", 81: "🌧️", 82: "🌧️",
  95: "⛈️", 96: "⛈️", 99: "⛈️"
};

// Helper: convert Celsius to Fahrenheit
function cToF(c) {
  return Math.round((c * 9/5) + 32);
}

// Helper: fetch weather by lat/lon
async function fetchWeatherByLatLon(lat, lon, label) {
  weatherLoading.style.display = "";
  weatherError.textContent = "";
  weatherResult.innerHTML = "";
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather not found");
    const data = await res.json();
    if (!data.current_weather) throw new Error("Weather not found");
    const w = data.current_weather;
    weatherResult.innerHTML = `
      <div style="font-size:2em">${weatherIcons[w.weathercode] || "❓"}</div>
      <strong>${label}</strong><br>
      <strong>Temperature:</strong> ${cToF(w.temperature)}°F<br>
      <strong>Windspeed:</strong> ${w.windspeed} km/h<br>
      <strong>Wind direction:</strong> ${w.winddirection}°<br>
      <strong>Weather code:</strong> ${w.weathercode}
    `;
  } catch (e) {
    weatherError.textContent = "Weather data unavailable for this location.";
  }
  weatherLoading.style.display = "none";
}

// Dropdown button
weatherBtn.addEventListener('click', async () => {
  const idx = weatherSelect.value;
  const { lat, lon, name } = AIRPORTS[idx];
  fetchWeatherByLatLon(lat, lon, name);
});

// Search button
weatherSearchBtn.addEventListener('click', async () => {
  const query = weatherSearchInput.value.trim();
  if (!query) return;
  weatherLoading.style.display = "";
  weatherError.textContent = "";
  weatherResult.innerHTML = "";
  try {
    // Use Nominatim to geocode city/airport/ICAO
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error("Not found");
    const { lat, lon, display_name } = data[0];
    fetchWeatherByLatLon(lat, lon, display_name);
  } catch {
    weatherLoading.style.display = "none";
    weatherError.textContent = "Could not find location. Try a city, ICAO, or airport name.";
  }
});

// Allow pressing Enter in search box to trigger search
weatherSearchInput.addEventListener('keydown', (e) => {
  if (e.key === "Enter") weatherSearchBtn.click();
});

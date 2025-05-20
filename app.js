// ========== AIRPORT DATA ========== //
const AIRPORTS = [
  {
    name: "London Heathrow (EGLL)",
    icao: "EGLL",
    iata: "LHR",
    lat: 51.4706,
    lon: -0.4619,
    webcam: "https://www.youtube.com/embed/B8HS5FjvGqk"
  },
  {
    name: "Los Angeles Intl (KLAX)",
    icao: "KLAX",
    iata: "LAX",
    lat: 33.9416,
    lon: -118.4085,
    webcam: "https://www.youtube.com/embed/2IM1Zgk2nAE"
  },
  {
    name: "Frankfurt (EDDF)",
    icao: "EDDF",
    iata: "FRA",
    lat: 50.0379,
    lon: 8.5622,
    webcam: "https://www.youtube.com/embed/4j7I4K9Xc0g"
  },
  {
    name: "Amsterdam Schiphol (EHAM)",
    icao: "EHAM",
    iata: "AMS",
    lat: 52.3105,
    lon: 4.7683,
    webcam: "https://www.youtube.com/embed/7xkJ-2ZC4mA"
  },
  {
    name: "Tokyo Haneda (RJTT)",
    icao: "RJTT",
    iata: "HND",
    lat: 35.5494,
    lon: 139.7798,
    webcam: "https://www.youtube.com/embed/NyD2A3nav7A"
  },
  {
    name: "Sydney Kingsford Smith (YSSY)",
    icao: "YSSY",
    iata: "SYD",
    lat: -33.9399,
    lon: 151.1753,
    webcam: "https://www.youtube.com/embed/iQ4bR9F5s-Y"
  }
];

const webcamFrame = document.getElementById('webcam-frame');
const radarFrame = document.getElementById('radar-frame');
const weatherResult = document.getElementById('weather-result');
const weatherLoading = document.getElementById('weather-loading');
const weatherError = document.getElementById('weather-error');
const metarResult = document.getElementById('metar-result');
const metarLoading = document.getElementById('metar-loading');
const metarError = document.getElementById('metar-error');
const sunResult = document.getElementById('sun-result');
const sunLoading = document.getElementById('sun-loading');
const sunError = document.getElementById('sun-error');
const airportSelect = document.getElementById('main-airport-select');
const displayModeSelect = document.getElementById('display-mode-select');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const infoCards = document.querySelectorAll('.info-card');

tabBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    tabBtns.forEach(b => b.classList.remove('active'));
    infoCards.forEach(card => card.style.display = 'none');
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).style.display = 'block';
  });
});

// Populate airport dropdown
function populateAirportSelect() {
  AIRPORTS.forEach((a, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = a.name;
    airportSelect.appendChild(opt);
  });
}
populateAirportSelect();

// Weather icons for Open-Meteo codes
const weatherIcons = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️", 55: "🌦️",
  61: "🌧️", 63: "🌧️", 65: "🌧️", 71: "🌨️", 73: "🌨️", 75: "🌨️",
  80: "🌧️", 81: "🌧️", 82: "🌧️", 95: "⛈️", 96: "⛈️", 99: "⛈️"
};

// Helper: Celsius to Fahrenheit
function cToF(c) {
  return Math.round((c * 9/5) + 32);
}

// Helper: pad number
function pad2(x) {
  return x.toString().padStart(2, "0");
}

// --------------- WEATHER --------------- //
async function fetchWeather(airport) {
  weatherLoading.style.display = "";
  weatherError.textContent = "";
  weatherResult.innerHTML = "";
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${airport.lat}&longitude=${airport.lon}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather not found");
    const data = await res.json();
    if (!data.current_weather) throw new Error("Weather not found");
    const w = data.current_weather;
    weatherResult.innerHTML = `
      <span class="weather-icon">${weatherIcons[w.weathercode] || "❓"}</span>
      <span style="font-size:2em;font-weight:bold;">${cToF(w.temperature)}°F</span><br>
      <span><b>Wind:</b> ${w.windspeed} km/h (${w.winddirection}°)</span><br>
      <span><b>Weather:</b> ${weatherDesc(w.weathercode)}</span>
    `;
  } catch (e) {
    weatherError.textContent = "Weather data unavailable.";
  }
  weatherLoading.style.display = "none";
}

// Open-Meteo code -> human description
function weatherDesc(code) {
  const descs = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Drizzle: Light", 53: "Drizzle: Moderate", 55: "Drizzle: Dense",
    61: "Rain: Slight", 63: "Rain: Moderate", 65: "Rain: Heavy",
    71: "Snow: Slight", 73: "Snow: Moderate", 75: "Snow: Heavy",
    80: "Rain showers: Slight", 81: "Rain showers: Moderate", 82: "Rain showers: Violent",
    95: "Thunderstorm: Slight/Moderate", 96: "Thunderstorm w/ hail: Slight", 99: "Thunderstorm w/ hail: Heavy"
  };
  return descs[code] || "Unknown";
}

// --------------- METAR/TAF --------------- //
// Uses AVWX REST API (public demo endpoint, no auth)
// https://avwx.rest/api/metar/{station}?format=json (and taf/)
async function fetchMetarTaf(airport) {
  metarLoading.style.display = "";
  metarError.textContent = "";
  metarResult.innerHTML = "";
  const icao = airport.icao || airport.iata;
  try {
    // METAR
    const metarRes = await fetch(`https://avwx.rest/api/metar/${icao}?format=json`);
    const metar = await metarRes.json();
    // TAF
    const tafRes = await fetch(`https://avwx.rest/api/taf/${icao}?format=json`);
    const taf = await tafRes.json();

    let metarStr = metar && metar.sanitized ? `<b>METAR:</b> ${metar.sanitized}<br>` : "<b>METAR:</b> unavailable<br>";
    metarStr += metar && metar.summary ? `<b>Summary:</b> ${metar.summary}<br>` : "";
    let tafStr = taf && taf.sanitized ? `<b>TAF:</b> ${taf.sanitized}<br>` : "<b>TAF:</b> unavailable<br>";
    tafStr += taf && taf.summary ? `<b>Summary:</b> ${taf.summary}<br>` : "";
    metarResult.innerHTML = metarStr + "<br>" + tafStr;
  } catch (e) {
    metarError.textContent = "METAR/TAF unavailable.";
  }
  metarLoading.style.display = "none";
}

// --------------- SUNRISE/SUNSET & TIME --------------- //
// Sunrise, sunset, and local time via sunrise-sunset.org and worldtimeapi.org
async function fetchSunTimes(airport) {
  sunLoading.style.display = "";
  sunError.textContent = "";
  sunResult.innerHTML = "";
  try {
    // Sunrise/Sunset
    const sunUrl = `https://api.sunrise-sunset.org/json?lat=${airport.lat}&lng=${airport.lon}&formatted=0`;
    const sunRes = await fetch(sunUrl);
    const sunData = await sunRes.json();
    if (!sunData || sunData.status !== "OK") throw new Error("No sun data");
    const sunrise = new Date(sunData.results.sunrise);
    const sunset = new Date(sunData.results.sunset);

    // Local time (from worldtimeapi.org by lat/lon)
    // Find timezone with nearest lat/lon (fallback to UTC)
    let timeStr = "", tzStr = "";
    try {
      // Get timezone via GeoNames (username=demo, limited, but works for demo)
      const geoUrl = `https://secure.geonames.org/timezoneJSON?lat=${airport.lat}&lng=${airport.lon}&username=demo`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      if (geoData && geoData.time && geoData.timezoneId) {
        timeStr = geoData.time.replace(/^[0-9\-]+\s/, "");
        tzStr = geoData.timezoneId;
      }
    } catch {}
    if (!timeStr) {
      // fallback: show UTC
      const now = new Date();
      timeStr = pad2(now.getUTCHours()) + ":" + pad2(now.getUTCMinutes()) + " UTC";
      tzStr = "UTC";
    }

    sunResult.innerHTML = `
      <b>Local time:</b> ${timeStr} <span style="font-size:.97em;color:#888">(${tzStr})</span><br>
      <b>Sunrise:</b> ${sunrise.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}<br>
      <b>Sunset:</b> ${sunset.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
    `;
  } catch (e) {
    sunError.textContent = "Sunrise/sunset/time unavailable.";
  }
  sunLoading.style.display = "none";
}

// --------------- WEBCAM --------------- //
function setWebcam(airport) {
  webcamFrame.src = airport.webcam;
}

// --------------- RADAR MAP --------------- //
// Optionally, could center globe.adsbexchange.com on airport coordinates by manipulating map URL fragment, but for now, keep global.

function refreshAll(airport) {
  setWebcam(airport);
  fetchWeather(airport);
  fetchMetarTaf(airport);
  fetchSunTimes(airport);
}

// Handle airport dropdown change
airportSelect.addEventListener('change', () => {
  const idx = airportSelect.value;
  refreshAll(AIRPORTS[idx]);
});

// ----------- DISPLAY MODE SWITCHING -----------
function setDisplayMode(mode) {
  document.body.classList.remove('display-monitor', 'display-tv');
  if (mode === 'tv') {
    document.body.classList.add('display-tv');
  } else {
    document.body.classList.add('display-monitor');
  }
}
// Default to monitor
setDisplayMode('monitor');

displayModeSelect.addEventListener('change', () => {
  setDisplayMode(displayModeSelect.value);
});

// Initial load
refreshAll(AIRPORTS[0]);

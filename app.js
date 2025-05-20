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

// Weather search location UI
const weatherSearchForm = document.getElementById('weather-search-form');
const weatherLocationInput = document.getElementById('weather-location-input');
const resetWeatherBtn = document.getElementById('reset-weather-btn');

// Webcam search location UI
const webcamSearchForm = document.getElementById('webcam-search-form');
const webcamLocationInput = document.getElementById('webcam-location-input');
const resetWebcamBtn = document.getElementById('reset-webcam-btn');

// Webcam custom link UI
const webcamCustomLinkForm = document.getElementById('webcam-custom-link-form');
const webcamCustomLinkInput = document.getElementById('webcam-custom-link-input');
const resetCustomLinkBtn = document.getElementById('reset-custom-link-btn');

const webcamLoading = document.getElementById('webcam-loading');
const webcamError = document.getElementById('webcam-error');

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

let customWeatherLoc = null; // {lat, lon, label}
let customWebcamLoc = null; // {query, label, youtubeEmbedUrl}
let customWebcamRawLink = null; // {url, embedUrl, label, platform}

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
async function fetchWeather(airport, customLoc) {
  weatherLoading.style.display = "";
  weatherError.textContent = "";
  weatherResult.innerHTML = "";
  let lat, lon, label;
  if (customLoc) {
    lat = customLoc.lat;
    lon = customLoc.lon;
    label = customLoc.label;
  } else {
    lat = airport.lat;
    lon = airport.lon;
    label = airport.name;
  }
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
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
      <div style="font-size:.93em;color:#448;margin-top:5px;"><b>Location:</b> ${label}</div>
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
function setWebcam(airport, customLoc, customRawLink) {
  webcamError.textContent = "";
  webcamLoading.style.display = "none";
  if (customRawLink && customRawLink.embedUrl) {
    webcamFrame.src = customRawLink.embedUrl;
    return;
  }
  if (customLoc && customLoc.youtubeEmbedUrl) {
    webcamFrame.src = customLoc.youtubeEmbedUrl;
  } else {
    webcamFrame.src = airport.webcam;
  }
}

// --------------- RADAR MAP --------------- //

// ----------- WEATHER SEARCH ----------- //
weatherSearchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = weatherLocationInput.value.trim();
  if (!query) return;
  weatherLoading.style.display = "";
  weatherError.textContent = "";
  try {
    // If query is lat,lon pair
    if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(query)) {
      const [lat, lon] = query.split(',').map(Number);
      customWeatherLoc = { lat, lon, label: `Lat: ${lat}, Lon: ${lon}` };
      fetchWeather(AIRPORTS[airportSelect.value], customWeatherLoc);
      return;
    }
    // If ICAO or IATA code (4 or 3 letters)
    if (/^[A-Z]{4}$/i.test(query)) {
      // ICAO
      const match = AIRPORTS.find(a => a.icao.toLowerCase() === query.toLowerCase());
      if (match) {
        customWeatherLoc = { lat: match.lat, lon: match.lon, label: match.name };
        fetchWeather(AIRPORTS[airportSelect.value], customWeatherLoc);
        return;
      }
    }
    if (/^[A-Z]{3}$/i.test(query)) {
      // IATA
      const match = AIRPORTS.find(a => a.iata.toLowerCase() === query.toLowerCase());
      if (match) {
        customWeatherLoc = { lat: match.lat, lon: match.lon, label: match.name };
        fetchWeather(AIRPORTS[airportSelect.value], customWeatherLoc);
        return;
      }
    }
    // City name or other: use Open-Meteo geocoding
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    if (geoData && geoData.results && geoData.results.length) {
      const place = geoData.results[0];
      customWeatherLoc = {
        lat: place.latitude,
        lon: place.longitude,
        label: place.name + (place.country ? `, ${place.country}` : '')
      };
      fetchWeather(AIRPORTS[airportSelect.value], customWeatherLoc);
      return;
    } else {
      weatherError.textContent = "Location not found.";
    }
  } catch (err) {
    weatherError.textContent = "Location not found.";
  }
  weatherLoading.style.display = "none";
});

resetWeatherBtn.addEventListener('click', () => {
  weatherLocationInput.value = "";
  customWeatherLoc = null;
  fetchWeather(AIRPORTS[airportSelect.value]);
});

// ----------- WEBCAM SEARCH ----------- //
webcamSearchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  customWebcamRawLink = null;
  const query = webcamLocationInput.value.trim();
  if (!query) return;
  webcamLoading.style.display = "";
  webcamError.textContent = "";
  try {
    // ICAO or IATA code logic (try AIRPORTS array first for match)
    let match = AIRPORTS.find(a =>
      a.icao.toLowerCase() === query.toLowerCase() ||
      a.iata.toLowerCase() === query.toLowerCase()
    );
    if (match) {
      customWebcamLoc = { query, label: match.name, youtubeEmbedUrl: match.webcam };
      setWebcam(AIRPORTS[airportSelect.value], customWebcamLoc, null);
      webcamLoading.style.display = "none";
      return;
    }
    // Otherwise, search YouTube for "Airport [query] live cam"
    // Fallback for static: Use a prebuilt mapping, or instruct user
    let ytEmbed;
    if (/heathrow|egll/i.test(query)) ytEmbed = "https://www.youtube.com/embed/B8HS5FjvGqk";
    else if (/lax|los angeles/i.test(query)) ytEmbed = "https://www.youtube.com/embed/2IM1Zgk2nAE";
    else if (/frankfurt|eddf|fra/i.test(query)) ytEmbed = "https://www.youtube.com/embed/4j7I4K9Xc0g";
    else if (/schiphol|eham|ams|amsterdam/i.test(query)) ytEmbed = "https://www.youtube.com/embed/7xkJ-2ZC4mA";
    else if (/haneda|rjtt|hnd|tokyo/i.test(query)) ytEmbed = "https://www.youtube.com/embed/NyD2A3nav7A";
    else if (/sydney|yssy|syd/i.test(query)) ytEmbed = "https://www.youtube.com/embed/iQ4bR9F5s-Y";
    else {
      webcamError.textContent = "Webcam not found for this airport. Try ICAO/IATA or a larger airport.";
      webcamLoading.style.display = "none";
      return;
    }
    customWebcamLoc = { query, label: query, youtubeEmbedUrl: ytEmbed };
    setWebcam(AIRPORTS[airportSelect.value], customWebcamLoc, null);
    webcamLoading.style.display = "none";
  } catch (err) {
    webcamError.textContent = "Webcam not found for this airport.";
    webcamLoading.style.display = "none";
  }
});

resetWebcamBtn.addEventListener('click', () => {
  webcamLocationInput.value = "";
  customWebcamLoc = null;
  customWebcamRawLink = null;
  setWebcam(AIRPORTS[airportSelect.value]);
});

// ----------- WEBCAM CUSTOM LINK ----------- //
webcamCustomLinkForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = webcamCustomLinkInput.value.trim();
  if (!url) return;
  customWebcamLoc = null;
  let embedUrl = null;
  let platform = null;
  if (/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/.test(url)) {
    // YouTube normal link
    const id = url.match(/v=([a-zA-Z0-9_-]+)/)[1];
    embedUrl = `https://www.youtube.com/embed/${id}`;
    platform = "YouTube";
  } else if (/youtu\.be\/([a-zA-Z0-9_-]+)/.test(url)) {
    // YouTube short link
    const id = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)[1];
    embedUrl = `https://www.youtube.com/embed/${id}`;
    platform = "YouTube";
  } else if (/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/.test(url)) {
    // Already embed
    embedUrl = url;
    platform = "YouTube";
  } else if (/twitch\.tv\/([a-zA-Z0-9_]+)/.test(url)) {
    // Twitch channel
    const channel = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/)[1];
    embedUrl = `https://player.twitch.tv/?channel=${channel}&parent=${location.hostname}`;
    platform = "Twitch";
  } else if (/facebook\.com\/.*\/videos\/(\d+)/.test(url)) {
    // Facebook Live, just show link (embedding is restricted)
    embedUrl = null;
    platform = "Facebook";
  } else if (/vimeo\.com\/(\d+)/.test(url)) {
    // Vimeo
    const id = url.match(/vimeo\.com\/(\d+)/)[1];
    embedUrl = `https://player.vimeo.com/video/${id}`;
    platform = "Vimeo";
  } else if (/livestream\.com\/accounts\/(\d+)\/events\/(\d+)/.test(url)) {
    // Livestream.com
    embedUrl = url.replace("livestream.com/", "livestream.com/embed/");
    platform = "Livestream";
  } else {
    // Generic: try to use as is or show error
    embedUrl = url;
    platform = "Custom";
  }
  if (embedUrl) {
    customWebcamRawLink = { url, embedUrl, platform, label: url };
    setWebcam(AIRPORTS[airportSelect.value], null, customWebcamRawLink);
  } else {
    webcamError.textContent = `Cannot embed this livestream directly. Please open in a new tab: <a href="${url}" target="_blank">${url}</a>`;
    webcamFrame.src = "";
  }
});

resetCustomLinkBtn.addEventListener('click', () => {
  webcamCustomLinkInput.value = "";
  customWebcamRawLink = null;
  setWebcam(AIRPORTS[airportSelect.value], customWebcamLoc, null);
});

// --------------- REFRESH ALL --------------- //
function refreshAll(airport) {
  setWebcam(airport, customWebcamLoc, customWebcamRawLink);
  fetchWeather(airport, customWeatherLoc);
  fetchMetarTaf(airport);
  fetchSunTimes(airport);
}

// Handle airport dropdown change
airportSelect.addEventListener('change', () => {
  customWeatherLoc = null;
  customWebcamLoc = null;
  customWebcamRawLink = null;
  weatherLocationInput.value = "";
  webcamLocationInput.value = "";
  webcamCustomLinkInput.value = "";
  refreshAll(AIRPORTS[airportSelect.value]);
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

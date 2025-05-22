// =================== ADMIN PANEL STATE ===================
let isAdmin = false;
const ADMIN_PASSWORD = "admin123"; // <-- Change this password if needed
let defaultStreamOverride = null; // If set, overrides airport webcam for everyone
let announcementText = "";

// ---- Load announcement from localStorage if available ----
if (typeof localStorage !== 'undefined') {
  const savedAnnouncement = localStorage.getItem('announcementText');
  if (savedAnnouncement !== null) {
    announcementText = savedAnnouncement;
  }
}

// ---- Load AIRPORTS from localStorage if available ----
let AIRPORTS = [];
if (typeof localStorage !== 'undefined') {
  const savedAirports = localStorage.getItem('AIRPORTS');
  if (savedAirports !== null) {
    try {
      AIRPORTS = JSON.parse(savedAirports);
    } catch (e) {
      AIRPORTS = []; // fallback in case of bad JSON
    }
  }
}
if (!Array.isArray(AIRPORTS) || AIRPORTS.length === 0) {
  AIRPORTS = [
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
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('AIRPORTS', JSON.stringify(AIRPORTS));
  }
}

// ---- Load defaultStreamOverride from localStorage if available ----
if (typeof localStorage !== 'undefined') {
  const savedDefaultStream = localStorage.getItem('defaultStreamOverride');
  if (savedDefaultStream !== null) {
    defaultStreamOverride = savedDefaultStream;
  }
}

// Utility: Save AIRPORTS to localStorage
function saveAirportsToStorage() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('AIRPORTS', JSON.stringify(AIRPORTS));
  }
}

// Utility: Save defaultStreamOverride to localStorage
function saveDefaultStreamToStorage() {
  if (typeof localStorage !== 'undefined') {
    if (defaultStreamOverride && defaultStreamOverride.length > 0) {
      localStorage.setItem('defaultStreamOverride', defaultStreamOverride);
    } else {
      localStorage.removeItem('defaultStreamOverride');
    }
  }
}

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

// Announcement Bar
const announcementBar = document.getElementById('announcement-bar');

// Admin Panel
const adminPanel = document.getElementById('admin-panel');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminLoginModal = document.getElementById('admin-login-modal');
const adminModalClose = document.getElementById('admin-modal-close');
const adminLoginForm = document.getElementById('admin-login-form');
const adminPasswordInput = document.getElementById('admin-password-input');
const adminLoginError = document.getElementById('admin-login-error');

// Admin Panel: Announcement
const adminAnnouncementInput = document.getElementById('admin-announcement-input');
const adminAnnouncementSetBtn = document.getElementById('admin-announcement-set');
const adminAnnouncementClearBtn = document.getElementById('admin-announcement-clear');

// Admin Panel: Airport Table
const adminAirportTable = document.getElementById('admin-airport-table').getElementsByTagName('tbody')[0];
const adminNewName = document.getElementById('admin-new-name');
const adminNewIcao = document.getElementById('admin-new-icao');
const adminNewIata = document.getElementById('admin-new-iata');
const adminNewLat = document.getElementById('admin-new-lat');
const adminNewLon = document.getElementById('admin-new-lon');
const adminNewWebcam = document.getElementById('admin-new-webcam');
const adminAddAirportBtn = document.getElementById('admin-add-airport');

// Admin Panel: Default Stream
const adminDefaultStreamInput = document.getElementById('admin-default-stream-input');
const adminDefaultStreamSetBtn = document.getElementById('admin-default-stream-set');
const adminDefaultStreamClearBtn = document.getElementById('admin-default-stream-clear');

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

// ==================== ADMIN PANEL LOGIC ====================
function showAdminPanel(show) {
  adminPanel.style.display = show ? "" : "none";
  adminLogoutBtn.style.display = show ? "" : "none";
  adminLoginBtn.style.display = show ? "none" : "";
  if (show) {
    renderAdminAirportTable();
    adminAnnouncementInput.value = announcementText;
    adminDefaultStreamInput.value = defaultStreamOverride || "";
  }
}

adminLoginBtn.onclick = () => {
  adminLoginModal.style.display = "flex";
  adminLoginError.textContent = "";
  adminPasswordInput.value = "";
  setTimeout(() => adminPasswordInput.focus(), 100);
};
adminLogoutBtn.onclick = () => {
  isAdmin = false;
  showAdminPanel(false);
};

adminModalClose.onclick = () => {
  adminLoginModal.style.display = "none";
};
adminLoginModal.onclick = (e) => {
  if (e.target === adminLoginModal) adminLoginModal.style.display = "none";
};

adminLoginForm.onsubmit = (e) => {
  e.preventDefault();
  if (adminPasswordInput.value === ADMIN_PASSWORD) {
    isAdmin = true;
    showAdminPanel(true);
    adminLoginModal.style.display = "none";
  } else {
    adminLoginError.textContent = "Incorrect password.";
  }
};

// --- Announcement Bar (Admin) ---
function updateAnnouncementBar() {
  if (announcementText && announcementText.trim().length > 0) {
    announcementBar.textContent = announcementText;
    announcementBar.style.display = "";
  } else {
    announcementBar.style.display = "none";
  }
}

// ---- SAVE/CLEAR announcement to localStorage ----
adminAnnouncementSetBtn.onclick = () => {
  announcementText = adminAnnouncementInput.value.trim();
  updateAnnouncementBar();
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('announcementText', announcementText);
    // Real-time sync
    localStorage.setItem('sync_announcementText', Date.now());
  }
};
adminAnnouncementClearBtn.onclick = () => {
  announcementText = "";
  adminAnnouncementInput.value = "";
  updateAnnouncementBar();
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('announcementText');
    // Real-time sync
    localStorage.setItem('sync_announcementText', Date.now());
  }
};

// --- Airport/Webcam Table (Admin) ---
function renderAdminAirportTable() {
  adminAirportTable.innerHTML = "";
  AIRPORTS.forEach((a, idx) => {
    const tr = document.createElement("tr");
    function makeCell(text, type = "text", val = "", width = "auto", inputHandler = null) {
      const td = document.createElement("td");
      if (type === "text" || type === "number") {
        const inp = document.createElement("input");
        inp.type = type;
        inp.value = text;
        inp.style.width = width;
        if (inputHandler) inp.onchange = (ev) => {
          inputHandler(inp.value);
          saveAirportsToStorage();
          // Real-time sync
          localStorage.setItem('sync_AIRPORTS', Date.now());
        };
        td.appendChild(inp);
      } else {
        td.textContent = text;
      }
      return td;
    }
    // Name, ICAO, IATA, Lat, Lon, Webcam, Remove
    tr.appendChild(makeCell(a.name, "text", a.name, "11em", v => { a.name = v; updateAirportDropdown(); }));
    tr.appendChild(makeCell(a.icao, "text", a.icao, "5em", v => { a.icao = v; updateAirportDropdown(); }));
    tr.appendChild(makeCell(a.iata, "text", a.iata, "5em", v => { a.iata = v; updateAirportDropdown(); }));
    tr.appendChild(makeCell(a.lat, "number", a.lat, "5em", v => { a.lat = parseFloat(v) || 0; }));
    tr.appendChild(makeCell(a.lon, "number", a.lon, "5em", v => { a.lon = parseFloat(v) || 0; }));
    tr.appendChild(makeCell(a.webcam, "text", a.webcam, "16em", v => { a.webcam = v; }));
    const tdRemove = document.createElement("td");
    const btnRemove = document.createElement("button");
    btnRemove.textContent = "Remove";
    btnRemove.onclick = () => {
      AIRPORTS.splice(idx, 1);
      renderAdminAirportTable();
      updateAirportDropdown();
      saveAirportsToStorage();
      // Real-time sync
      localStorage.setItem('sync_AIRPORTS', Date.now());
    };
    tdRemove.appendChild(btnRemove);
    tr.appendChild(tdRemove);
    adminAirportTable.appendChild(tr);
  });
}
adminAddAirportBtn.onclick = () => {
  const name = adminNewName.value.trim();
  const icao = adminNewIcao.value.trim();
  const iata = adminNewIata.value.trim();
  const lat = parseFloat(adminNewLat.value);
  const lon = parseFloat(adminNewLon.value);
  const webcam = adminNewWebcam.value.trim();
  if (!name || !icao || isNaN(lat) || isNaN(lon) || !webcam) {
    alert("Please fill all required fields (Name, ICAO, Lat, Lon, Webcam).");
    return;
  }
  AIRPORTS.push({ name, icao, iata, lat, lon, webcam });
  adminNewName.value = adminNewIcao.value = adminNewIata.value = adminNewLat.value = adminNewLon.value = adminNewWebcam.value = "";
  renderAdminAirportTable();
  updateAirportDropdown();
  saveAirportsToStorage();
  // Real-time sync
  localStorage.setItem('sync_AIRPORTS', Date.now());
};

// --- Default Stream (Admin) ---
adminDefaultStreamSetBtn.onclick = () => {
  defaultStreamOverride = adminDefaultStreamInput.value.trim();
  saveDefaultStreamToStorage();
  // Real-time sync
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('sync_defaultStreamOverride', Date.now());
  }
  refreshAll(AIRPORTS[airportSelect.value]);
};
adminDefaultStreamClearBtn.onclick = () => {
  defaultStreamOverride = null;
  adminDefaultStreamInput.value = "";
  saveDefaultStreamToStorage();
  // Real-time sync
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('sync_defaultStreamOverride', Date.now());
  }
  refreshAll(AIRPORTS[airportSelect.value]);
};

// ========== UI LOGIC (DASHBOARD) ==========

function updateAirportDropdown() {
  const curIdx = airportSelect.value;
  airportSelect.innerHTML = "";
  AIRPORTS.forEach((a, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = a.name;
    airportSelect.appendChild(opt);
  });
  if (curIdx < AIRPORTS.length) airportSelect.value = curIdx;
}
updateAirportDropdown();

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

// Helper: Celsius to Fahrenheit
function cToF(c) {
  return Math.round((c * 9/5) + 32);
}
function pad2(x) {
  return x.toString().padStart(2, "0");
}

// WEATHER
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

// METAR/TAF
async function fetchMetarTaf(airport) {
  metarLoading.style.display = "";
  metarError.textContent = "";
  metarResult.innerHTML = "";
  const icao = airport.icao || airport.iata;
  try {
    const metarRes = await fetch(`https://avwx.rest/api/metar/${icao}?format=json`);
    const metar = await metarRes.json();
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

// SUNRISE/SUNSET & TIME
async function fetchSunTimes(airport) {
  sunLoading.style.display = "";
  sunError.textContent = "";
  sunResult.innerHTML = "";
  try {
    const sunUrl = `https://api.sunrise-sunset.org/json?lat=${airport.lat}&lng=${airport.lon}&formatted=0`;
    const sunRes = await fetch(sunUrl);
    const sunData = await sunRes.json();
    if (!sunData || sunData.status !== "OK") throw new Error("No sun data");
    const sunrise = new Date(sunData.results.sunrise);
    const sunset = new Date(sunData.results.sunset);
    let timeStr = "", tzStr = "";
    try {
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

// WEBCAM
function setWebcam(airport, customLoc, customRawLink) {
  webcamError.textContent = "";
  webcamLoading.style.display = "none";
  if (defaultStreamOverride && defaultStreamOverride.length > 0) {
    webcamFrame.src = defaultStreamOverride;
    return;
  }
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

// ----------- WEATHER SEARCH ----------- //
weatherSearchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = weatherLocationInput.value.trim();
  if (!query) return;
  weatherLoading.style.display = "";
  weatherError.textContent = "";
  try {
    if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(query)) {
      const [lat, lon] = query.split(',').map(Number);
      customWeatherLoc = { lat, lon, label: `Lat: ${lat}, Lon: ${lon}` };
      fetchWeather(AIRPORTS[airportSelect.value], customWeatherLoc);
      return;
    }
    if (/^[A-Z]{4}$/i.test(query)) {
      const match = AIRPORTS.find(a => a.icao.toLowerCase() === query.toLowerCase());
      if (match) {
        customWeatherLoc = { lat: match.lat, lon: match.lon, label: match.name };
        fetchWeather(AIRPORTS[airportSelect.value], customWeatherLoc);
        return;
      }
    }
    if (/^[A-Z]{3}$/i.test(query)) {
      const match = AIRPORTS.find(a => a.iata.toLowerCase() === query.toLowerCase());
      if (match) {
        customWeatherLoc = { lat: match.lat, lon: match.lon, label: match.name };
        fetchWeather(AIRPORTS[airportSelect.value], customWeatherLoc);
        return;
      }
    }
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
    const id = url.match(/v=([a-zA-Z0-9_-]+)/)[1];
    embedUrl = `https://www.youtube.com/embed/${id}`;
    platform = "YouTube";
  } else if (/youtu\.be\/([a-zA-Z0-9_-]+)/.test(url)) {
    const id = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)[1];
    embedUrl = `https://www.youtube.com/embed/${id}`;
    platform = "YouTube";
  } else if (/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/.test(url)) {
    embedUrl = url;
    platform = "YouTube";
  } else if (/twitch\.tv\/([a-zA-Z0-9_]+)/.test(url)) {
    const channel = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/)[1];
    embedUrl = `https://player.twitch.tv/?channel=${channel}&parent=${location.hostname}`;
    platform = "Twitch";
  } else if (/facebook\.com\/.*\/videos\/(\d+)/.test(url)) {
    embedUrl = null;
    platform = "Facebook";
  } else if (/vimeo\.com\/(\d+)/.test(url)) {
    const id = url.match(/vimeo\.com\/(\d+)/)[1];
    embedUrl = `https://player.vimeo.com/video/${id}`;
    platform = "Vimeo";
  } else if (/livestream\.com\/accounts\/(\d+)\/events\/(\d+)/.test(url)) {
    embedUrl = url.replace("livestream.com/", "livestream.com/embed/");
    platform = "Livestream";
  } else {
    embedUrl = url;
    platform = "Custom";
  }
  if (embedUrl) {
    customWebcamRawLink = { url, embedUrl, platform, label: url };
    setWebcam(AIRPORTS[airportSelect.value], null, customWebcamRawLink);
  } else {
    webcamError.innerHTML = `Cannot embed this livestream directly. Please open in a new tab: <a href="${url}" target="_blank">${url}</a>`;
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
  updateAnnouncementBar();
}
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
setDisplayMode('monitor');
displayModeSelect.addEventListener('change', () => {
  setDisplayMode(displayModeSelect.value);
});

// ----------- REAL-TIME SYNC ACROSS TABS (ALL SETTINGS) -----------
window.addEventListener('storage', function(event) {
  // AIRPORTS Table
  if (event.key === 'AIRPORTS' || event.key === 'sync_AIRPORTS') {
    try {
      const updatedAirports = JSON.parse(localStorage.getItem('AIRPORTS'));
      if (Array.isArray(updatedAirports)) {
        AIRPORTS = updatedAirports;
        updateAirportDropdown();
        renderAdminAirportTable();
        refreshAll(AIRPORTS[airportSelect.value] || AIRPORTS[0]);
      }
    } catch (e) {}
  }
  // Announcement
  if (event.key === 'announcementText' || event.key === 'sync_announcementText') {
    announcementText = localStorage.getItem('announcementText') || "";
    updateAnnouncementBar();
    if (isAdmin) adminAnnouncementInput.value = announcementText;
  }
  // Default Stream
  if (event.key === 'defaultStreamOverride' || event.key === 'sync_defaultStreamOverride') {
    defaultStreamOverride = localStorage.getItem('defaultStreamOverride') || null;
    if (isAdmin) adminDefaultStreamInput.value = defaultStreamOverride || "";
    refreshAll(AIRPORTS[airportSelect.value] || AIRPORTS[0]);
  }
});

// Initial load
refreshAll(AIRPORTS[0]);

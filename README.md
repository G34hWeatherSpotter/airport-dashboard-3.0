# Airport Dashboard 3.0

A live, glanceable dashboard for aviation fans!  
See real-time airport webcams, flight radar, weather, decoded METAR/TAF, and sunrise/sunset for your favorite airports—all on one page.

---

## Features

- **Live Airport Webcam:**  
  Watch a live stream from the selected airport.

- **Flight Radar Map:**  
  See real-time air traffic near your airport.

- **Current Weather:**  
  Big, bold current conditions in Fahrenheit, with wind and sky status.

- **METAR & TAF:**  
  Latest aviation weather reports, decoded for easy reading.

- **Sunrise, Sunset & Local Time:**  
  Know the sun's schedule and current local time at your airport.

- **Display Mode Switch:**  
  Instantly optimize the dashboard for a monitor/small TV or a big TV/projector.

- **Responsive Design:**  
  Looks great on any device—cards scale and rearrange automatically.

---

## Usage

1. **Open `index.html` in your browser.**
2. **Choose an airport** from the dropdown.
3. **Choose your display mode:**  
   - **Monitor/Small TV** for a desk or close-up viewing  
   - **Large TV/Projector** for big rooms or distant viewing

All data loads live—no backend or sign-in needed!

---

## Tech & Data Sources

- **Webcam:** YouTube live streams from major airports.
- **Flight Radar:** [ADSBexchange Globe](https://globe.adsbexchange.com/)
- **Weather:** [Open-Meteo API](https://open-meteo.com/)
- **METAR/TAF:** [AVWX REST API](https://avwx.rest/)
- **Sunrise/Sunset:** [sunrise-sunset.org](https://sunrise-sunset.org/api)
- **Local Time:** [GeoNames Timezone API](https://www.geonames.org/export/web-services.html#timezone)

---

## Notes

- For best results, use a modern browser (Chrome, Edge, Firefox).
- Only public/free APIs are used.
- METAR/TAF limits apply for demo API keys—occasional brief outages may occur.
- Webcam sources are subject to change if YouTube streams are updated.

---

## Customization

- To add more airports, edit the `AIRPORTS` array in `app.js`.
- To adjust card layout and styles, edit `style.css`.

---

## License

This project is open-source and for personal, non-commercial use only.  
See [LICENSE](LICENSE) or add your own if you plan to distribute.

---

**Made for aviation enthusiasts!**

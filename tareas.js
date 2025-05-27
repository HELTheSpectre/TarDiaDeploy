import cron from 'node-cron';
import fetch from 'node-fetch';
import { fetch } from 'undici';

export function programarTareas(chatId, bot) {
  // Clima diario a las 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    const ciudad = "Mendoza";
    const apiKey = "TU_API_KEY_OPENWEATHERMAP";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&units=metric&appid=${apiKey}&lang=es`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const temp = data.main.temp;
      const desc = data.weather[0].description;

      const mensaje = `☀️ Hoy en ${ciudad}: ${temp}°C, ${desc}.`;
      bot.sendMessage(chatId, mensaje);
    } catch (err) {
      console.error("Error al obtener el clima:", err);
    }
  });
}

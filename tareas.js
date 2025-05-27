import cron from 'node-cron';
import { fetch } from 'undici';
import { DateTime } from 'luxon';
import dotenv from 'dotenv';

dotenv.config();

const tareasProgramadas = new Set(); // Para evitar tareas duplicadas

// 🟡 Programa el clima según zona horaria del usuario
export function programarClimaUTC(chatId, bot, offset, horaLocal) {
  const utcHour = (horaLocal - offset + 24) % 24;
  const tareaId = `clima-${chatId}`;

  if (tareasProgramadas.has(tareaId)) return;

  console.log(`⏰ Programando clima para las ${utcHour}:00 UTC (chat ${chatId})`);
  tareasProgramadas.add(tareaId);

  cron.schedule(`0 ${utcHour} * * *`, async () => {
    const ciudad = "Mendoza"; // Se puede personalizar a futuro
    const apiKey = process.env.WEATHER_API_KEY;
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

// 🟣 Programa la noticia según zona horaria del usuario
export function programarNoticiaUTC(chatId, bot, offset, horaLocal) {
  const utcHour = (horaLocal - offset + 24) % 24;
  const tareaId = `noticia-${chatId}`;

  if (tareasProgramadas.has(tareaId)) return;

  console.log(`⏰ Programando noticia para las ${utcHour}:00 UTC (chat ${chatId})`);
  tareasProgramadas.add(tareaId);

  cron.schedule(`0 ${utcHour} * * *`, async () => {
    const apiKey = process.env.NEWS_API_KEY;
    const url = `https://gnews.io/api/v4/top-headlines?lang=es&max=1&token=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.articles && data.articles.length > 0) {
        const noticia = data.articles[0];
        const mensaje = `🗞️ Noticia del día:\n*${noticia.title}*\n${noticia.description}\n${noticia.url}`;
        bot.sendMessage(chatId, mensaje, { parse_mode: 'Markdown' });
      } else {
        bot.sendMessage(chatId, "No se encontró ninguna noticia para hoy.");
      }
    } catch (err) {
      console.error("Error al obtener noticias:", err);
      bot.sendMessage(chatId, "❌ Hubo un problema al consultar noticias.");
    }
  });
}


//TestFuncion
export async function enviarClimaInstantaneo(chatId, bot) {
  const ciudad = "Mendoza";
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&units=metric&appid=${apiKey}&lang=es`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const temp = data.main.temp;
    const desc = data.weather[0].description;

    const mensaje = `☀️ Clima actual en ${ciudad}: ${temp}°C, ${desc}.`;
    bot.sendMessage(chatId, mensaje);
  } catch (err) {
    console.error("Error en clima instantáneo:", err);
    bot.sendMessage(chatId, "❌ Hubo un problema al consultar el clima.");
  }
}

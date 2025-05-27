import cron from 'node-cron';

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

//Mandar Noticia 
cron.schedule('0 1 * * *', async () => {
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

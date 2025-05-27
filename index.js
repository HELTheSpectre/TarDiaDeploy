import express from 'express'; 
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { programarTareas } from './tareas.js';

dotenv.config();

// --- Servidor Express mínimo para Render ---
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot TarDía funcionando');
});

app.listen(port, () => {
  console.log(`Servidor Express escuchando en puerto ${port}`);
});
// --------------------------------------------

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// /start con menú
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, `¡Hola ${msg.from.first_name}! Soy TarDía 🤖\nElegí qué querés que te envíe automáticamente todos los días:`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "☀️ Clima a las 8:00 AM", callback_data: 'clima_diario' }],
        [{ text: "🗞 Noticias a la 8:00 AM", callback_data: 'noticias_diarias' }]
      ]
    }
  });
});

// Opciones del menú
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;

  if (callbackQuery.data === 'clima_diario') {
    programarTareas(chatId, bot);
    bot.sendMessage(chatId, "✅ ¡Listo! Vas a recibir el clima todos los días a las 8:00 AM.");
  }

  bot.answerCallbackQuery(callbackQuery.id);
});

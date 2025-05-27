import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import {
  programarClimaUTC,
  programarNoticiaUTC
} from './tareas.js';

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

// Guardar zona horaria en memoria (simple para prueba)
const zonasUsuarios = {}; // { chatId: offset }

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, `¡Hola ${msg.from.first_name}! Soy TarDía 🤖\nPrimero, elegí tu zona horaria:`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇦🇷 GMT-3 (Argentina)", callback_data: 'tz_-3' }],
        [{ text: "🇲🇽 GMT-6 (México)", callback_data: 'tz_-6' }],
        [{ text: "🇪🇸 GMT+1 (España)", callback_data: 'tz_1' }]
      ]
    }
  });
});


bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  // --- ZONA HORARIA ---
  if (data.startsWith('tz_')) {
    const offset = parseInt(data.split('_')[1]);
    zonasUsuarios[chatId] = offset;

    bot.sendMessage(chatId, "✅ Zona horaria guardada.\nAhora elegí qué querés recibir cada día:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "☀️ Clima a las 8:00 AM", callback_data: 'clima_diario' }],
          [{ text: "🗞 Noticias a las 8:00 AM", callback_data: 'noticias_diarias' }]
        ]
      }
    });
  }

  // --- CLIMA ---
  if (data === 'clima_diario') {
    const offset = zonasUsuarios[chatId];
    if (offset === undefined) {
      bot.sendMessage(chatId, "⚠️ Primero seleccioná tu zona horaria con /start.");
      return;
    }

    const horaLocal = 8; // 8:00 AM local
    programarClimaUTC(chatId, bot, offset, horaLocal);
    bot.sendMessage(chatId, "✅ ¡Listo! Vas a recibir el clima todos los días a las 8:00 AM.");
  }

  // --- NOTICIAS ---
  if (data === 'noticias_diarias') {
    const offset = zonasUsuarios[chatId];
    if (offset === undefined) {
      bot.sendMessage(chatId, "⚠️ Primero seleccioná tu zona horaria con /start.");
      return;
    }

    const horaLocal = 8; // 8:00 AM local
    programarNoticiaUTC(chatId, bot, offset, horaLocal);
    bot.sendMessage(chatId, "✅ ¡Listo! Vas a recibir una noticia todos los días a las 8:00 AM.");
  }
  

  bot.answerCallbackQuery(callbackQuery.id);
});

//Test 

import { enviarClimaInstantaneo } from './tareas.js';

bot.onText(/\/test_clima/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🔄 Probando clima en tiempo real...");
  enviarClimaInstantaneo(chatId, bot);
});

import { enviarNoticiaInstantanea } from './tareas.js';

bot.onText(/\/test_noticia/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "📰 Buscando noticia de prueba...");
  enviarNoticiaInstantanea(chatId, bot);
});

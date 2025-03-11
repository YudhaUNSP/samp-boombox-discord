require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const { loadData, saveData } = require('./utils/storage');
const { formatDuration } = require('./utils/fileUtils');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const BASE_URL = process.env.BASE_URL;
const PORT = process.env.PORT || 3000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Memuat data file yang diupload dari storage.json
const userFiles = loadData();

// Map untuk menyimpan timeoutId secara in-memory (tidak disimpan ke JSON)
const inMemoryTimeouts = new Map();

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Jalankan server Express untuk menyajikan file secara statis
const app = express();
app.use('/uploads', express.static(uploadsDir));
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});

// Muat semua command dari folder commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.name, command);
}

// Ketika bot sudah siap, atur status dan registrasikan slash commands
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Atur status bot
  client.user.setPresence({
    activities: [{
      name: 'Boombox | /upload',
      type: 0 // "Playing"
    }],
    status: 'online'
  });

  // Registrasi slash commands
  const commandsData = client.commands.map(cmd => ({
    name: cmd.name,
    description: cmd.description,
    options: cmd.options || []
  }));
  await client.application.commands.set(commandsData);
  console.log('Slash commands registered!');

  // Jadwalkan ulang penghapusan file yang belum kedaluwarsa
  reScheduleAllDeletions();
});

// Handler untuk slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const context = {
    BASE_URL,
    uploadsDir,
    userFiles,
    formatDuration,
    saveData,
    inMemoryTimeouts
  };

  try {
    await command.execute(interaction, context);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Terjadi kesalahan saat mengeksekusi command.', ephemeral: true });
  }
});

client.login(DISCORD_BOT_TOKEN);

/**
 * reScheduleAllDeletions()
 * Mengecek setiap file di userFiles:
 * - Jika deleteTime sudah lewat, file dihapus langsung.
 * - Jika belum, dibuat setTimeout baru untuk menghapusnya pada waktu yang tersisa.
 */
function reScheduleAllDeletions() {
  for (const [userId, files] of userFiles.entries()) {
    for (const fileRecord of files) {
      const { storedName, deleteTime } = fileRecord;
      const filePath = path.join(uploadsDir, storedName);
      const key = `${userId}#${storedName}`;

      const timeLeft = deleteTime - Date.now();
      if (timeLeft <= 0) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`File ${storedName} langsung dihapus (kedaluwarsa).`);
        }
        files.splice(files.indexOf(fileRecord), 1);
      } else {
        const timeoutId = setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, err => {
              if (err) console.error(`Error deleting file ${storedName}:`, err);
              else console.log(`File ${storedName} deleted after expiration.`);
            });
          }
          const idx = files.indexOf(fileRecord);
          if (idx !== -1) files.splice(idx, 1);
          if (files.length === 0) userFiles.delete(userId);
          inMemoryTimeouts.delete(key);
          saveData(userFiles);
        }, timeLeft);

        inMemoryTimeouts.set(key, timeoutId);
      }
    }
    if (files.length === 0) {
      userFiles.delete(userId);
    }
  }
  saveData(userFiles);
}

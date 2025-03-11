// commands/upload.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB dalam byte

module.exports = {
  name: 'upload',
  description: 'Upload file ke server (hanya MP3, maksimal 15MB)',
  options: [
    {
      name: 'file',
      type: 11, // Attachment type
      description: 'Pilih file untuk diupload (MP3, max 15MB)',
      required: true
    }
  ],
  async execute(interaction, context) {
    await interaction.deferReply({ ephemeral: true });

    const { uploadsDir, BASE_URL, userFiles, fileUtils, saveData } = context;
    const attachment = interaction.options.getAttachment('file');
    if (!attachment) {
      return interaction.editReply('Attachment file tidak ditemukan.');
    }

    // Periksa ekstensi file (hanya .mp3)
    const ext = path.extname(attachment.name);
    if (ext.toLowerCase() !== '.mp3') {
      return interaction.editReply('⚠️ Hanya file MP3 yang diperbolehkan untuk diupload.');
    }

    // Periksa ukuran file (maksimal 15MB)
    if (attachment.size > MAX_FILE_SIZE) {
      return interaction.editReply('⚠️ Ukuran file tidak boleh lebih dari 15MB.');
    }

    try {
      const originalUrl = attachment.url;
      const originalName = attachment.name;
      const nameWithoutExt = path.basename(originalName, ext);
      const randomNum = Math.floor(100 + Math.random() * 900);
      const storedName = `${nameWithoutExt}-${randomNum}${ext}`;
      const filePath = path.join(uploadsDir, storedName);
      const fileLink = `${BASE_URL}/uploads/${storedName}`;
      const deleteTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 1 minggu

      // Download file dari Discord
      const response = await axios({ url: originalUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        // Jadwalkan penghapusan file setelah 1 minggu
        const timeoutId = setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, err => {
              if (err) console.error(`Error deleting file ${storedName}:`, err);
              else console.log(`File ${storedName} deleted after expiration.`);
            });
          }
          const filesArr = userFiles.get(interaction.user.id) || [];
          const idx = filesArr.findIndex(f => f.storedName === storedName);
          if (idx !== -1) filesArr.splice(idx, 1);
          if (filesArr.length === 0) userFiles.delete(interaction.user.id);
          saveData(userFiles);
        }, 7 * 24 * 60 * 60 * 1000);

        // Simpan data file (timeoutId tidak akan tersimpan karena kita gunakan replacer atau hapus secara manual saat saveData)
        const fileRecord = {
          storedName,
          originalName,
          url: fileLink,
          uploadTime: Date.now(),
          deleteTime,
          timeoutId
        };
        if (!userFiles.has(interaction.user.id)) {
          userFiles.set(interaction.user.id, []);
        }
        userFiles.get(interaction.user.id).push(fileRecord);
        saveData(userFiles);

        // Buat embed dengan satu link klik (Markdown)
        const embed = new EmbedBuilder()
          .setTitle('File Berhasil Diupload!')
          .setDescription(`File **[${storedName}](${fileLink})** telah berhasil diupload!`)
          .addFields({ name: 'Waktu Hapus', value: '1 minggu', inline: true })
          .setColor('#00FFFF')
          .setFooter({ text: 'Uploader Bot' })
          .setTimestamp();

        interaction.editReply({ embeds: [embed] });
        console.log(`File ${storedName} diupload oleh ${interaction.user.tag}`);
      });

      writer.on('error', err => {
        console.error('Error menulis file:', err);
        interaction.editReply('Terjadi kesalahan saat menyimpan file.');
      });
    } catch (error) {
      console.error('Error processing upload:', error);
      interaction.editReply('Terjadi kesalahan saat memproses upload file.');
    }
  }
};
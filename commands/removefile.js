const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'removefile',
  description: 'Hapus salah satu file yang kamu upload',
  options: [
    {
      name: 'filename',
      type: 3, // String type
      description: 'Nama file yang tersimpan (misal: file-123.ext)',
      required: true
    }
  ],
  async execute(interaction, context) {
    // Tunda balasan
    await interaction.deferReply({ ephemeral: true });

    const { uploadsDir, userFiles } = context;
    const filename = interaction.options.getString('filename');

    if (!userFiles.has(interaction.user.id)) {
      return await interaction.editReply({ content: 'Kamu belum mengupload file apapun.' });
    }

    const files = userFiles.get(interaction.user.id);
    const fileIndex = files.findIndex(file => file.storedName === filename);
    if (fileIndex === -1) {
      return await interaction.editReply({ content: 'File tidak ditemukan di uploadan kamu.' });
    }

    const fileRecord = files[fileIndex];
    const filePath = path.join(uploadsDir, fileRecord.storedName);

    // Batalkan jadwal penghapusan
    clearTimeout(fileRecord.timeoutId);

    // Coba hapus file dari disk
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, err => {
        if (err) {
          console.error(`Error menghapus file ${fileRecord.storedName}:`, err);
          return interaction.editReply({ content: 'Terjadi kesalahan saat menghapus file.' });
        }
        // Hapus dari in-memory storage
        files.splice(fileIndex, 1);
        if (files.length === 0) userFiles.delete(interaction.user.id);

        // Buat embed konfirmasi
        const embed = new EmbedBuilder()
          .setTitle('File Dihapus')
          .setDescription(`File **${fileRecord.storedName}** berhasil dihapus.`)
          .setColor('#FF0000')
          .setTimestamp()
          .setFooter({ text: 'Uploader Bot' });

        interaction.editReply({ embeds: [embed] });
        console.log(`File ${fileRecord.storedName} dihapus oleh ${interaction.user.tag}`);
      });
    } else {
      await interaction.editReply({ content: 'File tidak ditemukan di server.' });
    }
  }
};

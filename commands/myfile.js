// commands/myfile.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'myfile',
  description: 'Lihat file yang sudah kamu upload',
  async execute(interaction, context) {
    // Jangan lupa deferReply untuk menghindari timeout
    await interaction.deferReply({ ephemeral: true });
    
    // Destructure context; pastikan formatDuration sudah didefinisikan di context
    const { userFiles, formatDuration } = context;
    
    if (!userFiles.has(interaction.user.id) || userFiles.get(interaction.user.id).length === 0) {
      // Gunakan return agar tidak terjadi reply ganda
      return interaction.editReply('Kamu belum mengupload file apapun.');
    }
    
    const files = userFiles.get(interaction.user.id);
    let descriptionText = '';
    for (const file of files) {
      const timeLeft = file.deleteTime - Date.now();
      // Pastikan formatDuration terdefinisi; jika tidak, Anda bisa mengganti dengan timeLeft secara langsung
      descriptionText += `**[${file.storedName}](${file.url})**\nExpires in: ${formatDuration(timeLeft)}\n\n`;
    }
    
    const embed = new EmbedBuilder()
      .setTitle('Daftar File yang Kamu Upload')
      .setDescription(descriptionText)
      .setColor('#00FFFF')
      .setFooter({ text: 'Uploader Bot' })
      .setTimestamp();
    
    // Kirim satu kali reply dengan embed
    return interaction.editReply({ embeds: [embed] });
  }
};
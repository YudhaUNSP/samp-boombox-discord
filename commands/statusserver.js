const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'statusserver',
  description: 'Lihat status server dan jumlah file yang tersimpan',
  async execute(interaction, context) {
    // Tunda balasan
    await interaction.deferReply({ ephemeral: false });

    const { userFiles } = context;
    let totalFiles = 0;
    userFiles.forEach(files => {
      totalFiles += files.length;
    });

    const embed = new EmbedBuilder()
      .setTitle('Status Server')
      .setDescription(`Server sedang berjalan.\nTotal file yang tersimpan: **${totalFiles}**`)
      .setColor('#00FFFF')
      .setTimestamp()
      .setFooter({ text: 'Uploader Bot' });

    await interaction.editReply({ embeds: [embed] });
  }
};

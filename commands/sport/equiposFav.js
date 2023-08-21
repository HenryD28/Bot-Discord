const { SlashCommandBuilder, codeBlock } = require('discord.js');
const db = require('../../db');
const { AsciiTable3, AlignmentEnum } = require('ascii-table3');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('team-favorite')
    .setDescription('Tus equipos favoritos!'),
  async execute(interaction) {
    try {
      const id = interaction.user.id;

      const equiposFav = db
        .prepare(`
      SELECT * FROM equiposFav
      WHERE discord_id = ?
      `)
        .all(id);
      const formatedTeams = equiposFav.map(team => [team?.team || '']);

      const table =
    new AsciiTable3('')
      .setHeading('Mis equipos Favoritos')
      .setAlign(1, AlignmentEnum.CENTER)
      .addRowMatrix(formatedTeams);

      await interaction.reply(codeBlock(table));
    } catch (error) {
      console.log(error);
      await interaction.reply('Ha habido un error');
    }
  },
};
const { SlashCommandBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-note')
    .setDescription('Crea una nueva nota!')
    .addStringOption(option =>
      option
        .setName('titulo')
        .setDescription('El titulo de la nota')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('descripcion')
        .setDescription('La descripcion de la nota'),
    ),
  async execute(interaction) {
    try {
      const title = interaction.options.getString('titulo');
      const descrption = interaction.options.getString('descripcion');
      const id = interaction.user.id;

      db.prepare(`
      INSERT INTO notes (title, description, discord_id)
      VALUES (?,?,?)
      `)
        .run(title, descrption, id);
      const button = new ButtonBuilder()
        .setCustomId('primary')
        .setLabel('Like')
        .setStyle(ButtonStyle.Primary);


      const row = new ActionRowBuilder()
        .addComponents(button);

      const response = await interaction.reply({
        content: `Nota creada "${title}" para <@${id}>`,
        components: [row],
      });

      const collectorFilter = i => i.user.id === interaction.user.id;
      try {
        const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

        if (confirmation.customId === 'primary') {
          console.log('Click');
        }
      } catch (e) {
        await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
      }
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return await interaction.reply('El usuario no existe! Crea un usuario para poder usar las notas');
      }
      console.log(error);
      await interaction.reply('Ha habido un error');
    }
  },
};
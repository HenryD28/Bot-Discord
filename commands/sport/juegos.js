const { default: axios } = require('axios');
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const db = require('../../db');
// const db = require('../../db');

const createEmbed = (team) => {

  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(team.teamName)
    .setDescription('Informacion del pais')
    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Major_League_Baseball_logo.svg/1200px-Major_League_Baseball_logo.svg.png')
    .addFields(
      { name: 'Ciudad', value: `${team.teamCity}`, inline: true },
      { name: 'Juegos Ganados', value: `${team.wins}`, inline: true },
      { name: 'Juegos Perdidos', value: `${team.loss}`, inline: true },
    )
    .setImage(team.espnLogo1);
  return exampleEmbed;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('games')
    .setDescription('Muestra la informacion de un deporte!')
    .addStringOption(option =>
      option
        .setName('nombre')
        .setDescription('El nombre del equipo a buscar')
        .setRequired(true),
    ),
  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    await interaction.deferReply();
    const name = interaction.options.getString('nombre');
    const id = interaction.user.id;
    const options = {
      method: 'GET',
      url: 'https://tank01-mlb-live-in-game-real-time-statistics.p.rapidapi.com/getMLBTeams',
      params: {
        teamStats: 'true',
        topPerformers: 'true',
      },
      headers: {
        'X-RapidAPI-Key': 'abff9c1188msh5e018a15bee5ac4p1e94ddjsn0f0ceb8b3785',
        'X-RapidAPI-Host': 'tank01-mlb-live-in-game-real-time-statistics.p.rapidapi.com',
      },
    };
    try {
      const addBtn = new ButtonBuilder()
        .setCustomId('add')
        .setLabel('Añadir a favoritos')
        .setStyle(ButtonStyle.Primary);

      const deleteBtn = new ButtonBuilder()
        .setCustomId('delete')
        .setLabel('Quitar de favoritos')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder()
        .addComponents(addBtn);
      const deleteRow = new ActionRowBuilder()
        .addComponents(deleteBtn);


      const response = await axios.request(options);
      const deporte = response.data.body;
      const equipo = deporte.find(team => team.teamName.toLowerCase() === name);
      const idTeam = equipo.teamID;
      console.log(idTeam);
      const embed = createEmbed(equipo);
      const favorite = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      // const date = db.prepare(`
      //  SELECT *
      //  FROM equiposFav
      //  WHERE discord_id = ?
      //  `).all(id);
      // console.log(date);
      // if (date[0].teamID[0] === idTeam && date[0].team[0] === name && date[0].discord_id === id) {
      //   console.log('comprobando');
      // }

      const collector = favorite.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });
      collector.on('collect', async i => {
        const newID = i.user.id;

        if (i.customId === 'add' && newID === id) {
          db.prepare(`
          INSERT INTO equiposFav (teamID, team, discord_id)
          VALUES (?,?,?)
          `).run(idTeam, name, id);
          await i.update({
            components:[ deleteRow ],
          });
        } else if (i.customId === 'delete' && newID === id) {
          db.prepare(`
          DELETE FROM equiposFav
          WHERE discord_id = ?
          `).run(id);
          await i.update({
            components:[ row ],
          });
        }
      });


    } catch (error) {
      console.log(error);
      await interaction.editReply('El equipo no existe 😵‍💫');
    }
  },
};


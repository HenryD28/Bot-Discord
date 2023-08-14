const { default: axios } = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


const createEmbed = (country, weather) => {

  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(country.name.common)
    .setURL(`https://en.wikipedia.org/wiki/${country.name.common}`)
    .setDescription('Informacion del pais')
    .setThumbnail(`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`)
    .addFields(
      { name: 'Capital', value: `${country.capital[0]}`, inline: true },
      { name: 'Poblacion', value: `${country.population}`, inline: true },
      { name: 'Temperatura', value: `${weather.main.temp} °C `, inline: true },
    )
    .setImage(country.flags.png);
  return exampleEmbed;
};


module.exports = {
  data: new SlashCommandBuilder()
    .setName('buscar-pais')
    .setDescription('Muestra la informacion de un pais')
    .addStringOption(option =>
      option
        .setName('nombre')
        .setDescription('El nombre del pais a buscar')
        .setRequired(true),
    ),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      const name = interaction.options.getString('nombre');
      const { data: country } = await axios.get(`https://restcountries.com/v3.1/name/${name}`);
      const lat = country[0].latlng[0];
      const lon = country[0].latlng[1];
      const { data: weather } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lon}&appid=80bda2b60cbfead6a8b0d60e91db8d0d`);
      const embed = createEmbed(country[0], weather);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
      await interaction.reply('El pais no existe 😵‍💫');
    }
  },
};
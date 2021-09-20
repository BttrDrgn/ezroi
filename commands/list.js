const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

module.exports =
{
	async execute(interaction)
	{
		let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));
		let list = "";

		for(let i = 0; i < json.devices.length; i++)
		{
			list += `${json.devices[i][2]} [${json.devices[i][0]}]\n`;
		}

		let embed = new MessageEmbed()
			.setAuthor("EzROI", interaction.client.user.displayAvatarURL())
			.setDescription("Device List")
			.addField("Device [Codename]", list, true);

		await interaction.reply({ embeds: [embed], ephemeral: true});
	},

	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Lists all devices available for lookup.')
};
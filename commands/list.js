const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

module.exports =
{
	async execute(interaction)
	{
		let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));
		let device_names = "";
		let codenames = "";

		for(let i = 0; i < json.devices.length; i++)
		{
			device_names += `${json.devices[i][2]}\n`;
			codenames += `${json.devices[i][0]}\n`;

			//Going to limit the list to 30 due to character concerns
			if(i == 30) break;
		}	

		let embed = new MessageEmbed()
			.setAuthor("EzROI", interaction.client.user.displayAvatarURL())
			.setDescription("Device List")
			.addField("Device", device_names, true)
			.addField("Codename", codenames, true)
			.addField("Full List", `Click [here](https://www.google.com/) for the full list of devices in JSON format.`)
			.setFooter("This list is manually updated and may not include every device available!");

		await interaction.reply({ embeds: [embed], ephemeral: true});
	},

	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Lists all devices available for lookup.')
};
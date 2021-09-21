const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const publicip = require('public-ip');
const { port} = require('../config.json');

module.exports =
{
	async execute(interaction)
	{
		let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));
		let device_names = "";
		let codenames = "";

		for(let i = 0; i < json.devices.length; i++)
		{
			if((i - 4) % 5 == 0)
			{
				device_names += `${json.devices[i][2]}\n\n`;
				codenames += `${json.devices[i][0]}\n\n`;
			}
			else
			{
				device_names += `${json.devices[i][2]}\n`;
				codenames += `${json.devices[i][0]}\n`;
			}
			

			//Going to limit the list to 30 due to character concerns
			if(i == 30) break;
		}

		let ipv4 = await publicip.v4();
		ipv4 += `:${port}`;
		let embed = new MessageEmbed()
			.setAuthor("EzROI", interaction.client.user.displayAvatarURL())
			.setDescription("Device List\n**PLEASE NOTE:** All GPUs listed are 6GB+ VRAM models unless otherwise stated.")
			.addField("Device", device_names, true)
			.addField("Codename", codenames, true)
			.addField("Full List", `Click [here](http://${ipv4}) for the full list of devices in JSON format.`)
			.setFooter("This list is manually updated and may not include every device available!");

		await interaction.reply({ embeds: [embed], ephemeral: true});
	},

	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Lists all devices available for lookup.')
};
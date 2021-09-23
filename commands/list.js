const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const publicip = require('public-ip');
const { port} = require('../config.json');

async function enumerate_device_names(brand)
{
	let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));
	let device_names = "";
	let count = 0;

	for(let i = 0; i < json.devices.length; i++)
	{
		if(brand != null) if(!json.devices[i][2].toLocaleLowerCase().includes(brand)) continue;

		if((count - 4) % 5 == 0)
		{
			device_names += `${json.devices[i][2]}\n\n`;
			count++;
		}
		else
		{
			device_names += `${json.devices[i][2]}\n`;
			count++;
		}
		

		//Going to limit the list to 30 due to character concerns
		if(count == 30) break;
	}

	return device_names;
}

async function enumerate_codenames(brand)
{
	let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));
	let codenames = "";
	let count = 0;

	for(let i = 0; i < json.devices.length; i++)
	{
		if(brand != null) if(!json.devices[i][2].toLocaleLowerCase().includes(brand)) continue;

		if((count - 4) % 5 == 0)
		{
			codenames += `${json.devices[i][0]}\n\n`;
			count++;
		}
		else
		{
			codenames += `${json.devices[i][0]}\n`;
			count++;
		}
		

		//Going to limit the list to 30 due to character concerns
		if(count == 30) break;
	}

	return codenames;
}

module.exports =
{
	async execute(interaction)
	{
		let brand;

		//let ipv4 = await publicip.v4();
		let ipv4 = `0.0.0.0`;
		ipv4 += `:${port}`;

		if(interaction.options.getString("brand") != null)
		{
			brand = interaction.options.getString("brand").toLocaleLowerCase();

			if(brand != "amd" && brand != "nvidia")
			{
				await interaction.reply({ content: `The brand you entered does not exist!`, ephemeral: true});
			}
		}
		else
		{
			const first_row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('amd')
					.setLabel('AMD')
					.setStyle('DANGER'),
			).addComponents(
				new MessageButton()
					.setCustomId('nvidia')
					.setLabel('NVIDIA')
					.setStyle('SUCCESS'),
			).addComponents(
				new MessageButton()
					.setURL(`http://${ipv4}`)
					.setLabel('FULL LIST')
					.setStyle('LINK'),
			);

			let embed = new MessageEmbed()
				.setAuthor("EzROI", interaction.client.user.displayAvatarURL())
				.setDescription("Device List\n**PLEASE CLICK A BRAND BELOW**")
				.addField("Full List", `Click [here](http://${ipv4}) for the full list of devices in JSON format.`)
				.setFooter("This list is manually updated and may not include every device available!");

			const filter = i => i.customId === 'amd' || 'nvidia';
			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

			collector.on('collect', async (i) =>
			{
				let device_names = await enumerate_device_names(i.customId);
				let codenames = await enumerate_codenames(i.customId);

				let embed = new MessageEmbed()
					.setAuthor("EzROI", interaction.client.user.displayAvatarURL())
					.setDescription("Device List\n**PLEASE NOTE:** All GPUs listed are 6GB+ VRAM models unless otherwise stated.")
					.addField("Device", device_names, true)
					.addField("Codename", codenames, true)
					.addField("Full List", `Click [here](http://${ipv4}) for the full list of devices in JSON format.`)
					.setFooter("This list is manually updated and may not include every device available!");
				await i.deferUpdate();
				await i.editReply({ embeds: [embed], component: [first_row], ephemeral: true});
				return;
			});

			collector.on('end', (collected) => {});

			await interaction.reply({ embeds: [embed], components: [first_row], ephemeral: true});
			return;
		}

		//Below is for non-button method

		let device_names = await enumerate_device_names(brand);
		let codenames = await enumerate_codenames(brand);

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
		.addStringOption(
			option => option.setName("brand")
			.setDescription("Sort by brand rather than full list (AMD / NVIDIA).")
			.setRequired(false)
		)
};
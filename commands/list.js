const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const publicip = require('public-ip');
const { port} = require('../config.json');
const wait = require('util').promisify(setTimeout);

async function enumerate_page_count(brand)
{
	let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));
	let count = 0;
	for(let i = 0; i < json.devices.length; i++)
	{
		if(brand != null) if(!json.devices[i][2].toLocaleLowerCase().includes(brand)) continue;
		count++;
	}

	return Math.ceil(count/30);
}

async function enumerate_device_names(brand, page)
{
	let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));
	let device_names = "";
	let count = 0;

	for(let i = 30*page; i < json.devices.length; i++)
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

async function enumerate_codenames(brand, page)
{
	let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));
	let codenames = "";
	let count = 0;

	for(let i = 30*page; i < json.devices.length; i++)
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

let ipv4 = `0.0.0.0` + `:${port}`;

const branding = new MessageActionRow()
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

		const pagination = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('left')
				.setLabel('PAGE LEFT')
				.setStyle('PRIMARY'),
		).addComponents(
			new MessageButton()
				.setCustomId('right')
				.setLabel('PAGE RIGHT')
				.setStyle('PRIMARY'),
		);

module.exports =
{
	async execute(interaction)
	{
		//let ipv4 = await publicip.v4();

		const filter = interaction => interaction.customId === 'amd' || 'nvidia';
		const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 10000 });

		collector.on('collect', async (interaction) =>
		{
			let page = 0;
			let page_count = enumerate_page_count(interaction);

			let device_names = await enumerate_device_names(interaction.customId, page);
			let codenames = await enumerate_codenames(interaction.customId, page);

			let embed = new MessageEmbed()
				.setAuthor("EzROI", interaction.client.user.displayAvatarURL())
				.setDescription("Device List\n**PLEASE NOTE:** All GPUs listed are 6GB+ VRAM models unless otherwise stated.")
				.addField("Device", device_names, true)
				.addField("Codename", codenames, true)
				.addField("Full List", `Click [here](http://${ipv4}) for the full list of devices in JSON format.`)
				.setFooter("This list is manually updated and may not include every device available!");

			await interaction.deferUpdate();
			await interaction.editReply({ embeds:[embed], components:[pagination]});
			
			return;
		});

		let embed = new MessageEmbed()
			.setAuthor("EzROI", interaction.client.user.displayAvatarURL())
			.setDescription("Device List\n**PLEASE CLICK A BRAND BELOW**")
			.addField("Full List", `Click [here](http://${ipv4}) for the full list of devices in JSON format.`)
			.setFooter("This list is manually updated and may not include every device available!");

		await interaction.reply({ embeds: [embed], components: [branding], ephemeral: true});
		return;
	},

	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Lists all devices available for lookup.')
};
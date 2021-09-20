const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

module.exports =
{
	async execute(interaction)
	{
		let embed = new MessageEmbed()
			.setAuthor("EzROI", interaction.client.user.displayAvatarURL())
			.setDescription(`About Me`)
			.addField("Primary Focus", `EzROI is a helpful math bot that attempts to provide accurate data to determine the ROI (Return of Investment) of the GPU provided in terms of mining through Nicehash. By coupling Nicehash data with Coinbase's currency API, the most accurate data at the current moment is provided for every action. While fiat currencies are the main focus, some cryptocurrencies can be provided in the data and may return good results. Due to the extreme amount of cryptocurrencies available, only the most popular cryptos will be accounted for (BTC, ETH, XLM, ADA, ect.).`, false)
			.addField("What It **CAN** Do", 
			`\u2022 Help you make a decision
			\u2022 List information about GPUs
			\u200B \u200B \u200B \u200B \u200B \u25E6 Includes wattage and hashrates`
			, true)
			.addField("What It **CAN NOT** Do", 
			`\u2022 Display graphs for crypto charts
			\u2022 Crypto or fiat conversions on demand
			\u2022 Suggest GPUs to purchase`
			, true)

		await interaction.reply({ embeds: [embed], ephemeral: true});
	},

	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Information about me.')
};

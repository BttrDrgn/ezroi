const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const { inviteUrl } = require("../config.json");

module.exports =
{
	async execute(interaction)
	{
		let package = JSON.parse(fs.readFileSync("./package.json"));
		let github = package.repository.url.slice(4, package.repository.url.length - 4);

		let embed = new MessageEmbed()
			.setAuthor("EzROI", interaction.client.user.displayAvatarURL())
			.setDescription(`Invite me to your Discord server!`)
			.addField("Bot Invite", `[Click me!](${inviteUrl})`, true)
			.addField("Github", `[Click me!](${github})`, true)

		await interaction.reply({ embeds: [embed], ephemeral: false});
	},

	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Invite me to your server!')
};
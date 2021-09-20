const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =
{
	async execute(interaction)
	{
		let codename = interaction.options.getString("codename");

		if(!fs.existsSync("./dbs/devices.json"))
		{
			await interaction.reply(`Devices database doesn't exist!`);
			return;
		}

		let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));
		let index = -1;

		for(let i = 0; i < json.devices.length; i++)
		{
			if(json.devices[i][0] == codename)
			{
				index = i;
			}
		}

		if(index != -1)
		{
			json.devices[index].splice(index, 1);
			json.devices.sort();
			fs.writeFileSync("./dbs/devices.json", JSON.stringify(json));
			await interaction.reply(`\`${codename}\` has been deleted from the list!`);
		}
		else
		{
			await interaction.reply(`\`${codename}\` is not included in the devices list!`);
		}

	},

	data: new SlashCommandBuilder()
		.setName('del')
		.setDescription('Deletes a device from the list.')
		.addStringOption(
			option => option.setName("codename")
			.setDescription("Codename to be deleted.")
			.setRequired(true)
		)
};
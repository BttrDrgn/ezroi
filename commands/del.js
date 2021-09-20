const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =
{
	async execute(interaction)
	{
		let codename = interaction.options.getString("codename");

		let op_json = JSON.parse(fs.readFileSync("./dbs/ops.json"));

		if(!op_json.ops.includes(interaction.member.user.id))
		{
			interaction.reply({content: `You do not have permission to use this command!`, ephemeral: true});
			return;
		}

		if(!fs.existsSync("./dbs/devices.json"))
		{
			interaction.reply({content: `Devices database doesn't exist!`, ephemeral: true});
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
			json.devices.splice(index, 1);
			json.devices.sort();
			fs.writeFileSync("./dbs/devices.json", JSON.stringify(json, null, 4));
			interaction.client.user.setActivity(`with ${json.devices.length} GPUs`, { type: 'PLAYING' });
			await interaction.reply(`\`${codename}\` has been deleted from the list!`);
		}
		else
		{
			interaction.reply({content: `\`${codename}\` is not included in the devices list!`, ephemeral: true});
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
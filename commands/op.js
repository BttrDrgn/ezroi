const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =
{
	async execute(interaction)
	{
		let id = interaction.options.getString("id");

		if(!fs.existsSync("./dbs/ops.json"))
		{
			let temp = 
			{
				ops: []	
			};

			fs.writeFileSync("./dbs/ops.json", JSON.stringify(temp));
			console.log("./dbs/ops.json has been written with init data");
		}

		let json = JSON.parse(fs.readFileSync("./dbs/ops.json"));

		if(!json.ops.includes(interaction.member.user.id))
		{
			interaction.reply(`You do not have permission to use this command!`);
			return;
		}

		if(json.ops.includes(id))
		{
			interaction.reply(`ID already exists in the list!`);
			return;
		}

		json.ops.push(id);

		fs.writeFileSync("./dbs/ops.json", JSON.stringify(json, null, 4));

		interaction.reply(`\`${id}\` has been added to the list!`);
		return;
	},

	data: new SlashCommandBuilder()
		.setName('op')
		.setDescription('Adds a user to the operator list.')
		.addStringOption(
			option => option.setName("id")
			.setDescription("Discord user ID to be added to the list.")
			.setRequired(true)
		)
};
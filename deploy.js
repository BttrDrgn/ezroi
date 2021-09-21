const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

let staging = process.argv.includes("--staging");
let reset = process.argv.includes("--reset");

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

if(!reset)
{
	let prod_blacklist = ["op.js"];

	for (const file of commandFiles)
	{
		if(!staging)
		{
			for(let i in prod_blacklist)
			{
				if(file == prod_blacklist[i])
				{
					continue;
				}
			}
		}

		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
	}
}

const rest = new REST({ version: '9' }).setToken(token);

(async () =>
{
	try
	{
		if(!reset)
		{
			if(staging)
			{
				await rest.put(
					Routes.applicationGuildCommands(clientId, guildId),
					{ body: commands },
				);
				
				console.log('Successfully registered staging commands.');
			}
			else
			{
				await rest.put(
					Routes.applicationCommands(clientId),
					{ body: commands },
				);
				
				console.log('Successfully registered global commands.');
			}
		}
		else
		{
			await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			);

			await rest.put(
				Routes.applicationCommands(clientId),
				{ body: commands },
			);

			console.log('Successfully reset all commands.');
		}
	}
	catch (error)
	{
		console.error(error);
	}
})();
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

let staging = process.argv.includes("--staging");

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

if(staging)
{
	for (const file of commandFiles)
	{
		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
	}
}
else
{
	for (const file of commandFiles)
	{
		if(file == "op.js")
		{
			continue;
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
	catch (error)
	{
		console.error(error);
	}
})();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles)
{
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () =>
{
	client.user.setActivity('everyone mine!', { type: 'WATCHING' });
	console.log('Ready!');
});

client.on('interactionCreate', async interaction =>
{
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName.toLocaleLowerCase());

	if (!command)
	{
		await interaction.reply(
			{
				content: 'No such command registered!',
				ephemeral: true
			}
		);

		return;
	}

	try
    {
		await command.execute(interaction);
	}
    catch (error)
    {
		console.error(error);
		await interaction.reply(
            {
                content: 'There was an error while executing this command!',
                ephemeral: true
            }
        );
	}
});

client.login(token);
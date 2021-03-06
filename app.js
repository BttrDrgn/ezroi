const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, topggtoken, port} = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const AutoPoster = require("topgg-autoposter").AutoPoster;
const topgg = AutoPoster(topggtoken, client);
const http = require('http');

topgg.on("posted", (stats) =>
{
	console.log(`Stats posted to Top.gg: ${stats.serverCount} servers`);
});

topgg.on("error", (error) =>
{
	console.error(error.message);
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles)
{
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () =>
{
	let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));
	client.user.setActivity(`with ${json.devices.length} devices`, { type: 'PLAYING' });
	console.log('Ready!');
});

client.on('interactionCreate', async interaction =>
{
	if (!interaction.isCommand() && !interaction.isButton()) return;

	if(interaction.isCommand())
	{
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
	}
});

client.login(token);

http.createServer((req, res) =>
{
	if(req.method == "GET")
	{
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.write(fs.readFileSync("./dbs/devices.json"));
 	 	res.end();
	}
}).listen(port);
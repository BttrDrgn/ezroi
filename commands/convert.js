const { SlashCommandBuilder } = require('@discordjs/builders');
const https = require('https'); 

async function do_reply(interaction, m)
{
    await interaction.reply(m);
}

module.exports =
{
	async execute(interaction)
	{
		let amount = parseFloat(interaction.options.getString("amount"));
		let from = interaction.options.getString("from").toUpperCase();
		let to = interaction.options.getString("to").toUpperCase();

		https.get(`https://api.coinbase.com/v2/exchange-rates?currency=${from}`, (res) => 
		{
			let body = "";

			res.on("data", (chunk) =>
			{
				body += chunk;
			});

			res.on("end", () =>
			{
				try
				{
					let temp = JSON.parse(body);
					let to_ = parseFloat(temp.data.rates[to])*amount;

					do_reply(interaction, `${to_} ${to}`);
				}
				catch(error)
				{
					console.error(error.message);
				}
			});
		});
	},

	data: new SlashCommandBuilder()
		.setName('convert')
		.setDescription('Convert anything to anything (ex: USD BTC)')
		.addStringOption(
			option => option.setName("amount")
			.setDescription("Amount of from currency to convert from.")
			.setRequired(true)
		)
		.addStringOption(
			option => option.setName("from")
			.setDescription("Currency to convert from.")
			.setRequired(true)
		)
		
		.addStringOption(
			option => option.setName("to")
			.setDescription("Currency to convert to.")
			.setRequired(true)
		)
};

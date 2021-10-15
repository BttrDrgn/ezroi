const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const https = require('https'); 

//temp fix
async function do_reply(interaction, embed, ephe)
{
    await interaction.reply({ embeds: [embed], ephemeral: ephe});
}

module.exports =
{
	async execute(interaction)
	{
        let codename = interaction.options.getString("codename").toLocaleLowerCase();
        let price = parseFloat(interaction.options.getString("price")).toFixed(2);
        let currency = interaction.options.getString("currency");
        let tax = (interaction.options.getInteger("tax")+100)/100;
        let private = interaction.options.getBoolean("private");

        //Checks in case something gets through the discord slash command parser
        if(isNaN(price))
        {
            await interaction.reply({ content: "The price that was entered is invalid!", ephemeral: true});
            return; 
        }

        if(isNaN(tax))
        {
            await interaction.reply({ content: "The tax percent that was entered is invalid!", ephemeral: true});
            return; 
        }

        if(tax == 100)
        {
            
        }

        if(currency == null)
        {
            currency = "USD";
        }

        let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));

        let found = false;
        let index = -1;

        for(let i = 0; i < json.devices.length; i++)
        {
            if(json.devices[i][0] == codename)
            {
                found = true;
                index = i;
                continue;
            }
        }

        if(!found)
        {
            await interaction.reply({ content: "Device not found!", ephemeral: true});
            return;
        }

        let endpoint = "https://api2.nicehash.com/main/api/v2/public/profcalc/device?device=" + json.devices[index][1];
        let btc = -1;

        https.get("https://api.coinbase.com/v2/exchange-rates?currency=BTC", (res) => 
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
                    btc = parseFloat(temp.data.rates[currency.toUpperCase()]).toFixed(2);

                    if(isNaN(btc))
                    {
                        currency = "USD";
                        btc = parseFloat(temp.data.rates[currency.toUpperCase()]).toFixed(2);
                    }

                    https.get(endpoint, (res) => 
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

                                if(temp.hasOwnProperty("errors"))
                                {
                                    interaction.reply("Device ID does not exist on Nicehash!");
                                    return;
                                }
                                else
                                {
                                    let paying = (parseFloat(temp.paying * btc).toFixed(2) * tax);
                                    let roi = parseFloat(price / paying).toFixed(1);

                                    let color = "";
                                    if(json.devices[index][2].includes("AMD"))
                                    {
                                        color = "#ED1C24";
                                    }
                                    else if(json.devices[index][2].includes("NVIDIA"))
                                    {
                                        color = "#76B900";
                                    }
                                    else
                                    {
                                        color = "#F2A900";
                                    }

                                    let embed = new MessageEmbed()
                                        .setAuthor("EzROI", interaction.client.user.displayAvatarURL())
                                        .setDescription(`ROI calculations for ${json.devices[index][2]}`)
                                        .addField("Price", `${price} ${currency.toUpperCase()}`, true)
                                        .addField("Profit Per 24h", `${paying} ${currency.toUpperCase()}`, true)
                                        .addField("Current ROI", `${roi} days`, false)
                                        .setFooter(`Calculated with BTC price as ${btc} ${currency.toUpperCase()}`)
                                        .setColor(color);
                                    
                                    if(private)
                                    {
                                        do_reply(interaction, embed, true);
                                    }
                                    else
                                    {
                                        do_reply(interaction, embed, false);
                                    }

                                    return;
                                }
                            }
                            catch (error)
                            {
                                console.error(error.message);
                            }
                        });
                    });
				}
				catch (error)
				{
					console.error(error.message);
				}
			});
		});
	},

	data: new SlashCommandBuilder()
		.setName('roi')
		.setDescription('Return of investment calculated in days.')
        .addStringOption(
			option => option.setName("codename")
			.setDescription("Codename of the device to be used in the calculations.")
			.setRequired(true)
		)
        .addStringOption(
			option => option.setName("price")
			.setDescription("The price (in USD) that was spent on the device.")
			.setRequired(true)
		)
        .addStringOption(
			option => option.setName("currency")
			.setDescription("The currency to be calculated with (default is USD).")
			.setRequired(false)
		)
        .addIntegerOption(
			option => option.setName("tax")
			.setDescription("The tax percentage to be calculated with.")
			.setRequired(false)
		)
        .addBooleanOption(
			option => option.setName("private")
			.setDescription("Whether or not this information will be private (only you can see it). Default is false.")
			.setRequired(false)
		)
};
const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const https = require('https'); 

module.exports =
{
	async execute(interaction)
	{
        let codename = interaction.options.getString("codename");
		let private = !interaction.options.getBoolean("private");

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
                        let speeds = JSON.parse(temp.speeds);
                        let speeds_ = "";

						let count = 0;
						let algos = ["daggerhashimoto", "x16r", "beam", "x16rv2", "kawpow", "octopus", "autolykos"];
                        for(let entry in speeds)
                        {
                            if(speeds[entry] >= 1.0)
                            {
								let _ = Object.keys(speeds)[count].toLocaleLowerCase();

								for(let algo in algos)
								{
									if(_ == algos[algo])
									{
										speeds_ += `${entry}: ${speeds[entry]} MH/s \n`;
									}
								}

							}
							count++;
                        }

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
                            .setDescription(`Device Info for ${json.devices[index][2]}`)
                            .addField("Hashrates", speeds_, true)
                            .addField("Power", `${temp.power}w`, true)
							.setFooter("Powered by Nicehash!")
							.setColor(color);

						if(!private)
						{
							interaction.reply({ embeds: [embed], ephemeral: true});
							return;
						}

						interaction.reply({ embeds: [embed], ephemeral: false});
					}
				}
				catch (error)
				{
					console.error(error.message);
				}
			});
		});
	},

	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("Enumerates device info from Nicehash.")
        .addStringOption(
			option => option.setName("codename")
			.setDescription("Codename of the device to be enumerated.")
			.setRequired(true)
		)
		.addBooleanOption(
			option => option.setName("private")
			.setDescription("Whether or not this information will be private (only you can see it). Default is true.")
			.setRequired(false)
		)
};
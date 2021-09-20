const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const https = require('https'); 

module.exports =
{
	async execute(interaction)
	{
        let codename = interaction.options.getString("codename");

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

                        for(let entry in speeds)
                        {
                            if(speeds[entry] >= 1.0)
                            {
                                speeds_ += `${entry}: ${speeds[entry]}\n`;
                            }
                        }

                        let embed = new MessageEmbed()
                            .setAuthor("EzROI", interaction.client.user.displayAvatarURL())
                            .setDescription(`Device Info for ${json.devices[index][2]}`)
                            .addField("Hashrates", speeds_, true)
                            .addField("Power", `${temp.power}w`, true);

                        interaction.reply({ embeds: [embed], ephemeral: true});
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
};
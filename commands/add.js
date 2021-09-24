const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const https = require('https');

module.exports =
{
	async execute(interaction)
	{
		let codename = interaction.options.getString("codename").toLocaleLowerCase();
		let deviceId = interaction.options.getString("device-id");
		let endpoint = "https://api2.nicehash.com/main/api/v2/public/profcalc/device?device=" + deviceId;

		if(!fs.existsSync("./dbs/devices.json"))
		{
			let temp = 
			{
				devices: []	
			};

			fs.writeFileSync("./dbs/devices.json", JSON.stringify(temp));
			console.log("./dbs/devices.json has been written with init data");
		}

		let op_json = JSON.parse(fs.readFileSync("./dbs/ops.json"));

		if(!op_json.ops.includes(interaction.member.user.id))
		{
			interaction.reply({content: `You do not have permission to use this command!`, ephemeral: true});
			return;
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
						interaction.reply({content: `Device ID does not exist on Nicehash!`, ephemeral: true});
						return;
					}
					else
					{
						let json = JSON.parse(fs.readFileSync("./dbs/devices.json"));
						
						for(let i = 0; i < json.devices.length; i++)
						{
							if(json.devices[i][0] == codename)
							{
								interaction.reply({content: `Device already exists in the list!`, ephemeral: true});
								return;
							}
						}

						let name = temp.name;

						let array = [codename, deviceId, name];
						json.devices.push(array);
						json.devices.sort();

						fs.writeFileSync("./dbs/devices.json", JSON.stringify(json, null, 4));
						interaction.client.user.setActivity(`with ${json.devices.length} devices`, { type: 'PLAYING' });
						interaction.reply(`Added \`[${codename}, ${deviceId}, ${name}]\` to the device list!`);
						return;
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
		.setName('add')
		.setDescription('Adds a device to the list.')
		.addStringOption(
			option => option.setName("codename")
			.setDescription("Codename to use for ROI.")
			.setRequired(true)
		)
		.addStringOption(
			option => option.setName("device-id")
			.setDescription("Device ID to be used in Nicehash lookup.")
			.setRequired(true)
		)
};
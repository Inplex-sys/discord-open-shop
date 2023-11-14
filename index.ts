import 'dotenv/config';

import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';

import MessagesHandler from './interactions/Messages';
import ButtonsHandler from './interactions/Buttons';
import ModalsHandler from './interactions/Modals';

const main = async (): Promise<void> => {
	if (!Bun.env.TOKEN) throw new Error('Token is not defined');
	if (!Bun.env.CLIENT_ID) throw new Error('Client ID is not defined');

	const client = new Client({ intents: [GatewayIntentBits.Guilds] });
	const rest = new REST({ version: '10' }).setToken(Bun.env.TOKEN);
	const commands = [
		new SlashCommandBuilder().setName('setup').setDescription("Initialize the App's channels"),
		new SlashCommandBuilder()
			.setName('add-product')
			.setDescription('Add a product by creating its dedicated channel'),
	].map((command) => command.toJSON());

	try {
		await rest.put(Routes.applicationCommands(Bun.env.CLIENT_ID), {
			body: commands,
		});

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}

	client.on('ready', () => {
		console.log(`Logged in as ${client?.user?.tag}!`);
	});

	(() => {
		MessagesHandler(client), ButtonsHandler(client), ModalsHandler(client);
	})();

	client.login(Bun.env.TOKEN);
};

(async () => main())();

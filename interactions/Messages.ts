import {
	Events,
	ChannelType,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	CacheType,
	Client,
	Interaction,
	GuildMember,
} from 'discord.js';

/**
 * @description Handles message interactions
 * @param client The Discord client instance
 */

const MessagesHandler: Function = (client: Client): void => {
	client.on(Events.InteractionCreate, async (interaction: Interaction<CacheType>) => {
		if (!interaction.isChatInputCommand()) return;

		if (interaction.isChatInputCommand()) {
			switch (interaction.commandName) {
				case 'setup':
					if (!interaction.member || !(interaction.member as GuildMember).permissions.has('Administrator'))
						return;

					var guild = interaction.guild;
					if (!guild) return;

					const channels = await guild.channels.fetch();
					channels.forEach(async (channel) => {
						await channel?.delete();
					});

					const setupChannel = await guild.channels.create({
						name: 'commands',
						type: ChannelType.GuildText,
						permissionOverwrites: [
							{
								id: guild.roles.everyone.id,
								deny: ['ViewChannel'],
							},
						],
					});

					await guild.channels.create({
						name: 'sales',
						type: ChannelType.GuildText,
						permissionOverwrites: [
							{
								id: guild.roles.everyone.id,
								deny: ['SendMessages'],
							},
						],
					});

					await setupChannel.send({
						embeds: [
							{
								title: 'Welcome to the application setup',
								description:
									'Here are the available commands: \n\n' +
									'- `/add-product`: Adds a product by creating a dedicated channel, you will then need to configure it \n' +
									'- `/setup`: Initializes the application \n',
							},
						],
					});

					await interaction.reply({
						content: 'The application has been successfully configured!',
						ephemeral: true,
					});
					break;

				case 'add-product':
					if (!interaction.member || !(interaction.member as GuildMember).permissions.has('Administrator'))
						return;

					var guild = interaction.guild;
					if (!guild) return;

					const modal = new ModalBuilder().setCustomId('add-product-modal').setTitle('Add a product');

					const productNameInput = new TextInputBuilder()
						.setCustomId('product-name')
						.setLabel('🔗 Enter the product name')
						.setRequired(true)
						.setStyle(TextInputStyle.Short);

					const productDescriptionInput = new TextInputBuilder()
						.setCustomId('product-description')
						.setLabel('📄 Enter the product description')
						.setMaxLength(1000)
						.setMinLength(10)
						.setRequired(true)
						.setStyle(TextInputStyle.Paragraph);

					const productPriceInput = new TextInputBuilder()
						.setCustomId('product-price')
						.setLabel('🪙 Enter the product price')
						.setRequired(true)
						.setStyle(TextInputStyle.Short);

					const firstActionRow = new ActionRowBuilder().addComponents(productNameInput),
						secondActionRow = new ActionRowBuilder().addComponents(productDescriptionInput),
						thirdActionRow = new ActionRowBuilder().addComponents(productPriceInput);

					modal.addComponents(firstActionRow, secondActionRow, thirdActionRow as any);

					await interaction.showModal(modal);
					break;
			}
		}
	});
};

export default MessagesHandler;

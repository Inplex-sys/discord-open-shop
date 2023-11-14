import {
	ActionRowBuilder,
	Client,
	Events,
	GuildMember,
	ModalBuilder,
	TextChannel,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

/**
 * @description Handles the buttons interactions
 * @param client The discord client instance
 */

const ButtonsHandler: Function = (client: Client): void => {
	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isButton()) return;
		const customId = interaction.customId.split('.')[0];
		const shard = interaction.customId.split('.')[1];

		switch (customId) {
			case 'buy-button':
				const modal = new ModalBuilder().setCustomId('buy-product-modal.' + shard).setTitle('Buy product');

				const emailInput = new TextInputBuilder()
					.setCustomId('customer-email')
					.setLabel('📧 Enter your email')
					.setPlaceholder('example@mail.com')
					.setRequired(true)
					.setStyle(TextInputStyle.Short);

				const paymentMethodInput = new TextInputBuilder()
					.setCustomId('customer-payment-method')
					.setLabel('💰 Enter your payment method')
					.setPlaceholder('PayPal, BTC, LTC ...')
					.setRequired(true)
					.setStyle(TextInputStyle.Short);

				const firstActionRow = new ActionRowBuilder().addComponents(emailInput),
					secondActionRow = new ActionRowBuilder().addComponents(paymentMethodInput);

				modal.addComponents(firstActionRow, secondActionRow as any);

				await interaction.showModal(modal);
				break;

			case 'complete-order':
				if (!interaction.member || !(interaction.member as GuildMember).permissions.has('Administrator'))
					return;

				var channelID = interaction.customId.split('.')[1].split('|')[0];

				var product = interaction.guild?.channels.cache.get(channelID) as TextChannel | undefined;

				if (!product) return;

				await interaction.reply({
					content: 'The order has been completed',
					ephemeral: true,
				});

				var salesChannel = interaction.guild?.channels.cache.find((channel) => channel.name === 'sales') as
					| TextChannel
					| undefined;
				if (!salesChannel) return;

				const customer = interaction.guild?.members.cache.get(
					interaction.customId.split('.')[1].split('|')[1]
				) as GuildMember | undefined;

				await salesChannel?.send({
					embeds: [
						{
							description:
								'<@!' +
								interaction.customId.split('.')[1].split('|')[1] +
								'> just bought ***' +
								product?.name +
								'***',
							thumbnail: {
								url:
									customer?.displayAvatarURL() ||
									'https://discord.com/assets/7c8f476123d28d103efe381543274c25.png',
							},
						},
					],
				});

				interaction.channel?.delete();
				break;

			case 'cancel-order':
				interaction.channel?.delete();
				break;
		}
	});
};

export default ButtonsHandler;

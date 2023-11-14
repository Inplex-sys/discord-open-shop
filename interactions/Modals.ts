import {
	Client,
	Events,
	Interaction,
	CacheType,
	ChannelType,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	TextChannel,
	GuildMember,
} from 'discord.js';

import Utils from '../class/Utils';

/**
 * @description Handles modal interactions
 * @param client The Discord client instance
 */

const ModalsHandler: Function = (client: Client): void => {
	client.on(Events.InteractionCreate, async (interaction: Interaction<CacheType>) => {
		if (!interaction.isModalSubmit()) return;
		const customId = interaction.customId.split('.');
		const shard = interaction.customId.split('.')[1];

		switch (customId[0]) {
			case 'add-product-modal':
				if (!interaction.member || !(interaction.member as GuildMember).permissions.has('Administrator'))
					return;

				const name = interaction.fields.getTextInputValue('product-name');
				const description = interaction.fields.getTextInputValue('product-description');
				const price = interaction.fields.getTextInputValue('product-price');

				if (!name || !description || !price) return;

				var channel = await interaction.guild?.channels.create({
					name: name,
					type: ChannelType.GuildText,
				});

				const buyButton = new ButtonBuilder()
					.setCustomId('buy-button.' + channel?.id)
					.setLabel('Buy')
					.setStyle(ButtonStyle.Success)
					.setEmoji('🪙');

				channel?.send({
					embeds: [
						{
							title: name,
							description: '📄 Description : \n' + description + '\n\n' + '🪙 Price : $ ' + price,
						},
					],
					components: [
						{
							type: ComponentType.ActionRow,
							components: [buyButton],
						},
					],
				});

				await interaction.reply({
					content: 'The product has been successfully added!',
					ephemeral: true,
				});
				break;

			case 'buy-product-modal':
				const email = interaction.fields.getTextInputValue('customer-email');
				const paymentMethod = interaction.fields.getTextInputValue('customer-payment-method');
				var channel = interaction.guild?.channels.cache.get(shard) as TextChannel | undefined;

				if (!email || !paymentMethod || !channel) return;

				const acceptButton = new ButtonBuilder()
					.setCustomId('complete-order.' + channel?.id + '|' + interaction.user.id + '|' + channel.id)
					.setLabel('Complete')
					.setStyle(ButtonStyle.Success);

				const cancelButton = new ButtonBuilder()
					.setCustomId('cancel-order.' + channel?.id + '|' + interaction.user.id + '|' + channel.id)
					.setLabel('Cancel')
					.setStyle(ButtonStyle.Danger);

				const orderChannel = await interaction.guild?.channels.create({
					name: 'order-' + Utils.genOrderId(),
					type: ChannelType.GuildText,
					permissionOverwrites: [
						{
							id: interaction.guild.roles.everyone.id,
							deny: ['ViewChannel'],
						},
						{
							id: interaction.user.id,
							allow: ['ViewChannel'],
						},
					],
				});

				await orderChannel?.send({
					embeds: [
						{
							title: 'New Order',
							description:
								'Your order has been placed. Please wait for the support team to contact you.\n\n' +
								'**Product:** `' +
								channel.name +
								'`\n' +
								'**Email:** `' +
								email +
								'`\n' +
								'**Payment Method:** `' +
								paymentMethod +
								'`\n',
						},
					],
					components: [
						{
							type: ComponentType.ActionRow,
							components: [acceptButton, cancelButton],
						},
					],
				});

				(await orderChannel?.send('@everyone'))?.delete();

				await interaction.reply({
					content: 'Your order has been successfully submitted!',
					ephemeral: true,
				});
				break;
		}
	});
};

export default ModalsHandler;

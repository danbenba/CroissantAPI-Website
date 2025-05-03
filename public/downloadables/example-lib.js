const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { getInventory } = require('./api/croissant-api');

const itemId = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Displays if premium commands are available'),
    async execute(interaction) {
        const { inventory } = await getInventory({ userId: interaction.user.id });
        const hasItem = inventory.find(item => item.id === itemId);
        if (hasItem) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Premium Commands')
                .setDescription('You have access to premium commands!')
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Premium Access Required')
                .setDescription('To access premium commands, you must own a **Weathley Crab**!\n\nYou can obtain one via the `/shop` command of the Croissant bot.')
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
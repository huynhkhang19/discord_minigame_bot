const Discord = require('discord.js')
const {isAdministrator} = require("../../utils/Utils");

module.exports = {
    name: Discord.Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            if (command.admin && !isAdministrator(interaction.user)) {
                return await interaction.reply({content: 'You don\'t have permission to use this command!', ephemeral: true});
            }
            await command.execute(interaction);
        } catch (error) {
            await interaction.reply({content: `Lỗi rùi`, ephemeral: true});
            console.log(error)
        }
    }
}
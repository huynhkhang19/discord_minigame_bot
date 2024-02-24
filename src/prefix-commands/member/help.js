const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'help',
    description: '[ MEMBER ] các lệnh của bot',
    execute(bot, message, args) {
        const { commands, prefixCommands } = bot;
        const commandList = [...commands.values(), ...prefixCommands.values()];

        if (commandList.length === 0) {
            message.channel.send('No commands available.');
            return;
        }
        
        const helpEmbed = {
            color: 0x0099ff,
            title: 'Command List',
            description: 'Tổng Hợp Các Lệnh Của Bot:',
            fields: commandList.map(command => ({
                name: `Lệnh: \`${process.env.PREFIX}${command.data ? command.data.name : command.name || 'Unknown'}\``,
                value: command.data ? command.data.description || 'No description provided.' : command.description || 'No description provided.',
            })),
        };

        message.channel.send({ embeds: [helpEmbed] });
    },
};

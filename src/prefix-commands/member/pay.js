const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money } = require("../../utils/Utils");

module.exports = {
    name: "pay",
    description: '[ MEMBER ] chuyển tiền',
    run: async (client, message, args) => {
        const sender = message.author;
        const recipient = message.mentions.users.first();
        const amount = parseInt(args[1]); // Change from args[2] to args[1]

        if (!recipient || isNaN(amount)) {
            return message.reply('Invalid syntax. Use `!pay @recipient amount`.');
        }

        try {
            const sqliteProvider = new SQLiteProvider();
            sqliteProvider.init();

            const senderMoney = await sqliteProvider.getMoney(sender.id);

            if (senderMoney < amount) {
                return message.reply('Số dư không đủ để chuyển tiền.');
            }

            await sqliteProvider.reduceMoney(sender.id, amount);
            await sqliteProvider.addMoney(recipient.id, amount);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Chuyển Tiền Thành Công')
                .setDescription(`Bạn đã chuyển ${parse_money(amount)} cho <@${recipient.id}>.`)
                .addFields({ name: 'Số Dư Hiện Tại', value: `${parse_money(senderMoney - amount)}`,  inline: true })
                .setTimestamp()
                .setFooter({ text: 'hakustudio.dev', iconURL: 'https://cdn.discordapp.com/attachments/1159570842955567114/1184577041069256715/qx5K5Cr_1.gif' });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error transferring money:', error);
            message.reply('An error occurred while transferring money.');
        }
    }
};

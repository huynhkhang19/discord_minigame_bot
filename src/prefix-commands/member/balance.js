const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money, isAdministrator } = require("../../utils/Utils");

module.exports = {
    name: "cash",
    description: '[ MEMBER ] xem số dư của bạn',
    execute: async (client, message, args) => {
        if (args.length > 0) {
            if (!isAdministrator(message.member)) {
                return message.reply("Bạn không có quyền sử dụng lệnh này.");
            }
            const user = message.mentions.users.first() || message.author;
            try {
                const sqliteProvider = new SQLiteProvider();
                sqliteProvider.init();
                const currentMoney = await sqliteProvider.getMoney(user.id);
                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('Số Dư Tài Khoản')
                    .setDescription(`Số dư tài khoản của ${user === message.author ? 'bạn' : `<@${user.id}>`} là: ${parse_money(currentMoney)}.`)
                    .setTimestamp()
                    .setFooter({ text: 'hakustudio.dev', iconURL: 'https://cdn.discordapp.com/attachments/1159570842955567114/1184577041069256715/qx5K5Cr_1.gif' });
                message.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error getting balance:', error);
                message.reply('An error occurred while retrieving the balance.');
            }
        } else {

            try {
                const sqliteProvider = new SQLiteProvider();
                sqliteProvider.init();
                const currentMoney = await sqliteProvider.getMoney(message.author.id);
                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('Số Dư Tài Khoản')
                    .setDescription(`Số dư tài khoản của bạn là: ${parse_money(currentMoney)}.`)
                    .setTimestamp()
                    .setFooter({ text: 'hakustudio.dev', iconURL: 'https://cdn.discordapp.com/attachments/1159570842955567114/1184577041069256715/qx5K5Cr_1.gif' });
                message.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error getting balance:', error);
                message.reply('An error occurred while retrieving the balance.');
            }
        }
    }
};

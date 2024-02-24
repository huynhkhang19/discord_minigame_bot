const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money, isAdministrator } = require("../../utils/Utils");

module.exports = {
    name: "trutien",
    description: '[ ADMIN ] trừ tiền ',
    run: async (client, message, args) => {
        if (!isAdministrator(message.member)) {
            return message.reply("Bạn không có quyền sử dụng lệnh này.");
        }

        const user = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!user || isNaN(amount)) {
            return message.reply('Invalid syntax. Use `!trutien @user amount`.');
        }

        try {
            const sqliteProvider = new SQLiteProvider();
            sqliteProvider.init();

            const currentMoney = await sqliteProvider.getMoney(user.id);
            if (currentMoney < amount) {
                return message.reply(`Người dùng ${user.tag} không có đủ tiền để trừ.`);
            }

            await sqliteProvider.reduceMoney(user.id, amount);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Trừ Tiền')
                .setDescription(`${parse_money(amount)} đã được trừ khỏi tài khoản của <@${user.id}>.`)
                .addFields({ name: 'Số Dư Hiện Tại:', value: `${parse_money(currentMoney - amount)}`, inline: true })
                .setTimestamp()
                .setFooter({ text: 'hakustudio.dev', iconURL: 'https://cdn.discordapp.com/attachments/1159570842955567114/1184577041069256715/qx5K5Cr_1.gif' });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error subtracting money:', error);
            message.reply('An error occurred while subtracting money.');
        }
    }
};

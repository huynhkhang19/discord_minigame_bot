const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money, isAdministrator } = require("../../utils/Utils");

module.exports = {
    name: "chinhtien",
    description: '[ ADMIN ] chỉnh tiền ',
    run: async (client, message, args) => {
        if (!isAdministrator(message.member)) {
            return message.reply("Bạn không có quyền sử dụng lệnh này.");
        }

        const user = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!user || isNaN(amount)) {
            return message.reply('Invalid syntax. Use `!chinhtien @user amount`.');
        }

        try {
            const sqliteProvider = new SQLiteProvider();
            sqliteProvider.init();

            await sqliteProvider.setMoney(user.id, amount);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Số Dư Tài Khoản Đã Được Chỉnh Sửa')
                .setDescription(`Số dư tài khoản của <@${user.id}> đã được chỉnh sửa thành: ${parse_money(amount)}.`)
                .setTimestamp()
                .setFooter({ text: 'hakustudio.dev', iconURL: 'https://cdn.discordapp.com/attachments/1159570842955567114/1184577041069256715/qx5K5Cr_1.gif' });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error setting money:', error);
            message.reply('An error occurred while setting the money.');
        }
    }
};

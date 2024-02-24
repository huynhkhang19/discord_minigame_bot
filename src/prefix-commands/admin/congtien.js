const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider'); 
const { parse_money , isAdministrator} = require("../../utils/Utils");
module.exports = {
    name: "congtien",
    description: '[ ADMIN ] cộng tiền ',
    async execute(bot, message, args) {
        if (!isAdministrator(message.member)) {
            return message.reply("Bạn không có quyền sử dụng lệnh này.");
        }

        const user = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!user || isNaN(amount)) {
            return message.reply('Invalid syntax. Use `!congtien @user amount`.');
        }

        try {
            const sqliteProvider = new SQLiteProvider();
            sqliteProvider.init(); 

            const currentMoney = await sqliteProvider.getMoney(user.id);
            await sqliteProvider.addMoney(user.id, amount);

            const embed = new EmbedBuilder()
                .setColor('#00FF00') 
                .setTitle('Thêm Tiền')
                .setDescription(`${parse_money(amount)} được thêm vào <@${user.id}>.`)
                .addFields({ name: 'Số Dư Hiên Tại:', value: `${parse_money(currentMoney + amount)}`, inline: true })
                .setTimestamp()
                .setFooter({ text: 'hakustudio.dev', iconURL: 'https://cdn.discordapp.com/attachments/1159570842955567114/1184577041069256715/qx5K5Cr_1.gif' })

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error adding money:', error);
            message.reply('An error occurred while adding money.');
        }
    }
};

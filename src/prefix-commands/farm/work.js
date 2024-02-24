const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money, isAdministrator } = require("../../utils/Utils");

const jobs = [
    "Bạn vừa đi giặt đồ thuê.",
    "Bạn vừa đi làm bảo vệ thành công.",
    "Bạn vừa đi học đạt thành tích cao.",
    "Bạn vừa đi chăm sóc người già.",
    "Bạn vừa đi trồng cây thành công.",
    "Bạn vừa đi xây nhà cho người nghèo.",
    "Bạn vừa đi thi đỗ vào trường đại học.",
    "Bạn vừa đi tình nguyện giúp đỡ cộng đồng.",
    "Bạn vừa đi viết sách xuất sắc."
];

const cooldowns = new Map();
const sentMessages = new Map();

module.exports = {
    name: "work",
    description: '[ FARRM ] làm việc kiếm tiền ',
    run: async (client, message, args) => {
        if (cooldowns.has(message.author.id)) {
            const expirationTime = cooldowns.get(message.author.id) + 150000;
            if (Date.now() < expirationTime) {
                const timeLeft = Math.ceil((expirationTime - Date.now()) / 1000);
                const customTimestamp = `<t:${Math.floor(Date.now() / 1000 + timeLeft)}:R>`;
                const replyMessage = await message.reply(`Bạn vừa đi làm, hãy nghỉ ngơi ${customTimestamp} trước khi đi làm lại.`);
                sentMessages.set(message.author.id, replyMessage);

                // Schedule message deletion
                setTimeout(() => {
                    const sentMessage = sentMessages.get(message.author.id);
                    if (sentMessage) {
                        sentMessage.delete().catch(console.error);
                        sentMessages.delete(message.author.id);
                    }
                }, timeLeft * 1000);

                return;
            }
        }

        try {
            const sqliteProvider = new SQLiteProvider();
            sqliteProvider.init();

            const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
            const randomMoney = Math.floor(Math.random() * (10000 - 500 + 1)) + 500;

            await sqliteProvider.addMoney(message.author.id, randomMoney);

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('Làm Việc')
                .setDescription(`<a:13:1201267446955384922> ${randomJob} Bạn nhận được ${parse_money(randomMoney)}.`)
                .setTimestamp()
                .setFooter({ text: 'HAKUSTUDIO.DEV', iconURL: 'https://cdn.discordapp.com/attachments/1159570842955567114/1184577041069256715/qx5K5Cr_1.gif' });

            const replyMessage = await message.reply({ embeds: [embed] });
            sentMessages.set(message.author.id, replyMessage);

            cooldowns.set(message.author.id, Date.now());
            // Đặt cooldown 150 giây
            setTimeout(() => {
                const sentMessage = sentMessages.get(message.author.id);
                if (sentMessage) {
                    sentMessage.delete().catch(console.error);
                    sentMessages.delete(message.author.id);
                }
                cooldowns.delete(message.author.id);
            }, 150000);
        } catch (error) {
            console.error('Error while working:', error);
            message.reply('An error occurred while working.');
        }
    }
};

const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money } = require("../../utils/Utils");

const cooldownsSlut = new Map();

module.exports = {
    name: "slut",
    description: '[ FARRM ] làm việc kiếm tiền ',
    run: async (client, message, args) => {
        try {
            const sqliteProvider = new SQLiteProvider();
            sqliteProvider.init();

            // Kiểm tra cooldown
            if (cooldownsSlut.has(message.author.id)) {
                const lastTime = cooldownsSlut.get(message.author.id);
                const currentTime = Date.now();
                const cooldownAmount = 250 * 1000; // 250 giây cooldown

                if (currentTime - lastTime < cooldownAmount) {
                    const remainingTime = (cooldownAmount - (currentTime - lastTime)) / 1000;
                    return message.reply(`Làm slut mệt lắm, nghỉ ${remainingTime.toFixed(1)} đi bạn.`);
                }
            }

            // Đặt cooldown
            cooldownsSlut.set(message.author.id, Date.now());

            const isGoodOutcome = Math.random() < 0.7;
            let outcome, moneyChange, moneyText;

            if (isGoodOutcome) {
                outcome = goodOutcomes[Math.floor(Math.random() * goodOutcomes.length)];
                moneyChange = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;
                moneyText = `Số tiền bạn nhận được: ${parse_money(moneyChange)}`;
            } else {
                outcome = badOutcomes[Math.floor(Math.random() * badOutcomes.length)];
                moneyChange = -Math.floor(Math.random() * (10000 - 7000 + 1)) - 7000;
                moneyText = `Số tiền bạn bị mất: ${parse_money(Math.abs(moneyChange))}`;
            }

            const currentMoney = await sqliteProvider.getMoney(message.author.id);
            const newMoney = currentMoney + moneyChange;

            await sqliteProvider.setMoney(message.author.id, newMoney);

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('Kết Quả Làm Việc')
                .setDescription(`<a:moneywithwings:1160529994401972244> ${outcome}\n${moneyText}\nSố dư tài khoản mới của bạn là: ${parse_money(newMoney)}.`)
                .setTimestamp()
                .setFooter({ text: 'FouQ Community', iconURL: 'https://images-ext-1.discordapp.net/external/h99SAgG4BRuZaHBDk-DKcW5N-GqUf5yWPjDoZgYENHk/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1158483945818689626/f05045c46eed4f8641be6cdd499b7e9a.png?format=webp&quality=lossless&width=676&height=676' });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error during "slut" command:', error);
            message.reply('An error occurred while processing the command.');
        }
    }
};

const goodOutcomes = [
    "Được tip tiền vì làm khách hài lòng.",
    "Sau một thời gian đứng đường, bạn đã nhận được tiền.",
    "Được trai ciu to chơi xong, bị phê và nhận tiền.",
    "Nhận được tiền vì làm khách hài lòng.",
    "Sau một thời gian đứng đường, bạn đã được tiền tip.",
    "Được trai ciu to chơi xong, cảm thấy phê và nhận tiền thưởng.",
    "Tiền tip được trao vì làm khách hài lòng.",
    "Sau một thời gian đứng đường, bạn nhận được tiền thưởng.",
    "Được trai ciu to chơi xong, bị phê và được trao tiền.",
    "Nhận được tiền tip sau khi làm khách hài lòng."
];

const badOutcomes = [
    "Bạn vô tình làm gãy cu khách và phải đền tiền.",
    "Gặp thằng quỵt tiền khi đi khách.",
    "Bị khách hàng chơi bể zú, phải tự trả tiền bơm zú.",
    "Vô tình làm gãy cu khách và phải bồi thường.",
    "Khách hàng không trả tiền khi đi khách.",
    "Gặp ngay thằng quỵt tiền trong lúc đi khách.",
    "Bị khách hàng chơi bể zú, tự trả tiền sửa.",
    "Khách hàng phá hỏng bể zú, đòi tiền bồi thường.",
    "Bể zú bị hỏng do khách hàng, phải tự túc trả tiền.",
    "Gãy cu khách và phải tự túc đền bù."
];

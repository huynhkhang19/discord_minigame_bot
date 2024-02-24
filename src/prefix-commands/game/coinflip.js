const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money, isAdministrator } = require("../../utils/Utils");

module.exports = {
    name: "cf",
    description: '[ GAME ] tung đồng xu ',
    run: async (client, message, args) => {
        const user = message.author;
        const betAmount = parseInt(args[0]);
        const choice = args[1];
        const username = user ? (user.tag || user.username || "Unknown User") : "Unknown User";
        const sqliteProvider = new SQLiteProvider();
        sqliteProvider.init();
        const userMoney = await sqliteProvider.getMoney(user.id);
        if (betAmount > userMoney) {
            return message.channel.send("Bạn không có đủ tiền để đặt cược.");
        }
        if (isNaN(betAmount) || betAmount <= 0) {
            return message.channel.send("Số tiền đặt cược không hợp lệ. Vui lòng cung cấp số dương hợp lệ.");
        }
        if (isNaN(betAmount) || betAmount >= 250001) {
            return message.channel.send("Bạn chỉ có thể mược max là 250k");
        }
        if (!["up", "mo"].includes(choice)) {
            return message.channel.send("Lựa chọn không hợp lệ. Vui lòng chọn 'up' hoặc 'mo'.");
        }

        const emojis = {
            up: '<:5bcfTails:1201280449553649836>',
            mo: '<:5bcfHeads:1201280442402361405>'
        };

        const chose = choice === "up" ? "ÚP" : "MỞ";

        const msgResult = await message.channel.send(`**${username}** đã cược **${parse_money(betAmount)}** và đã chọn **${chose}** \n## => <a:coinflip_main:1201272754087932055> <=`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        let selectedObject1 = emojis[["up", "mo"][Math.floor(Math.random() * 2)]];
        let result1 = selectedObject1;
        const resultt = ["up", "mo"][Math.floor(Math.random() * 2)];  
        await msgResult.edit(`**${username}** đã cược **${parse_money(betAmount)}** và đã chọn **${chose}** \n## => ${result1} <=\n**__Kết quả__:** ${resultt === 'up' ? 'ÚP' : 'MỞ'}`);
        
        if (choice === resultt) {
            await sqliteProvider.addMoney(user.id, betAmount);
            msgResult.edit(`**${username}** đã cược **${parse_money(betAmount)}** và đã chọn **${chose}** \n## => ${result1} <=\n**__Kết quả__:** ${resultt === 'up' ? 'ÚP' : 'MỞ'}\n**__Chúc mừng ${username}!__** Bạn đã giành được ${parse_money(betAmount)}.`);
        } else {
            await sqliteProvider.reduceMoney(user.id, betAmount);
            msgResult.edit(`**${username}** đã cược **${parse_money(betAmount)}** và đã chọn **${chose}** \n## => ${result1} <=\n**__Kết quả__:** ${resultt === 'up' ? 'ÚP' : 'MỞ'}\n**__Ối!__** Bạn đã thua ${parse_money(betAmount)}.`);
        }
    }
};

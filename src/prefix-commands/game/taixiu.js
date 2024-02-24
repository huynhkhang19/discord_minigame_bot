const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money, isAdministrator } = require("../../utils/Utils");

module.exports = {
    name: "tx",
    description: '[ GAME ] tài xỉu',
    run: async (client, message, args) => {
        const user = message.author;
        const betAmount = parseInt(args[0]);
        const choice = args[1];
        const guildID = message.guild.id;

        const sqliteProvider = new SQLiteProvider();
        sqliteProvider.init();

        if (isNaN(betAmount) || betAmount <= 0) {
            return message.channel.send("Số tiền đặt cược không hợp lệ. Vui lòng cung cấp số dương hợp lệ.");
        }

        if (!["tai", "xiu"].includes(choice)) {
            return message.channel.send("Lựa chọn không hợp lệ. Vui lòng chọn 'tai' hoặc 'xiu'.");
        }

        const userMoney = await sqliteProvider.getMoney(user.id);
        if (betAmount > userMoney) {
            return message.channel.send("Bạn không có đủ tiền để đặt cược.");
        }

        const objects_staixiu = [
            '<:dice_167:1162095359460376657>',
            '<:dice245:1162095372651466893>',
            '<:dice_390:1162095361683370037>',
            '<:dice_477:1162095364883624038>',
            '<:dice_518:1162095368050327572>',
            '<:dice_699:1162095369782571159>'
        ];

        const msgResult = await message.channel.send('<a:dado63:1162095356297871520> <a:dado63:1162095356297871520> <a:dado63:1162095356297871520>');
        await new Promise(resolve => setTimeout(resolve, 3000));

        let selectedObject1 = objects_staixiu[Math.floor(Math.random() * objects_staixiu.length)];
        let selectedObject2 = objects_staixiu[Math.floor(Math.random() * objects_staixiu.length)];
        let selectedObject3 = objects_staixiu[Math.floor(Math.random() * objects_staixiu.length)];

        let result1 = selectedObject1;
        let result2 = selectedObject2;
        let result3 = selectedObject3;
        let sum = objects_staixiu.indexOf(selectedObject1) + objects_staixiu.indexOf(selectedObject2) + objects_staixiu.indexOf(selectedObject3) + 3;

        await msgResult.edit(`${result1} <a:dado63:1162095356297871520> <a:dado63:1162095356297871520>`);
        await new Promise(resolve => setTimeout(resolve, 2000));

        await msgResult.edit(`${result1} <a:dado63:1162095356297871520> ${result3}`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        await msgResult.edit(`${result1} ${result2} ${result3}`);

        let resultt = (sum > 10) ? 'tai' : 'xiu';

        await message.channel.send(`**__Kết quả__:** **${sum}** - **${resultt === 'tai' ? 'Tài' : 'Xỉu'}**`);
        if (choice === resultt) {
            await sqliteProvider.addMoney(user.id, betAmount);
            message.channel.send(`**__Chúc mừng!__** **Bạn đã giành được ${parse_money(betAmount)}**.`);
        } else {
            await sqliteProvider.reduceMoney(user.id, betAmount);
            message.channel.send(`**__Ối!__** **Bạn đã thua ${parse_money(betAmount)}**`);
        }
    }
}

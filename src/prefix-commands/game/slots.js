const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money, isAdministrator } = require("../../utils/Utils");

module.exports = {
    name: "s",
    description: '[ GAME ] quay spin',
    run: async (client, message, args) => {
        const user = message.author;
        const betAmount = parseInt(args[0]) || 1;

        const username = user ? (user.tag || user.username || "Unknown User") : "Unknown User";
        const sqliteProvider = new SQLiteProvider();
        sqliteProvider.init();

        if (isNaN(betAmount) || betAmount <= 0) {
            return message.channel.send("Số tiền đặt cược không hợp lệ. Vui lòng cung cấp số dương hợp lệ.");
        }

        const userMoney = await sqliteProvider.getMoney(user.id);
        if (betAmount > userMoney) {
            return message.channel.send("Bạn không có đủ tiền để đặt cược.");
        }

        const emojis = [
            '<:dp_slots_hearts33:1201252639246123052>',
            '<:DP_slots_cherry:1201252631239196692>',
            '<:DP_slots_eggplant93:1201252635345432616>',
            '<:haku:1201252928858628176>'
        ];

        const msgResult = await message.channel.send('**  `___SLOTS___`**\n` ` <a:DP_slots_spin28:1201252641943076995> <a:DP_slots_spin28:1201252641943076995> <a:DP_slots_spin28:1201252641943076995> ` `\n  `|         |`   \n  `|         |`   ');
        await new Promise(resolve => setTimeout(resolve, 3000));

        let selectedObject1 = emojis[Math.floor(Math.random() * emojis.length)];
        let selectedObject2 = emojis[Math.floor(Math.random() * emojis.length)];
        let selectedObject3 = emojis[Math.floor(Math.random() * emojis.length)];

        let result1 = selectedObject1;
        let result2 = selectedObject2;
        let result3 = selectedObject3;

        await msgResult.edit(`**  \`___SLOTS___\`**\n\` \` ${result1} <a:DP_slots_spin28:1201252641943076995> <a:DP_slots_spin28:1201252641943076995> \` \`\n  \`|         |\`   \n  \`|         |\`   `);
        await new Promise(resolve => setTimeout(resolve, 2000));

        await msgResult.edit(`**  \`___SLOTS___\`**\n\` \` ${result1} <a:DP_slots_spin28:1201252641943076995> ${result3} \` \`\n  \`|         |\`   \n  \`|         |\`   `);
        await new Promise(resolve => setTimeout(resolve, 3000));

        await msgResult.edit(`**  \`___SLOTS___\`**\n\` \` ${result1} ${result2} ${result3} \` \`\n  \`|         |\`   \n  \`|         |\`   `);

        const isWinning = result1 === result2 && result2 === result3;

        let winningsMultiplier = 1;

        if (isWinning) {
            switch (result1) {
                case emojis[1]:
                    winningsMultiplier = 3; // cherry 
                    break;
                case emojis[0]:
                    winningsMultiplier = 2; // tym 
                    break;
                case emojis[2]:
                    winningsMultiplier = 4; // cà tím
                    break;
                case emojis[3]:
                    winningsMultiplier = 15; // haku
                    break;
            }
        }

        const winnings = isWinning ? betAmount * winningsMultiplier : 0;

        try {
            if (winnings > 0) {
                await sqliteProvider.addMoney(user.id, winnings);
                msgResult.edit(`**  \`___SLOTS___\`**\n\` \` ${result1} ${result2} ${result3} \` \`\n  \`|         |\`   \n  \`|         |\`   \n\`${username} đã chiến thắng ${parse_money(winnings)}!\``);
            } else {
                await sqliteProvider.reduceMoney(user.id, betAmount);
                msgResult.edit(`**  \`___SLOTS___\`**\n\` \` ${result1} ${result2} ${result3} \` \`\n  \`|         |\`   \n  \`|         |\`   \n\`${username} đã thua ${parse_money(betAmount)}.\nChúc may mắn lần sau!\``);
            }
        } catch (error) {
            console.error(error);
            message.channel.send("An error occurred while processing your winnings/losses.");
        }
    }
};

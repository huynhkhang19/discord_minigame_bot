const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money } = require("../../utils/Utils");

module.exports = {
    name: "mine",
    description: '[ FARRM ] đào đá kiếm tiền ',
    run: async (client, message, args) => {
        const sqliteProvider = new SQLiteProvider();
        sqliteProvider.init();

        if (gameData[message.author.id]) {
            return message.reply("Bạn đang trong quá trình đào mỏ. Vui lòng đợi hoàn thành trước khi thực hiện lại.");
        }

        gameData[message.author.id] = true;

        try {
            let playerBalance = await sqliteProvider.getMoney(message.author.id);
            const cost = 33000;

            if (playerBalance < cost) {
                return message.reply("Bạn không đủ tiền để tham gia đào mỏ.");
            }

            playerBalance -= cost;
            await sqliteProvider.setMoney(message.author.id, playerBalance);

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('Game Đào Mỏ')
                .setDescription(`Người chơi: ${message.author.username}`)
                .setThumbnail("https://media.discordapp.net/attachments/1162252607537037354/1163024549013639339/289f2231-4c6f-4f46-92a0-787c59c42a9d.gif?ex=653e1204&is=652b9d04&hm=d0964553ea07706ed324e6a215a6103e7a5af644803628260dd654930031dc8d&=&width=160&height=160")
                .addFields(
                    { name: "Bạn bị trừ", value: `${parse_money(cost)} để mua vé :ticket: vào đào mỏ`, inline: false },
                    { name: "Ấn nút này để đào:", value: "⛏️", inline: false }
                );

            const messageMine = await message.reply({ embeds: [embed] });
            await messageMine.react("⛏️");

            const numMines = 3;
            const minedItems = [];

            const miningChances = [0.5801, 0.2323, 0.1621, 0.01, 0.0132, 0.0010, 0.0006];

            for (let i = 0; i < numMines; i++) {
                const reactionFilter = (reaction, user) => user.id === message.author.id && reaction.emoji.name === '⛏️';

                const collected = await messageMine.awaitReactions({ filter: reactionFilter, max: 1, time: 30000 });

                if (!collected.size) {
                    return message.reply("Hết thời gian chọn lựa chọn.");
                }

                const reaction = collected.first();
                const minedItem = randomChoiceWeighted([
                    "Đá", "Đồng", "Bạc", "Vàng", "Bạch Kim", "Kim Cương", "Titanium"
                ], miningChances);
                const minedWeight = randomChoice([5, 10, 15]);

                minedItems.push({ item: minedItem, weight: minedWeight });

                embed.addFields({
                    name: "Khoáng sản đã đào",
                    value: `${getEmoji(minedItem)} ${minedItem}: ${minedWeight}g`,
                    inline: false
                });
                await messageMine.edit({ embeds: [embed] });
                await reaction.users.remove(message.author.id).catch(error => console.error('Failed to remove reaction:', error));
            }

            const fqoins = minedItems.reduce((total, { item, weight }) => total + getFqoins(item, weight), 0);

            if (!minedItems.length) {
                embed.addFields({ name: "Kết quả", value: "Bạn không đào được vật phẩm nào.", inline: false });
            } else {
                const itemsInfo = minedItems.map(({ item, weight }) =>
                    `${getEmoji(item)} ${item}: ${weight}g là ${getFqoins(item, weight)}`
                );
                embed.addFields({ name: "Kết quả", value: itemsInfo.join('\n'), inline: false });
            }

            embed.addFields({ name: "Số tiền nhận được", value: `${fqoins}`, inline: false });
            await messageMine.reactions.removeAll();
            await messageMine.edit({ embeds: [embed] });

            playerBalance += fqoins;
            await sqliteProvider.setMoney(message.author.id, playerBalance);
        } finally {
            delete gameData[message.author.id];
        }
    },
};

function getFqoins(minedItem, minedWeight) {
    const values = {
        "Đá": [6500, 7000, 9000],
        "Đồng": [10000, 12000, 15000],
        "Bạc": [20000, 22000, 25000],
        "Vàng": [30000, 32000, 35000],
        "Bạch Kim": [40000, 42000, 45000],
        "Kim Cương": [200000, 500000, 1000000],
        "Titanium": [1100000, 1500000, 2000000]
    };
    return values[minedItem][minedWeight / 5 - 1];
}

function getEmoji(minedItem) {
    const emojis = {
        "Đá": "<:stone:1160536087756800051>",
        "Đồng": "<:copper:1160535400381689867>",
        "Bạc": "<:silver:1160535418735956029>",
        "Vàng": "<:gold:1160535407595888662>",
        "Bạch Kim": "<:platinum:1160535413694414859>",
        "Kim Cương": "<:diamond:1160535403481276496>",
        "Titanium": "<:titanium:1160535426042441848>"
    };
    return emojis[minedItem];
}

function randomChoice(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
}

function randomChoiceWeighted(choices, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < choices.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return choices[i];
        }
    }
    return choices[choices.length - 1]; 
}

const gameData = {};

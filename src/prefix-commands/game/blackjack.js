const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");
const SQLiteProvider = require('../../provider/SQLiteProvider'); 
const { parse_money , isAdministrator} = require("../../utils/Utils");
const cards = config.cards;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = {
    name: "bj",
    description: '[ GAME ] xì dách',
    run: async (client, message, args) => {
        const sqliteProvider = new SQLiteProvider();
        sqliteProvider.init();
        const user = message.author;

        if (args[0] && args[0].toLowerCase() === "all") {
            const currentMoney = await sqliteProvider.getMoney(user.id);
            if (currentMoney <= 0) {
                return message.channel.send("Bạn không có tiền để đặt cược.");
            }
            args[0] = currentMoney;
        }

        const betAmount = parseInt(args[0]);

        if (isNaN(betAmount) || betAmount <= 0) {
            return message.channel.send("Số tiền đặt cược không hợp lệ. Vui lòng cung cấp số dương hợp lệ.");
        }

        const currentMoney = await sqliteProvider.getMoney(user.id);
        if (currentMoney < betAmount) {
            return message.channel.send("Bạn không có đủ tiền để đặt cược.");
        }
        let deck = [...cards];
        deck = shuffle(deck);

        const playerHand = [deck.pop(), deck.pop()];
        const dealerHand = [deck.pop(), deck.pop()];

        let revealDealerHand = false;

        const calculateHandValue = (hand) => {
            return hand.reduce((acc, card) => {
                if (card.value === "A") {
                    return acc + 11 > 21 ? acc + 1 : acc + 11;
                } else if (["J", "Q", "K"].includes(card.value)) {
                    return acc + 10;
                } else {
                    return acc + parseInt(card.value);
                }
            }, 0);
        };

        const getHandValueString = (hand, isDealer, user, reveal) => {
            let handValue = calculateHandValue(hand);
            let aceCount = hand.filter(card => card.value === "A").length;

            while (aceCount > 0 && handValue > 21) {
                handValue -= 10;
                aceCount--;
            }

            const username = user ? (user.tag || user.username || "Unknown User") : "Unknown User";

            if (!reveal && isDealer) {
                return `${isDealer ? "Nhà Cái" : `${username}`} (?)`;
            }

            return `${isDealer ? "Nhà Cái" : `${username}`} (${handValue})`;
        };

        const playerHandStr = playerHand.map(card => card.emoji).join(' ');
        const dealerHandStr = getHandValueString(dealerHand, true, user, revealDealerHand);
        const hide = `<:Sau:1200893342922309662> <:Sau:1200893342922309662>`
        const embed = new EmbedBuilder()
            .setTitle("Blackjack")
            .addFields(
                { name: dealerHandStr, value: hide },
                { name: getHandValueString(playerHand, false, user, true), value: playerHandStr },
            )
            .setColor("#faff0b")
            .setTimestamp();

        const msg = await message.channel.send({ embeds: [embed] });

        await msg.react("▶");
        await msg.react("🛑");

        const filter = (reaction, user) => ["▶", "🛑"].includes(reaction.emoji.name) && user.id === message.author.id;
        const collector = msg.createReactionCollector({ filter, time: 60000 });

        collector.on("collect", async (reaction, user) => {
            let playerHandValue = calculateHandValue(playerHand);

            if (playerHandValue > 21) {
                collector.stop("BUST");
                return;
            }

            if (reaction.emoji.name === "▶") {
                const newCard = deck.pop();
                playerHand.push(newCard);
                const newHandStr = playerHand.map(card => card.emoji).join(' ');
                const newEmbed = new EmbedBuilder()
                    .setTitle("Blackjack")
                    .addFields(
                        { name: getHandValueString(dealerHand, true, user, revealDealerHand), value: hide },
                        { name: getHandValueString(playerHand, false, user, true), value: newHandStr },
                    )
                    .setColor(playerHandValue > 21 ? "#ff0000" : "#0099ff")
                    .setTimestamp();

                await msg.edit({ embeds: [newEmbed] });

                await reaction.users.remove(user.id).catch(error => console.error('Failed to remove reaction:', error));

                if (playerHandValue > 21) {
                    collector.stop("BUST");
                }
            } else if (reaction.emoji.name === "🛑") {
                collector.stop("STAND");
            }
        });

        collector.on("end", async (collected, reason) => {
            let playerHandValue = calculateHandValue(playerHand);
            let dealerHandValue = calculateHandValue(dealerHand);
            revealDealerHand = true;

            const dealerFinalHandStr = dealerHand.map(card => card.emoji).join(' ');

            let resultEmbed;

            if (reason === "BUST" || playerHandValue > 21) {
                await sqliteProvider.reduceMoney(user.id, betAmount);
                resultEmbed = new EmbedBuilder()
                    .setTitle("Blackjack ")
                    .addFields(
                        { name: getHandValueString(dealerHand, true, user, true), value: dealerFinalHandStr },
                        { name: getHandValueString(playerHand, false, user, true), value: "QUẤT" }
                    )
                    .setColor("#ff0000")
                    .setTimestamp();
                   
            } else if (reason === "STAND") {
                while (dealerHandValue < 17) {
                    const newCard = deck.pop();
                    dealerHand.push(newCard);
                    dealerHandValue = calculateHandValue(dealerHand);
                }

                const playerFinalHandStr = playerHand.map(card => card.emoji).join(' ');

                resultEmbed = new EmbedBuilder()
                    .setTitle("Blackjack")
                    .addFields(
                        { name: getHandValueString(dealerHand, true, user, true), value: dealerFinalHandStr },
                        { name: getHandValueString(playerHand, false, user, true), value: playerFinalHandStr }
                    )
                    .setTimestamp();

                if ((dealerHandValue > 21 || playerHandValue > dealerHandValue) && !(playerHandValue > 21 && dealerHandValue > 21)) {
                    await sqliteProvider.addMoney(user.id, betAmount);
                    resultEmbed.setColor("#00ff00");
                    resultEmbed.addFields({ name: "Kết Quả", value: `Bạn đã thắng với số tiền ${parse_money(betAmount)}!` });
                   
                } else if (playerHandValue < dealerHandValue || (playerHandValue > 21 && dealerHandValue <= 21)) {
                    await sqliteProvider.reduceMoney(user.id, betAmount);
                    resultEmbed.setColor("#ff0000");
                    resultEmbed.addFields({ name: "Kết Quả", value: `Nhà Cái Thắng, Bạn Đã Thua ${parse_money(betAmount)}!` });
                    
                } else {
                    resultEmbed.setColor("#ffffff");
                    resultEmbed.addFields({ name: "Kết Quả", value: "Hòa Nhau!" });
                    
                }
                const updatedMoney = await sqliteProvider.getMoney(user.id);
                resultEmbed.setFooter({ text: `Số dư hiện tại của bạn là: ${parse_money(updatedMoney)}`, iconURL: 'https://cdn.discordapp.com/attachments/1159570842955567114/1184577041069256715/qx5K5Cr_1.gif' });
            }
            await msg.reactions.removeAll();
            await msg.edit({ embeds: [resultEmbed] });
        });
    }
};

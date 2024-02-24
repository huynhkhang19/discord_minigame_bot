const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money } = require("../../utils/Utils");

module.exports = {
    name: 'keobo',
    description: '[ GAME ] kéo bò',
    run: async (client, message, args) => {
        const sqliteProvider = new SQLiteProvider();
        sqliteProvider.init();
        const user = message.author;
        if (args.length !== 1 || isNaN(args[0])) {
            return message.reply('Vui lòng nhập số tiền cược.');
        }

        const betAmount = parseFloat(args[0]);

        if (betAmount <= 0) {
            return message.reply('Vui lòng nhập số tiền cược hợp lệ.');
        }

        const currentMoney = await sqliteProvider.getMoney(user.id);
        if (currentMoney < betAmount) {
            return message.channel.send("Bạn không có đủ tiền để đặt cược.");
        }

        if (isNaN(betAmount) || betAmount > 40000) {
            return message.channel.send("Bạn chỉ có thể mược max là 40k");
        }

        const animalIcons = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯"];

        const successRates = [0.9, 0.85, 0.8, 0.75, 0.05, 0.03, 0.02, 0.01, 0.005, 0.002];
                        //     90%  85   60    40   5    3       2    1     0.5    0.2
        const embed = new EmbedBuilder()
            .setTitle('Kéo Bò')
            .setDescription(`Bạn đã cược ${parse_money(betAmount)} và chọn một trong 10 con động vật.`)
            .setColor('#ff00c9');

        const buttonsRow1 = new ActionRowBuilder();
        const buttonsRow2 = new ActionRowBuilder();

        for (let i = 1; i <= 5; i++) {
            const animal = animalIcons[i - 1];
            const button = new ButtonBuilder()
                .setCustomId(`animal_${i}`)
                .setLabel(`X${i}`)
                .setEmoji(animal)
                .setStyle(ButtonStyle.Secondary);

            buttonsRow1.addComponents(button);
        }

        for (let i = 6; i <= 10; i++) {
            const animal = animalIcons[i - 1];
            const button = new ButtonBuilder()
                .setCustomId(`animal_${i}`)
                .setLabel(`X${i}`)
                .setEmoji(animal)
                .setStyle(ButtonStyle.Secondary);

            buttonsRow2.addComponents(button);
        }

        const replyMessage = await message.reply({ embeds: [embed], components: [buttonsRow1, buttonsRow2] });

        const filter = (interaction) => interaction.user.id === message.author.id && interaction.isButton();

        const collector = replyMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            const animalIndex = parseInt(interaction.customId.split('_')[1]);
            const selectedMultiplier = animalIndex;

            let randomSuccessRate = successRates[selectedMultiplier - 1];
            const isWin = Math.random() < randomSuccessRate;

            if (isWin) {
                const winnings = betAmount * selectedMultiplier;
                embed.setTitle(`Chúc mừng! Bạn đã trúng con ${animalIndex} với tỷ lệ x${selectedMultiplier}.`);
                embed.setColor('#00ff00');
                embed.setDescription(`Số tiền thưởng: ${parse_money(winnings)}`);
                embed.fields = [];
                sqliteProvider.addMoney(user.id, winnings);
            } else {
                embed.setTitle(`Chúc bạn may mắn lần sau!`);
                embed.setDescription(`Bạn đã chọn ${animalIndex} và đã kéo hụt nó`);
                embed.setColor('#ff0000');
                embed.fields = [];
            }

            await interaction.update({ embeds: [embed], components: [] });
            collector.stop();
        });

        collector.on('end', () => {
            replyMessage.edit({ components: [] });
        });
    },
};

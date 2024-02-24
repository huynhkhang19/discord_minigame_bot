const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money, isAdministrator } = require("../../utils/Utils");

module.exports = {
    name: "gapthu",
    description: '[ GAME ] gắp thú',
    run: async (client, message, args) => {
        const user = message.author;
        const gia = 50000;
        const sqliteProvider = new SQLiteProvider();
        sqliteProvider.init();

        const userMoney = await sqliteProvider.getMoney(user.id);

        if (gia > userMoney) {
            return message.channel.send("Bạn không có đủ tiền để chơi gắp thú!");
        }

        const animals = [
            { name: "Pikachu", price: 70000, probability: 0.5 }, // 50%
            { name: "Mèo", price: 150000, probability: 0.4 }, // 40%
            { name: "Chó", price: 300000, probability: 0.3 },//  30%
            { name: "Doremon", price: 450000, probability: 0.2 },//  20%
            { name: "Cá Heo", price: 570000, probability: 0.1 },// 10%
            { name: "Cừu", price: 1000000, probability: 0.09 },// 9%
            { name: "Vịt", price: 1200000, probability: 0.08 },// 8%
            { name: "Chibili", price: 3500000, probability: 0.07 },// 7%
            { name: "Haku", price: 4000000, probability: 0.06 },//  6%
            { name: "Nịt", price: 5000000, probability: 0.05 }// 5%
        ];

        const isWin = Math.random() < getRandomProbability();

        if (isWin) {
            await sqliteProvider.reduceMoney(user.id, gia);

            const randomAnimal = getRandomAnimal(animals);
            const Thuong = randomAnimal.price
            await sqliteProvider.addMoney(user.id, Thuong);

            const embed = new EmbedBuilder()
                .setTitle("Kết quả gắp thú")
                .setDescription(`Chúc mừng! Bạn đã gắp trúng ${randomAnimal.name} và nhận được ${parse_money(Thuong)} tiền!`)
                .setColor("#00ff41");

            const embedMessage = embed.toString(); 

            if (embedMessage.trim() !== "") {
                message.channel.send({ embeds: [embed] });
            } else {
                console.error("Empty embed content. Check your logic.");
            }

        } else {
            const embedDescription = "Chúc bạn may mắn lần sau! Bạn đã không gắp trúng.";

            const embed = new EmbedBuilder()
                .setTitle("Kết quả gắp thú")
                .setDescription(embedDescription)
                .setColor("#ff0000");

            const embedMessage = embed.toString(); 

            if (embedMessage.trim() !== "") {
                message.channel.send({ embeds: [embed] });
            } else {
                console.error("Empty embed content. Check your logic.");
            }
        }

   
        function getRandomAnimal(animals) {
            const randomProbability = Math.random();
            let cumulativeProbability = 0;

            for (const animal of animals) {
                cumulativeProbability += animal.probability;

                if (randomProbability <= cumulativeProbability) {
                    return animal;
                }
            }

          
            return animals[animals.length - 1];
        }


        function getRandomProbability() {
            return Math.random();
        }
    }
};

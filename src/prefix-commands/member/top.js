const { EmbedBuilder } = require("discord.js");
const SQLiteProvider = require('../../provider/SQLiteProvider');
const { parse_money } = require("../../utils/Utils");

module.exports = {
    name: "top",
    description: '[ MEMBER ] xem top',
    run: async (client, message, args) => {
        try {
            const sqliteProvider = new SQLiteProvider();
            sqliteProvider.init();
            
            const topUsers = await sqliteProvider.getTopBalances();
            
            const pageSize = 10;
            const totalPages = Math.ceil(topUsers.length / pageSize);

            const page = args[0] ? parseInt(args[0]) : 1;

            if (page < 1 || page > totalPages) {
                return message.reply(`Invalid page number. The leaderboard has ${totalPages} pages.`);
            }

            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const usersOnPage = topUsers.slice(startIndex, endIndex);

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle(`Bảng Xếp Hạng - Trang ${page}/${totalPages}`)
                .setTimestamp()
                .setFooter({ text: 'HAKUSTUDIO.DEV', iconURL: 'https://cdn.discordapp.com/attachments/1159570842955567114/1184577041069256715/qx5K5Cr_1.gif' });

            const topMembers = [];
            const topAdmins = [];

            usersOnPage.forEach((user, index) => {
                const rank = startIndex + index + 1;
                const entry = `**${rank}.** <@${user.discord_id}> - ${parse_money(user.money)}`;
                
                if (config.admins.includes(user.discord_id)) {
                    topAdmins.push(entry);
                } else {
                    topMembers.push(entry);
                }
            });
            if (topAdmins.length > 0) {
                embed.addFields({ name: 'TOP ADMIN:', value:  topAdmins.join('\n')});
            }

            if (topMembers.length > 0) {
                embed.addFields({ name: 'TOP MEMBER:',value: topMembers.join('\n')});
            }



            const leaderboardMessage = await message.reply({ embeds: [embed] });

            if (totalPages > 1) {
                await leaderboardMessage.react('⬅️');
                await leaderboardMessage.react('➡️');

                const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;

                const collector = leaderboardMessage.createReactionCollector({ filter, time: 60000 });

                let currentPage = page;

                collector.on('collect', (reaction) => {
                    reaction.users.remove(message.author);

                    if (reaction.emoji.name === '⬅️' && currentPage > 1) {
                        currentPage--;
                    } else if (reaction.emoji.name === '➡️' && currentPage < totalPages) {
                        currentPage++;
                    }

                    const startIndexNew = (currentPage - 1) * pageSize;
                    const endIndexNew = startIndexNew + pageSize;
                    const usersOnPageNew = topUsers.slice(startIndexNew, endIndexNew);

                    topMembers.length = 0;
                    topAdmins.length = 0;

                    usersOnPageNew.forEach((user, index) => {
                        const rankNew = startIndexNew + index + 1;
                        const entryNew = `**${rankNew}.** <@${user.discord_id}> - ${parse_money(user.money)}`;

                        if (client.config.admins.includes(user.discord_id)) {
                            topAdmins.push(entryNew);
                        } else {
                            topMembers.push(entryNew);
                        }
                    });

                    embed.setTitle(`Bảng Xếp Hạng - Trang ${currentPage}/${totalPages}`);
                    embed.fields = [];
                    if (topAdmins.length > 0) {
                        embed.addField('TOP ADMIN:', topAdmins.join('\n'));
                    }
                    if (topMembers.length > 0) {
                        embed.addField('TOP MEMBER:', topMembers.join('\n'));
                    }



                    leaderboardMessage.edit({ embeds: [embed] });
                });

                collector.on('end', () => {
                    leaderboardMessage.reactions.removeAll();
                });
            }
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            message.reply('An error occurred while retrieving the leaderboard.');
        }
    }
};

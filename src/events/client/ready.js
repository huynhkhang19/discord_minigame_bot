const Discord = require('discord.js');
const { Status } = require("discord.js");
const {BaseLogger} = require("../../logger/BaseLogger");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        try {
            this.logger = new BaseLogger();
            client.user.setPresence({
                status: Status.Idle,
                activities: [{
                    name: '.gg/hakuu',
                    type: Discord.ActivityType.Playing
                }]
            });
            this.logger.info(`Logged in as ${client.user.tag}`);
        } catch (error) {
            console.error('Error setting bot status:', error);
        }
    }
};

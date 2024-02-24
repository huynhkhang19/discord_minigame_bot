const Discord = require("discord.js");
const { GatewayIntentBits, Partials } = require('discord.js');
const { Routes } = require('discord-api-types/v10');
const fs = require("fs");
const mongoose = require('mongoose');
const {BaseLogger} = require("./logger/BaseLogger");
const {CancelCrash} = require("./crash/CancelCrash");
const { SQLiteProvider } = require("./provider/SQLiteProvider");
const options = require('./options.json');
class Client {

    constructor() {
        this.bot = new Discord.Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.MessageContent
            ],
            partials: [
                Partials.User,
                Partials.Channel,
                Partials.Reaction,
                Partials.Message
            ]
        });
        this.logger = new BaseLogger();
        new CancelCrash();
    }

    async registerEvents() {
        const eventDir = fs.readdirSync('./src/events');
        for (const dir of eventDir) {
            const eventFiles = fs.readdirSync(`./src/events/${dir}`).filter(file => file.endsWith('.js'));
            for (const file of eventFiles) {
                const event = require(`./events/${dir}/${file}`);
                if (event.once) {
                    this.bot.once(event.name, (...args) => event.execute(...args));
                } else {
                    this.bot.on(event.name, (...args) => event.execute(...args));
                }
            }
        }
        this.logger.info(`Registered ${eventDir.length} events!`);
    }
    async handleCommands(message) {
        if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;
    
        const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
    
        const command = this.bot.commands.get(commandName) || this.bot.prefixCommands.get(commandName) || this.bot.commands.find(cmd => cmd.data.aliases && cmd.data.aliases.includes(commandName));
    
        if (!command) return;
    
        try {
            command.execute(this.bot, message, args); 
        } catch (error) {
            console.error(error);
            message.reply('There was an error executing that command.');
        }
    }
    async registerCommands() {
        this.bot.commands = new Discord.Collection();
        const commandDir = fs.readdirSync('./src/commands');
        let commands = [];
        for (const dir of commandDir) {
            const commandFiles = fs.readdirSync(`./src/commands/${dir}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`./commands/${dir}/${file}`);
                await this.bot.commands.set(command.name, command); 
                commands.push(command.toJSON());
            }
        }
        try {
            const rest = new Discord.REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
            try {
                await rest.put(
                    Routes.applicationCommands(process.env.BOT_ID),
                    { body: commands },
                )
            } catch (e) {
                console.log(e.message);
            }
        } catch (e) {
            console.log(e.message)
        }
        this.logger.info(`Registered ${this.bot.commands.size} commands!`);
    }
    
    async prefixCommands() {
        this.bot.prefixCommands = new Discord.Collection();
        this.bot.aliases = new Discord.Collection();
        const folders = fs.readdirSync('./src/prefix-commands/');
        folders.forEach((dir) => {
            const commands = fs.readdirSync(`./src/prefix-commands/${dir}/`).filter((file) => file.endsWith('.js'));
            for (const file of commands) {
                const data = require(`./prefix-commands/${dir}/${file}`);
                if (!data.name) {
                    console.log(`Prefix command at ${file} is missing a name`);
                    continue;
                }
                this.bot.prefixCommands.set(data.name, data);
    
                if (data.aliases) {
                    data.aliases.forEach((alias) => {
                        this.bot.aliases.set(alias, data.name);
                    });
                }
            }
        });
        this.logger.info(`Registered ${this.bot.prefixCommands.size} prefix!`);
    }
    
    async mongodb() {
        if (options.mongoose) {
            mongoose.set('strictQuery', true);
    
            mongoose.connect(process.env.mongoURL || '', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            
            
    
            mongoose.connection.on('connected', () => {
                this.logger.info(`Successfully connected to mongoose`);
            });
    
            mongoose.connection.on('error', (err) => {
                console.error(`${err}`);
                console.log(" ");
            });
        }
    }
    async initConfig() {
        global.config = require('../config.json');
        this.database = new (require('./provider/SQLiteProvider'));
        this.database.init();
    }

    
    async getStorage() {
        return this.storage;
    }
    async login(token) {
        await this.registerEvents();
        await this.registerCommands();
        await this.prefixCommands();
        await this.initConfig();
        await this.getStorage();
        await this.bot.login(token);
        this.bot.on('messageCreate', (message) => {
            this.handleCommands(message);
        });
    }
}

module.exports = {
    Client
}
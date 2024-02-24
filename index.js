const {
    Client
} = require('./src/client')
require('dotenv').config();

global.config = require('./config.json');
global.main = new Client();
global.client = main.bot;
main.login(process.env.BOT_TOKEN);
main.mongodb()
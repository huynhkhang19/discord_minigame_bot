const {EmbedBuilder} = require("@discordjs/builders");
const parse_money = (money) => {
    if (money !== undefined && money !== null) {
        const formattedMoney = money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return `${formattedMoney} <:GTA_money:1201646615535030344>`;
    } else {
        return "0 <:GTA_money:1201646615535030344>";
    }
};

const parse_userid = (string, prefix) => {
    if (typeof string !== 'string' || typeof prefix !== 'string') {
        return null;  
    }

    let regex = /NT(.*?)\.[^.]*$/;
    let match = string.match(regex);

    if (match && match[1]) {
        let result = match[1];
        return result;
    } else {
        return null;
    }
}
const log = async (message) => {
    const logChannel = await client.channels.fetch(config.logId);
    if (logChannel) {
        logChannel.send(message);
    }
}
const logcr = async (message) => {
    const logCre = await client.channels.fetch(config.logSend);
    if (logCre) {
        logCre.send(message);
    }
}
const logdel = async (message) => {
    const logDel = await client.channels.fetch(config.logProduct);
    if (logDel) {
        logDel.send(message);
    }
}
const logredeem = async (message) => {
    const logrd = await client.channels.fetch(config.logRockstar);
    if (logrd) {
        logrd.send(message);
    }
}
const addtm = async (message) => {
    const add = await client.channels.fetch(config.addTime);
    if (add) {
        add.send(message);
    }
}
const embed = (message) => {
    return new EmbedBuilder()
        .setDescription(message)
        .setColor(Math.floor(Math.random() * 16777215));
}

const isAdministrator = (member) => {
    return config.admins.includes(member.id);
}

module.exports = {
    log,
    logcr,
    logdel,
    parse_money,
    parse_userid,
    logredeem,
    embed,
    addtm,
    isAdministrator
}
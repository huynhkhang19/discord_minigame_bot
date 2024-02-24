const colors = require('colors');
colors.setTheme({
    info: 'green',
    warn: 'yellow',
    error: 'red'
})

class BaseLogger {

    constructor() {
    }

    info(message) {
        console.log(`[INFO] ${colors.info(message)}`);
    }

    error(message) {
        console.log(`[ERROR] ${colors.error(message)}`);
    }

    warn(message) {
        console.log(`[WARN] ${colors.warn(message)}`);
    }
}

module.exports = {
    BaseLogger
}
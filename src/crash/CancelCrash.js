class CancelCrash {
    constructor() {
        const errors = [
            'uncaughtException',
            'unhandledRejection',
            'DiscordAPIError',
            'error'
        ];
        for (const error of errors) {
            process.on(error, (err) => {
                this.writeCrashDump(err);
            });
        }
    }

    async writeCrashDump(err) {
        console.error('Error occurred:', err.message);
        console.error('Stack trace:', err.stack);
    }
}

module.exports = {
    CancelCrash
}

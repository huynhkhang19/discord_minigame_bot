const sqlite3 = require("sqlite3").verbose();

class SQLiteProvider {
    constructor() {}

    init() {
        this.db = new sqlite3.Database("./src/database.sqlite", (err) => {
            if (err) {
                console.error(err.message);
            }
        });

        const createUserTableQuery = `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT NOT NULL,
            money INTEGER NOT NULL DEFAULT 100000
        )`;
        

        this.db.run(createUserTableQuery, (err) => {
            if (err) {
                console.error(err.message);
            }
        });
    }

    async getUser(discord_id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT * FROM users WHERE discord_id = ?`,
                [discord_id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(row);
                }
            );
        });
    }

    async createUser(discord_id) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO users (discord_id, money) 
                 VALUES (?, COALESCE((SELECT money FROM users WHERE discord_id = ?), 100000))`,
                [discord_id, discord_id],
                (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                }
            );
        });
    }
    

    async getMoney(discord_id) {
        return new Promise((resolve, reject) => {
            this.getUser(discord_id)
                .then((user) => {
                    if (user) {
                        resolve(user.money);
                    } else {
                        this.createUser(discord_id)
                            .then(() => {
                                resolve(0);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    async setMoney(discord_id, money) {
        return new Promise((resolve, reject) => {
            this.getUser(discord_id)
                .then((user) => {
                    if (user) {
                        this.db.run(
                            `UPDATE users SET money = ? WHERE discord_id = ?`,
                            [money, discord_id],
                            (err) => {
                                if (err) {
                                    reject(err);
                                }
                                resolve();
                            }
                        );
                    } else {
                        this.createUser(discord_id)
                            .then(() => {
                                this.db.run(
                                    `UPDATE users SET money = ? WHERE discord_id = ?`,
                                    [money, discord_id],
                                    (err) => {
                                        if (err) {
                                            reject(err);
                                        }
                                        resolve();
                                    }
                                );
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    async addMoney(discord_id, money) {
        return new Promise((resolve, reject) => {
            this.getUser(discord_id)
                .then((user) => {
                    if (user) {
                        this.db.run(
                            `UPDATE users SET money = money + ? WHERE discord_id = ?`,
                            [money, discord_id],
                            (err) => {
                                if (err) {
                                    reject(err);
                                }
                                resolve();
                            }
                        );
                    } else {
                        this.createUser(discord_id)
                            .then(() => {
                                this.db.run(
                                    `UPDATE users SET money = money + ? WHERE discord_id = ?`,
                                    [money, discord_id],
                                    (err) => {
                                        if (err) {
                                            reject(err);
                                        }
                                        resolve();
                                    }
                                );
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    async reduceMoney(discord_id, money) {
        return new Promise((resolve, reject) => {
            this.getUser(discord_id)
                .then((user) => {
                    if (user) {
                        this.db.run(
                            `UPDATE users SET money = money - ? WHERE discord_id = ?`,
                            [money, discord_id],
                            (err) => {
                                if (err) {
                                    reject(err);
                                }
                                resolve();
                            }
                        );
                    } else {
                        this.createUser(discord_id)
                            .then(() => {
                                this.db.run(
                                    `UPDATE users SET money = money - ? WHERE discord_id = ?`,
                                    [money, discord_id],
                                    (err) => {
                                        if (err) {
                                            reject(err);
                                        }
                                        resolve();
                                    }
                                );
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    async getTopBalances() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT discord_id, money FROM users ORDER BY money DESC LIMIT 10',
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
}

module.exports = SQLiteProvider;

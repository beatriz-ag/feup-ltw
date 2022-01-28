class MPplayer extends Player {
    constructor(name, pass, server) {
        super(1, name);
        this.pass = pass;
        this.server = server;
        this.points = 0;
    }

    play(index) {
        this.server.notify(index);
    }

    async register() {
        try {
            await this.server.register({ "nick": `${this.name}`, "pass": `${this.pass}` })
                .then(() => {})
                .catch((err) => {
                    throw err;
                });
        } catch (error) {
            throw error;
        }
    }
}

const Joining = Symbol('join');
const Joined = Symbol('joined');
const Start = Symbol('start');

class Server {
    constructor() {
        this.url = "http://twserver.alunos.dcc.fc.up.pt:8979";
        this.game;
        this.user;
        this.pass;
        this.state = Start;
        this.evtSource;
    }

    async join(data) {
        const { size, seeds } = data;

        const req = {
            method: 'POST',
            body: JSON.stringify({
                group: 79,
                nick: this.user,
                password: this.pass,
                size: parseInt(size),
                initial: parseInt(seeds)
            })
        };

        try {
            this.game = await fetch(`${this.url}/join`, req)
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) {
                        throw data.error;
                    }
                    return data.game;
                })
                .catch(err => {
                    throw err;
                });
            console.log(this.game);
        } catch (err) {
            throw err;
        }
        this.state = Joining;
    }

    async leave() {
        const req = {
            method: 'POST',
            body: JSON.stringify({
                game: this.game,
                nick: this.user,
                password: this.pass,
            })
        };

        try {
            this.data = await fetch(`${this.url}/leave`, req)
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) {
                        throw data.error;
                    }
                    return data;
                })
                .catch(err => {
                    throw err;
                });
            this.evtSource.close();
            return this.data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * notifies the server of the move performed
     * @param move 
     */
    async notify(move) {
        const req = {
            method: 'POST',
            body: JSON.stringify({
                game: this.game,
                nick: this.user,
                password: this.pass,
                move,
            })
        };


        try {
            fetch(`${this.url}/notify`, req)
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) {
                        throw data.error;
                    }
                })
                .catch(err => { console.log(err) });
        }
        catch (error) { throw error };
    }

    /**
     * 
     * @returns ranking from server
     */
    async ranking() {
        const req = {
            method: 'POST',
            body: JSON.stringify({})
        };

        const data = await fetch(`${this.url}/ranking`, req).then(res => res.json());
        return data.ranking;
    }

    /**
     * register in server
     * @param data 
     */
    async register(data) {
        this.user = data.nick;
        this.pass = data.pass;

        const req = {
            method: 'POST',
            body: JSON.stringify({
                nick: this.user,
                password: this.pass
            })
        };

        try {
            await fetch(`${this.url}/register`, req)
                .then(async (res) => {
                    if (!res.ok) {
                        const data = await res.json();
                        throw data.error;
                    }
                })
                .catch((err) => {
                    throw err;
                });
        } catch (err) {
            console.log(err);
            throw err;
        }

    }

    /**
     * sets event source handler
     * @param handler 
     */
    setUpdateEventHandler(handler) {
        this.evtSource = new EventSource(`${this.url}/update?` + new URLSearchParams({
            nick: this.user,
            game: this.game
        }));

        this.evtSource.onmessage = handler;
    }

    /**
     * closes event source handler
     */
    closeEventHandler() {
        this.evtSource.close();
    }

    async update() {
        const req = {
            method: 'GET',
        };

        fetch(`${this.url}/update?` + new URLSearchParams({
            nick: this.user,
            game: this.game
        }), req)
            .then(res => {
                res.json();
            })
            .then(data => {
                this.state = Joined;
                return data;
            })
            .catch(err => console.log(err));
        return 0;
    }

}



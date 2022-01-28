class MPgame extends Game {
    constructor(board, [playerName, playerPass], endGame, server, menu) {
        super(board, 0, endGame, menu);
        this.setPlayers([new Player(0), new MPplayer(playerName, playerPass, server)]);
        this.server = server;
    }
    /**
      * controller that runs every second to update timer
      */
    gameController() {
        switch (this.state) {
            case Loading:
                this.timeoutId = setTimeout(() => this.gameController(), 1000);
                this.updateTimer();
                break;
            case Playing:
                this.timeoutId = setTimeout(() => this.gameController(), 1000);
                this.updateTimer();
                break;
            case Pause:
                this.timeoutId = setTimeout(() => this.gameController(), 1000);
                this.updateTimer();
                break;
            default:
                break;
        }
    }

    /**
     * displays joining waiting screen
     */
    setWaitingScreen() {
        const loading = document.getElementsByClassName('loading')[0];
        this.state = Loading;
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('loading-animation').style.display = 'block';
        loading.firstElementChild.textContent = 'Waiting for the opponent';
    }

    /**
     * join the server
     */
    async join() {
        try {
            await this.server.join({ "size": `${this.board.holes / 2}`, "seeds": `${this.board.seeds}` })
                .then(() => { })
                .catch((err) => {
                    throw err;
                })
        } catch (error) {
            throw error;
        }
    }

    /**
     * 
     * @param winnerName 
     */
    checkQuit(winnerName) {
        const winner = this.players[1].getName() === winnerName ? 1 : 0;
        const looser = Math.abs(winner - 1);
        const looserPoints = this.players[looser].getPoints();
        if (this.players[winner].getPoints() <= looserPoints)
            this.players[winner].increasePoints(looserPoints + 1);
    }

    /**
     * receives game updates from server
     * @param  event 
     * @returns 
     */
    playingUpdateHandler(event) {
        const info = JSON.parse(event.data);

        if (info.quit !== undefined) {
            document.getElementById('error-popup').style.display = 'flex';
            document.getElementById('error-msg').textContent = info.quit;
        }

        let pit = info.pit;
        const win = info.winner;

        this.registerMove(this.turn, pit);

        if (win !== undefined) {
            this.checkQuit(win);
            this.stop();
            this.endGame(this.players);
        }
        if (pit === undefined) return;

        if (info.board && info.board.turn) {
            if (this.turn) {
                pit++;
            } else {
                pit += (this.board.getHoles() + 4) / 2;
            }

            this.performMoves(parseInt(pit));
        }
    }

    /**
     * receives join updates from server
     * @param event 
     * @returns 
     */
    joiningUpdateHandler(event) {
        const data = JSON.parse(event.data);
        const stores = data.stores;
        let opponentName;

        if (data.winner !== undefined) {
            document.getElementById('error-popup').style.display = 'flex';
            document.getElementById('error-msg').textContent = 'Nobody to join the game';
            return;
        }
        this.turn = (this.players[1].getName() === data.board.turn) ? 1 : 0;
        this.setTurn(this.turn);
        this.board.changePlayerHovers(this.turn);

        const turns = [document.getElementById('theirturn'), document.getElementById('yourturn')];
        turns[this.turn].style.visibility = 'visible';


        for (var name in stores) {
            if (name !== this.players[1].getName()) {
                opponentName = name;
                break;
            }
        }
        this.state = Playing;
        this.players[0].setName(opponentName);
        document.getElementById('name0').textContent = opponentName;
        this.unsetLoadingScreen();
        this.state = Playing;

        if (!this.turn) this.player0Turn();
        else this.player1Turn();

        this.server.closeEventHandler();
        this.server.setUpdateEventHandler(this.playingUpdateHandler.bind(this));
        this.time = 0;
    }

    /**
     * Starts multiplayer game
     * Sets waiting screen and game
     * Registers and joins user
     */
    async start() {
        this.setWaitingScreen();

        try {
            await this.players[1].register();
        } catch (error) {
            this.unsetLoadingScreen();
            throw error;
        };
        await this.setGame();
        this.updateSidebar();

        try {
            await this.join();
        } catch (error) {
            throw error;
        };


        this.server.setUpdateEventHandler(this.joiningUpdateHandler.bind(this));
        this.gameController();
    }

    /**
     * Sets the player's name in the sidebar
     */
    updateSidebar() {
        const loggedElements = document.getElementsByClassName('logged');
        document.getElementsByClassName('text')[0].textContent = this.players[1].getName();
        for (let logged of loggedElements) logged.style.display = 'block';
    }

    /**
     * stops the game
     */
    stop() {
        removeEventListener(onmessage, this.playingUpdateHandler);
        clearTimeout(this.timeoutId);
        this.unsetLoadingScreen();
        this.server.closeEventHandler();
    }

    /**
     * redirects to main menu
     */
    mainMenu() {
        this.stop();
        this.menu();
        try {
            this.server.leave();

        } catch (error) {
            document.getElementById('error-popup').style.display = 'flex';
            document.getElementById('error-msg').textContent = error;
        }
    }

    /**
     * restarts game
     */
    restart() {
        this.stop();
        this.menu();
        try {
            this.server.leave();
        } catch (error) {
            document.getElementById('error-popup').style.display = 'flex';
            document.getElementById('error-msg').textContent = error;
        }
    }

    /**
     * Opponent's turn to play
     */
    async player0Turn() {
        await this.disableBoardListeners();
        this.setLoadingScreen();
    }

    /**
     * Player's turn to play
     */
    async player1Turn() {
        this.boardListeners();
        this.unsetLoadingScreen();
        this.state = Playing;
    }

    /**
     * Notifies the server of the played event
     * @param idx hole where to execute the play
     * @returns 
     */
    async executePlay(idx) {
        const index = parseInt(idx);

        // Invalid move
        if (!this.board.checkPlayerHole(this.turn, index)) return false;
        this.server.notify(index - 1);
    }
}

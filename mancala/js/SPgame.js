class SPgame extends Game {
    constructor(board, player, firstPlayer, level, endGame, menu) {
        super(board, firstPlayer, endGame, menu);
        this.setPlayers([new Bot(level), new Player(1, player)])
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
                break;
            default:
                break;
        }
    }

    /**
     * sets the game display and its components
     */
    async start() {
        await this.setGame();
        this.updateSideBar();
        this.setScoreBoard();
        this.gameController();
        if (this.turn) {
            this.player1Turn();
        } else {
            this.player0Turn();
        }
    }

    /**
     * updates the side bar's player name
     */
    updateSideBar() {
        const loggedElements = document.getElementsByClassName('logged');
        const notLoggedElements = document.getElementsByClassName('not-logged');
        let loggedDisplay, notLoggedDisplay;
        if (this.players[1].logged) {
            loggedDisplay = 'block';
            notLoggedDisplay = 'none';
            document.getElementsByClassName('text')[0].textContent = this.players[1].getName();
        } else {
            loggedDisplay = 'none';
            notLoggedDisplay = 'block';
            notLoggedElements[notLoggedElements.length - 1].onclick = () => {
                const name = document.getElementById('username').value;
                this.players[1].setName(name);
                document.getElementById('name1').textContent = name;
                this.updateSideBar();
            }
        }

        for (let logged of loggedElements) logged.style.display = loggedDisplay;
        for (let notLogged of notLoggedElements) notLogged.style.display = notLoggedDisplay;

    }

    /**
     * stop game controller loop
     */
    stop() {
        clearTimeout(this.timeoutId);
    }

    /**
     * stops the game and goes to main menu
     */
    mainMenu() {
        this.stop();
        this.menu()
    }

    /**
     * restarts game
     */
    restart() {
        this.stop();
        this.start();
    }

    /**
     * bots turn to play
     * sets bot loading screen
     * performs bot move
     */
    async player0Turn() {
        this.disableBoardListeners();

        this.setLoadingScreen();

        const index = await this.players[0].play(this.board);

        await this.executePlay(index);

        this.boardListeners();
    }

    /**
     * enables board listeners for the user to perform
     */
    async player1Turn() {
        this.unsetLoadingScreen();
        this.boardListeners();
    }

    /**
     * receives user input and performs the move
     * @param  idx hole index where the user clicked
     * @returns 
     */
    async executePlay(idx) {
        this.disableBoardListeners();
        const index = parseInt(idx);
        this.registerMove(this.turn, index);
        // Invalid move
        if (!this.board.checkPlayerHole(this.turn, index)) return false;
        await this.performMoves(index);
    }

}

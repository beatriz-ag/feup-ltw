
const Pause = Symbol('Pause');
const Loading = Symbol('Loading');

class Game {
    constructor(board, firstPlayer, endGame, menu) {
        this.time = 0;
        this.timeoutId;
        this.state;
        this.players = [];

        this.board = board;
        this.turn = firstPlayer;
        this.endGame = endGame;
        this.menu = menu;
        this.setEventListeners();
        this.function = this.play.bind(this);
    }

    /**
     * sets the game's players
     * @param players 
     */
    setPlayers(players) {
        this.players = players;
    }

    /**
     * sets the game's turn
     * @param turn 
     */
    setTurn(turn) {
        this.turn = turn;
    }

    /**
     * calls the game event listeners set up
     */
    setEventListeners() {
        this.pauseMenuListeners();
        this.sidebarListeners();
        this.gameListeners();
    }

    /**
     * sets the loading screen display on
     */
    setLoadingScreen() {
        const loading = document.getElementsByClassName('loading')[0];
        this.state = Loading;
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('loading-animation').style.display = 'block';
        loading.firstElementChild.textContent = `${this.players[0].getName()} is playing`;
    }

    /**
     * sets the loading screen display off
     */
    unsetLoadingScreen() {
        const loading = document.getElementsByClassName('loading')[0];
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('loading-animation').style.display = 'none';
        loading.firstElementChild.textContent = 'none';
        this.boardListeners();
    }

    /**
     * increases the timer
     */
    updateTimer() {
        let minutes = Math.floor(this.time / 60);
        let seconds = this.time - minutes * 60;
        if (minutes < 10) minutes = `0${minutes}`;
        if (seconds < 10) seconds = `0${seconds}`;
        document.getElementById('gameTimeCounter').textContent = `${minutes}:${seconds}`
        this.time = this.time + 1;
    }

    /**
     * updates games frontend on player's turn change
     */
    updatesTurnsDisplay() {
        const players = [document.getElementById('name0'), document.getElementById('name1')];
        const turns = [document.getElementById('yourturn'), document.getElementById('theirturn')];

        turns[this.turn].style.visibility = 'visible';
        turns[this.turn].style.visibility = 'hidden';

        if (this.turn) {
            turns[this.turn].textContent = 'Their turn';
        } else {
            turns[this.turn].textContent = 'Your turn';
        }
        const previousPlayer = (this.turn + 1) % 2;
        players[this.turn].style.fontSize = '4vw';
        players[previousPlayer].style.fontSize = '3vw';
    }

    /**
     * changes player's game turn
     */
    changeTurn() {
        this.turn = (this.turn + 1) % 2;

        this.board.changePlayerHovers(this.turn);

        this.updatesTurnsDisplay();
    }

    /**
     * sets the game to begin
     */
    async setGame() {
        this.time = 0;
        this.state = Playing;

        this.board.create();
        this.board.updateHovers(this.turn);
        this.boardListeners();
        const turns = document.getElementsByClassName('game-yourTurn');
        turns[0].style.visibility = 'hidden';
        turns[1].style.visibility = 'hidden';

        const players = [document.getElementById('name0'), document.getElementById('name1')];
        const scores = [document.getElementById('score0'), document.getElementById('score1')];

        this.players[0].reset();
        this.players[1].reset();
        players[0].innerHTML = this.players[0].getName();
        scores[0].innerHTML = this.players[0].getPoints();

        players[1].innerHTML = this.players[1].getName();
        scores[1].innerHTML = this.players[1].getPoints();

        document.getElementById('main-menu-page').style.display = 'none';
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('game-page').style.display = 'block';
        document.getElementById('sidebar').style.display = 'grid';
    }

    /**
     * sets the score board parameteres and points
     */
    setScoreBoard() {
        const turns = [document.getElementById('theirturn'), document.getElementById('yourturn')];
        turns[this.turn].style.visibility = 'visible';
        const players = [document.getElementById('name0'), document.getElementById('name1')];
        players[this.turn].style.fontSize = '4vw';
    }

    /**
     * resume game
     */
    resume() {
        this.state = Playing;
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('game-page').style.display = 'block';
        if (!this.turn) this.setLoadingScreen();
    }

    /**
     * pause game
     */
    pauseMenu() {
        this.state = Pause;
        this.unsetLoadingScreen();
        document.getElementById('pause-menu').style.display = 'block';
        document.getElementById('game-page').style.display = 'none';
    }

    checkAvailableMoves(player) {
        return this.board.getNonEmptyHoles(player).length;
    }

    /**
     * executes a move
     * @param  index where to perform the move animation
     * @returns true if game over
     */
    async performMoves(index) {
        const seeds = this.board.getHoleSeeds(index);
        const lastIndex = await this.moveSeeds(seeds, index + 1, index);

        await this.loadingTime(500);

        const lastPlayer = this.turn;

        if (!this.board.checkPlayerStorage(this.turn, lastIndex)) {
            await this.badassMove(lastIndex);
            this.changeTurn();
            this.board.changePlayerHovers(this.turn);
        } else {
            this.board.updateHovers(this.turn);
        }

        //game over
        if (!this.checkAvailableMoves(lastPlayer)) {
            this.getFinalPoints();
            this.unsetLoadingScreen();
            this.stop();
            this.updateMovesTable();
            return this.endGame(this.players)
        };

        if (this.turn) {
            this.player1Turn();
        } else {
            this.player0Turn();
        }
    }

    /**
     * verifies if move's last seed lays on an empty player game
     * and if so collects that seed and the opposite hole opponent's seeds
     * @param index where to play
     */
    async badassMove(index) {
        if (!this.board.checkPlayerHole(this.turn, index)) return;
        if (!this.board.checkNumberOfSeeds(index, 1)) return;


        const opponentIndex = index + this.board.getHoles() - (2 * (index - 1));
        const mySeeds = this.board.getHoleSeeds(index);
        const opponentSeeds = this.board.getHoleSeeds(opponentIndex);
        const totalSeeds = mySeeds + opponentSeeds;

        // Criar função em game que faz o empty e muda o toggle
        this.board.empty(index);
        this.board.empty(opponentIndex);

        this.board.increasePlayerSeeds(this.turn, totalSeeds);

        await this.board.moveSeeds(index, this.board.getPlayerStorage(this.turn), mySeeds);
        await this.board.moveSeeds(opponentIndex, this.board.getPlayerStorage(this.turn), opponentSeeds);

        this.players[this.turn].increasePoints(totalSeeds);
    }

    /**
     * moves seeds from hole to index hole
     * verifying its validity
     * @param  seeds to move
     * @param  index to put seed on
     * @param  from to remove seed from
     * @returns 
     */
    async moveSeeds(seeds, index, from) {
        const maxHolesIndex = this.board.getHoles() + 2;
        index = index % maxHolesIndex;

        // Base case - (+maxHolesIndex prevents the casa where index = 0)
        if (!seeds) {
            return (index - 1 + maxHolesIndex) % maxHolesIndex;
        }

        // Storage holes
        if (this.board.checkOpponentStorage(this.turn, index)) return this.moveSeeds(seeds, index + 1, from);
        if (this.board.checkPlayerStorage(this.turn, index)) this.players[this.turn].increasePoints(1);

        this.board.increaseHoleSeeds(index);
        this.board.decreaseHoleSeeds(from, 1);

        await this.board.moveSeeds(from, index, 1);

        return this.moveSeeds(seeds - 1, index + 1, from);
    }

    /**
     * sets game event listeners
     */
    gameListeners() {
        /*Pause*/
        const pauseButton = document.getElementById('gamePauseIcon');
        pauseButton.onclick = () => {
            this.pauseMenu();
        }

        /* Sidebar */
        const btn = document.getElementById('sidebar-bttn');
        const sidebar = document.getElementById('sidebar');
        btn.onclick = function () {
            btn.classList.toggle('active');
            sidebar.classList.toggle('active');
        }
        document.addEventListener('click', function (event) {
            const btn = document.getElementById('sidebar-bttn');
            const sidebar = document.getElementById('sidebar');
            if (!sidebar.contains(event.target) && sidebar.classList.contains('active')) {
                btn.classList.remove('active');
                sidebar.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === "Escape") {
                switch (this.state) {
                    case Playing:
                        this.pauseMenu();
                        break;
                    case Pause:
                        this.resume();
                        break;
                    case Loading:
                        this.pauseMenu();
                        break;
                    default:
                        break;
                }
            }
        }, false);
    }

    /**
    * sets pause menu listeners
    */
    pauseMenuListeners() {
        const pauseButtons = document.getElementsByClassName('pause-menu-button');
        const resume = pauseButtons[0];
        resume.onclick = () => this.resume();

        const mainMenu = pauseButtons[1];
        mainMenu.onclick = () => {
            this.mainMenu();
            clearTimeout(this.timeoutId);
        };

        const restart = pauseButtons[2];
        restart.onclick = () => {
            this.restart();
            clearTimeout(this.timeoutId);
        }

        const exit = pauseButtons[3];
        exit.onclick = () => {
            this.stop();
            clearTimeout(this.timeoutId);
            let new_window =
                open(location, '_self');

            // Close this window
            new_window.close();
        }
    }

    /**
     * sets game over event listeners
     */
    gameOverListeners() {
        const [menu, exit] = document.getElementsByClassName('gameOverButton');
        const stats = document.getElementById('gameStats');
        menu.onclick = () => {
            this.setMenu();
            document.getElementById('game-over').style.display = 'none';
        }
        exit.onclick = () => {
            let new_window =
                open(location, '_self');

            // Close this window
            new_window.close();
            window.location.href = "webpage.htm";
        };
        stats.onclick = () => {
            document.getElementById('game-over').style.display = 'none';
            document.getElementById('stats-page').style.display = 'block';
        }
    }

    /**
     * function called on click when user performs play
     * @param  e hole index where player clicked
     */
    play(e) {
        let idx = e.target.id;
        if (e.target.classList.contains('seed')) {
            idx = e.target.parentElement.id;
        }
        this.executePlay(idx);
        this.disableBoardListeners();
    }

    /**
     * sets board event listeners
     */
    boardListeners() {
        const holes = document.getElementsByClassName('hole');

        for (var i = 0; i < holes.length; i++) {
            holes[i].addEventListener('click', this.function);
        }
    }

    /**
     * disables board event listeners
     */
    async disableBoardListeners() {
        const holes = document.getElementsByClassName('hole');
        for (var i = 0; i < holes.length; i++) {
            holes[i].removeEventListener('click', this.function);
        }
    }

    /**
     * updates players final points
     */
    getFinalPoints() {
        const points0 = this.board.getAllSeeds(0);
        const points1 = this.board.getAllSeeds(1);

        this.board.increasePlayerSeeds(0, points0);
        this.players[0].increasePoints(points0);
        this.board.increasePlayerSeeds(1, points1);
        this.players[1].increasePoints(points1);
    }

    /**
     * sleep js function
     * @param ms to sleep
     * @returns 
     */
    loadingTime(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * sets side bar listeners
     */
    sidebarListeners() {
        const input = document.getElementById('username');
        input.oninput = function (e) {
            const string = e.target.value;
            const char = string.charAt(string.length - 1);
            if (!isNaN(char) || string.length === 7) {
                e.target.value = string.substr(0, string.length - 1);
                e.target.setCustomValidity('Username should only contain lettees. e.g. john');
            }
        }
        const boardOptions = document.getElementById('boardOptions').children;
        const holesOptions = document.getElementById('holesOptions').children;
        const seedsOptions = document.getElementById('seedsOptions').children;
        for (let option of boardOptions) {
            let child = option.firstElementChild;
            child.onclick = () => {
                let color;
                if (child.src) {
                    color = `url('assets/${child.alt}.jpg')`;
                }
                else color = child.style.background;

                this.board.setBoardColor(color);
            }
        }

        for (let option of holesOptions) {
            let child = option.firstElementChild;
            child.onclick = () => {
                const color = child.style.background;
                this.board.setHolesColor(color);
            }
        }

        for (let option of seedsOptions) {
            let child = option.firstElementChild;
            child.onclick = () => {
                this.board.setSeedsColorSet(parseInt(child.getAttribute('data-colorsId')));
            }
        }
    }

    /**
     * updates statistics move pages
     */
    updateMovesTable() {
        const lines = document.getElementsByClassName('gameMoves-line');
        const name0 = this.players[0].getName();
        const score0 = this.players[0].getPoints();
        const name1 = this.players[1].getName();
        const score1 = this.players[1].getPoints();

        lines[0].lastChild.style.borderRight = 0;
        lines[1].lastChild.style.borderRight = 0;

        const names = document.getElementsByClassName('gameMoves-table-name');
        names[0].textContent = name1;
        names[1].textContent = name0;

        const scoreBoardNames = document.getElementsByClassName('stats-boardName');
        scoreBoardNames[2].textContent = name0;
        scoreBoardNames[0].textContent = name1;
        const scoreBoardNumbers = document.getElementsByClassName('stats-boardNumber');
        scoreBoardNumbers[1].textContent = score0;
        scoreBoardNumbers[0].textContent = score1;

        document.getElementById('stats-boardTimeText').textContent = document.getElementById('gameTimeCounter').textContent;
    }

    /**
     * register move performed in statistics page
     * @param player who performed play
     * @param move that player executed
     */
    registerMove(player, move) {
        const lines = document.getElementsByClassName('gameMoves-line');

        const emptyCell = document.createElement('span');
        emptyCell.classList.add('play-log');
        const moveCell = document.createElement('span');
        moveCell.classList.add('play-log');
        moveCell.textContent = move;

        const topLineCell = player ? moveCell : emptyCell;
        const bottomLineCell = player ? emptyCell : moveCell;

        lines[0].appendChild(topLineCell);
        lines[1].appendChild(bottomLineCell);
    }

}

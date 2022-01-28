const Menu = Symbol('menu');
const Playing = Symbol('playing');

window.onload = function () {
    const mancala = new Mancala();
    startAnimation();
}

class Mancala {
    constructor() {
        this.state = Menu;
        this.server = new Server();
        this.timeoutId;

        this.intro();
    }

    /**
     * sets menu and eventlisteners
     */
    intro() {
        this.setEventListeners();
        this.setMenu();
    }

    /**
     * sets event listeners
     */
    setEventListeners() {
        this.mainMenuListeners();
        this.statsListeners();
        this.gameOverListeners();
    }

    /**
     * 
     * @param enable menu to display
     * @param disable menu array to disable display
     */
    displayMenu(enable, disable) {
        enable.content.style.display = enable.displayMode;
        enable.button.style.color = '#DABC22';
        (disable.buttons).forEach(button => button.style.color = '#71631E');
        (disable.content).forEach(content => content.style.display = 'none');
    }

    /**
     * sets the menu to display
     */
    setMenu() {
        document.getElementById('config-content').style.display = 'grid';
        document.getElementById('instructions-content').style.display = 'none';
        document.getElementById('leaderboard-content').style.display = 'none';

        document.getElementById('diff-medium').style.color = 'rgba(218, 188, 34, 1)';
        document.getElementById('player-checkbox').checked = true;
        document.getElementById('player-checkbox-label').style.color = 'rgba(218, 188, 34, 1)';

        document.getElementById('number-seeds').textContent = 4;
        document.getElementById('number-holes').textContent = 6;
        document.getElementById('main-menu-page').style.display = 'block';

        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('game-page').style.display = 'none';
        document.getElementById('stats-page').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('sidebar').style.display = 'none';

        this.multiplayer = false;
        const password = document.getElementsByClassName('username-label')[1];
        const passwordInput = document.getElementsByClassName('user-input')[1];

        password.style.opacity = .4;
        passwordInput.disabled = true;
        passwordInput.style.cursor = 'default';
        const botGameButton = document.getElementById('box-1');
        const MPGameButton = document.getElementById('box-2');
        botGameButton.style.color = 'white';
        botGameButton.style.background = 'rgba(255, 200, 0, 0.603)';
        MPGameButton.style.color = 'rgba(38, 55, 65, 0.5)';
        MPGameButton.style.background = ' linear-gradient(0deg, rgba(255, 199, 0, 0.2), rgba(255, 199, 0, 0.2)';
        
        document.getElementsByClassName('difficulty')[0].style.color = 'white';

        const difs = document.getElementsByClassName('list-button');
        for (var i = 0; i < difs.length; i++) difs[i].style.color = 'rgba(218, 188, 34, 0.4)';

        document.getElementById('diff-medium').style.color = 'rgba(218, 188, 34, 1)';
        
        document.getElementsByClassName('first')[0].style.color = 'white';

        const elems = document.getElementsByClassName('checkbox-content');
        for (var i = 0; i < elems.length; i++) {
            elems[i].firstElementChild.style.opacity = 1;
            if (elems[i].firstElementChild.checked) {
                elems[i].style.color = 'rgba(218, 188, 34, 1)';
            } else {
                elems[i].style.color = 'rgba(218, 188, 34, 0.4)';
            }
        }

        document.getElementById('snd-player-text').innerHTML = 'bot';

        this.bot = true;
    }

    /**
     * sets the game with inputs given in menu
     */
    async setGame() {
        const seeds = document.getElementById('number-seeds').textContent;
        const holes = document.getElementById('number-holes').textContent;
        const board = new Board(parseInt(seeds), parseInt(holes));

        const multiplayer = document.getElementById('box-2').style.background === 'rgba(255, 200, 0, 0.604)';

        const playerName = document.getElementsByClassName('text-box')[0].value;
        const playerPass = document.getElementsByClassName('text-box')[1].value;

        const firstPlayer = document.getElementById('player-checkbox').checked ? 1 : 0;

        if (!multiplayer) {

            let level = 0;
            if (document.getElementById('diff-easy').style.color === 'rgb(218, 188, 34)') level = 1;
            else if (document.getElementById('diff-medium').style.color === 'rgb(218, 188, 34)') level = 2;
            else level = 3;

            this.game = new SPgame(board, playerName, firstPlayer, level, this.endGame.bind(this), this.setMenu);
        } else {
            this.game = new MPgame(board, [playerName, playerPass], this.endGame.bind(this), this.server, this.setMenu);
        }

        try {
            await this.game.start();
        } catch (error) {
            throw error;
        }
    }

    
    mainMenuListeners() {
        /* Main Menu */
        const input = document.getElementsByClassName('user-input');
        input[0].oninput = function (e) {
            const string = e.target.value;
            const char = string.charAt(string.length - 1);
            if (!isNaN(char) || string.length === 7) {
                e.target.value = string.substr(0, string.length - 1);
                e.target.setCustomValidity('Username should only contain lettees. e.g. john');
            }
        }
        input[1].oninput = function (e) {
            const string = e.target.value;
            const char = string.charAt(string.length - 1);
            if (!isNaN(char) || string.length === 7) {
                e.target.value = string.substr(0, string.length - 1);
                e.target.setCustomValidity('Password should only contain lettees. e.g. john');
            }
        }

        const configMenuButton = document.getElementById('config');
        configMenuButton.onclick = () => {
            const configBtn = document.getElementById('config');
            const configContent = document.getElementById('config-content');
            const instBtn = document.getElementById('inst');
            const instContent = document.getElementById('instructions-content');
            const leaderbrdBtn = document.getElementById('leaderboard');
            const leaderbrdContent = document.getElementById('leaderboard-content');


            this.displayMenu(
                { button: configBtn, content: configContent, displayMode: "grid" },
                {
                    buttons: [instBtn, leaderbrdBtn],
                    content: [instContent, leaderbrdContent]
                });
        };

        const instructionsMenuButton = document.getElementById('inst');
        instructionsMenuButton.onclick = () => {
            const configBtn = document.getElementById('config');
            const configContent = document.getElementById('config-content');
            const instBtn = document.getElementById('inst');
            const instContent = document.getElementById('instructions-content');
            const leaderbrdBtn = document.getElementById('leaderboard');
            const leaderbrdContent = document.getElementById('leaderboard-content');


            this.displayMenu(
                { button: instBtn, content: instContent, displayMode: "block" },
                {
                    buttons: [configBtn, leaderbrdBtn],
                    content: [configContent, leaderbrdContent]
                });
        };

        const offlineLeaderBoard = document.getElementById('offline-title');
        offlineLeaderBoard.onclick = () => {
            const offlineTitle = document.getElementById('offline-title');
            const onlineTitle = document.getElementById('online-title');
            offlineTitle.classList.remove('disabled');
            onlineTitle.classList.add('disabled');
            let list = [];

            const leaderbrdContent = document.getElementById('leaderboard-content-list');
            leaderbrdContent.innerHTML = '';

            const leaderboardOffline = localStorage.getItem('leaderboard');
            if (!leaderboardOffline) {
                localStorage.setItem('leaderboard', JSON.stringify([{ name: 'Tiago', points: 4 }, { name: 'Bia', points: 2 }]));
            } else {
                list = JSON.parse(leaderboardOffline);
            }

            list.forEach((elem, index) => {
                const leaderboard = document.createElement('span');
                const leaderboardName = document.createElement('span');

                if (index <= 2) {
                    leaderboard.classList.add('leaderboard-item-prize');
                    const icon = document.createElement('img');
                    icon.setAttribute('src', "../assets/Prize.svg");
                    icon.setAttribute('alt', "prize");
                    icon.className = 'prize-img';
                    icon.style.verticalAlign = "middle";
                    leaderboardName.append(icon);

                } else {
                    leaderboard.classList.add('leaderboard-item');
                }


                const name = document.createElement('span').textContent = `${elem.name}`;
                leaderboardName.append(name);
                leaderboard.append(leaderboardName);

                const leaderboardPoints = document.createElement('span');
                leaderboardPoints.className = 'leaderboard-points';

                const points = document.createElement('span');
                points.style.fontFamily = "numbersFont";
                points.style.fontSize = "59px";
                points.textContent = `${elem.points} `; // insert points

                leaderboardPoints.append(points);
                const pts = document.createElement('span').textContent = 'pts';
                leaderboardPoints.append(pts);
                leaderboard.append(leaderboardPoints);
                leaderbrdContent.append(leaderboard);
            });
        }

        const onlineLeaderBoard = document.getElementById('online-title');
        onlineLeaderBoard.onclick = async () => {
            const offlineTitle = document.getElementById('offline-title');
            const onlineTitle = document.getElementById('online-title');
            offlineTitle.classList.add('disabled');
            onlineTitle.classList.remove('disabled');

            const leaderbrdContent = document.getElementById('leaderboard-content-list');
            leaderbrdContent.innerHTML = '';

            let list = await this.server.ranking();

            if (!list) return;
            list.forEach((elem, index) => {
                const leaderboard = document.createElement('span');
                const leaderboardName = document.createElement('span');

                if (index <= 2) {
                    leaderboard.classList.add('leaderboard-item-prize');
                    const icon = document.createElement('img');
                    icon.setAttribute('src', "../assets/Prize.svg");
                    icon.setAttribute('alt', "prize");
                    icon.className = 'prize-img';
                    icon.style.verticalAlign = "middle";
                    leaderboardName.append(icon);
                } else {
                    leaderboard.classList.add('leaderboard-item');
                }

                const name = document.createElement('span').textContent = `${elem.nick}`;
                leaderboardName.append(name);
                leaderboard.append(leaderboardName);

                const leaderboardPoints = document.createElement('span');
                leaderboardPoints.className = 'leaderboard-points';

                const points = document.createElement('span');
                points.style.fontFamily = "numbersFont";
                points.style.fontSize = "59px";
                points.textContent = `${elem.wins} `; // insert points

                leaderboardPoints.append(points);
                const victories = document.createElement('span').textContent = 'WINS';
                leaderboardPoints.append(victories);
                leaderboard.append(leaderboardPoints);
                leaderbrdContent.append(leaderboard);
            });
        }

        const leaderboardMenuButton = document.getElementById('leaderboard');
        leaderboardMenuButton.onclick = () => {
            //const list = this.server.ranking();
            let list = [{ name: 'tiago', victories: '2' }, { name: 'bia', victories: '4' }];

            const configBtn = document.getElementById('config');
            const configContent = document.getElementById('config-content');
            const instBtn = document.getElementById('inst');
            const instContent = document.getElementById('instructions-content');
            const leaderbrdBtn = document.getElementById('leaderboard');
            const leaderbrdContent = document.getElementById('leaderboard-content-list');
            const offlineTitle = document.getElementById('offline-title');
            const onlineTitle = document.getElementById('online-title');
            offlineTitle.classList.remove('disabled');
            onlineTitle.classList.add('disabled');

            leaderbrdContent.innerHTML = '';

            const leaderboardOffline = localStorage.getItem('leaderboard');
            if (!leaderboardOffline) {
                localStorage.setItem('leaderboard', JSON.stringify([{ name: 'Tiago', points: 4 }, { name: 'Bia', points: 2 }]));
            } else {
                list = JSON.parse(leaderboardOffline);
            }

            list.forEach((elem, index) => {
                const leaderboard = document.createElement('span');
                const leaderboardName = document.createElement('span');

                if (index <= 2) {
                    leaderboard.classList.add('leaderboard-item-prize');
                    const icon = document.createElement('img');
                    icon.setAttribute('src', "../assets/Prize.svg");
                    icon.setAttribute('alt', "prize");
                    icon.className = 'prize-img';
                    icon.style.verticalAlign = "middle";
                    leaderboardName.append(icon);

                } else {
                    leaderboard.classList.add('leaderboard-item');
                }


                const name = document.createElement('span').textContent = `${elem.name}`;
                leaderboardName.append(name);
                leaderboard.append(leaderboardName);

                const leaderboardPoints = document.createElement('span');
                leaderboardPoints.className = 'leaderboard-points';

                const points = document.createElement('span');
                points.style.fontFamily = "numbersFont";
                points.style.fontSize = "59px";
                points.textContent = `${elem.points} `; // insert points

                leaderboardPoints.append(points);
                const pts = document.createElement('span').textContent = 'pts';
                leaderboardPoints.append(pts);
                leaderboard.append(leaderboardPoints);
                leaderbrdContent.append(leaderboard);
            });

            const leaderBrd = document.getElementById('leaderboard-content');

            this.displayMenu(
                { button: leaderbrdBtn, content: leaderBrd, displayMode: "block" },
                {
                    buttons: [configBtn, instBtn],
                    content: [configContent, instContent]
                });
        };

        /* numberOfSeeds */
        const addSeedsNumber = document.getElementById('add-seeds');
        addSeedsNumber.onclick = () => {
            const box = document.getElementById('number-seeds');
            let value = parseInt(box.textContent);
            if (value < 20) {
                value++;
                box.textContent = value;
            }
        };

        const removeSeedsNumber = document.getElementById('remove-seeds');
        removeSeedsNumber.onclick = () => {
            const box = document.getElementById('number-seeds');
            let value = parseInt(box.textContent);
            if (value > 0) {
                value--;
                box.textContent = value;
            }
        };

        /* numberOfHoles */

        const addHolesNumber = document.getElementById('add-holes');
        addHolesNumber.onclick = () => {
            const box = document.getElementById('number-holes');
            let value = parseInt(box.textContent);
            if (value < 10) {
                value += 2;
                box.textContent = value;
            }
        };

        const removeHolesNumber = document.getElementById('remove-holes');
        removeHolesNumber.onclick = () => {
            const box = document.getElementById('number-holes');
            let value = parseInt(box.textContent);
            if (value > 0) {
                value -= 2;
                box.textContent = value;
            }
        };

        /* difficulty */
        const diffEasyMenuButton = document.getElementById('diff-easy');
        diffEasyMenuButton.onclick = () => {
            if (!this.bot) return;
            this.difficulty = 'easy';
            document.getElementById('diff-easy').style.color = 'rgba(218, 188, 34, 1)';
            document.getElementById('diff-medium').style.color = 'rgba(218, 188, 34, 0.4)';
            document.getElementById('diff-hard').style.color = 'rgba(218, 188, 34, 0.4)';
        };

        const diffMediumMenuButton = document.getElementById('diff-medium');
        diffMediumMenuButton.onclick = () => {
            if (!this.bot) return;
            this.difficulty = 'medium';
            document.getElementById('diff-easy').style.color = 'rgba(218, 188, 34, 0.4)';
            document.getElementById('diff-medium').style.color = 'rgba(218, 188, 34, 1)';
            document.getElementById('diff-hard').style.color = 'rgba(218, 188, 34, 0.4)';
        };

        const diffHardMenuButton = document.getElementById('diff-hard');
        diffHardMenuButton.onclick = () => {
            if (!this.bot) return;
            this.difficulty = 'hard';
            document.getElementById('diff-easy').style.color = 'rgba(218, 188, 34, 0.4)';
            document.getElementById('diff-medium').style.color = 'rgba(218, 188, 34, 0.4)';
            document.getElementById('diff-hard').style.color = 'rgba(218, 188, 34, 1)';
        };

        /* First Player */
        const playerCheckbox = document.getElementById('player-checkbox');
        const botCheckbox = document.getElementById('bot-checkbox');

        playerCheckbox.onclick = () => { return this.bot; }
        botCheckbox.onclick = () => { return this.bot; }

        playerCheckbox.onchange = () => {
            if (playerCheckbox.checked) {
                document.getElementById('player-checkbox-label').style.color = 'rgba(218, 188, 34, 1)';
                document.getElementById('bot-checkbox-label').style.color = 'rgba(218, 188, 34, 0.4)';
                this.player = 0;
            }
        }

        botCheckbox.onchange = () => {
            if (botCheckbox.checked) {
                document.getElementById('player-checkbox-label').style.color = 'rgba(218, 188, 34, 0.4)';
                document.getElementById('bot-checkbox-label').style.color = 'rgba(218, 188, 34, 1)';
                this.player = 1;
            }
        }

        /*Multiplayer*/
        const botGameButton = document.getElementById('box-1');
        const MPGameButton = document.getElementById('box-2');

        botGameButton.onclick = () => {
            this.multiplayer = false;
            const password = document.getElementsByClassName('username-label')[1];
            const passwordInput = document.getElementsByClassName('user-input')[1];

            password.style.opacity = .4;
            passwordInput.disabled = true;
            passwordInput.style.cursor = 'default';

            botGameButton.style.color = 'white';
            botGameButton.style.background = 'rgba(255, 200, 0, 0.603)';
            MPGameButton.style.color = 'rgba(38, 55, 65, 0.5)';
            MPGameButton.style.background = ' linear-gradient(0deg, rgba(255, 199, 0, 0.2), rgba(255, 199, 0, 0.2)';
            document.getElementsByClassName('difficulty')[0].style.color = 'white';

            const difs = document.getElementsByClassName('list-button');
            for (var i = 0; i < difs.length; i++) difs[i].style.color = 'rgba(218, 188, 34, 0.4)';

            document.getElementById('diff-medium').style.color = 'rgba(218, 188, 34, 1)';
            
            document.getElementsByClassName('first')[0].style.color = 'white';

            const elems = document.getElementsByClassName('checkbox-content');
            for (var i = 0; i < elems.length; i++) {
                elems[i].firstElementChild.style.opacity = 1;
                if (elems[i].firstElementChild.checked) {
                    elems[i].style.color = 'rgba(218, 188, 34, 1)';
                } else {
                    elems[i].style.color = 'rgba(218, 188, 34, 0.4)';
                }
            }
            
            document.getElementById('snd-player-text').innerHTML = 'bot';

            this.bot = true;
        };

        MPGameButton.onclick = () => {
            this.multiplayer = true;
            const password = document.getElementsByClassName('username-label')[1];
            const passwordInput = document.getElementsByClassName('user-input')[1];
            password.style.opacity = 1;
            passwordInput.disabled = false;
            passwordInput.style.cursor = 'text';


            MPGameButton.style.color = 'white';
            MPGameButton.style.background = 'rgba(255, 200, 0, 0.603)';
            botGameButton.style.color = 'rgba(38, 55, 65, 0.5)';
            botGameButton.style.background = ' linear-gradient(0deg, rgba(255, 199, 0, 0.2), rgba(255, 199, 0, 0.2)';
            this.disableDifficulty();
            this.disableFirstPlayer();
            this.bot = false;
            document.getElementById('snd-player-text').innerHTML = 'oponent';
        };

        const playButton = document.getElementById('interactive-dice-box');
        playButton.onclick = async () => {
            this.state = Playing;

            try {
                await this.setGame();
            } catch (error) {
                document.getElementById('error-popup').style.display = 'flex';
                document.getElementById('error-msg').textContent = error;
            }
        }

        const errorButton = document.getElementById('error-button');
        errorButton.onclick = () => {
            document.getElementById('error-popup').style.display = 'none';
            this.setMenu();
        };
    }

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
        };
        stats.onclick = () => {
            document.getElementById('game-over').style.display = 'none';
            document.getElementById('stats-page').style.display = 'block';
        }
    }

    statsListeners() {
        const buttons = document.getElementsByClassName('stats-button');
        buttons[0].onclick = () => {
            this.game.restart();
        }
        buttons[1].onclick = () => {
            document.getElementById('stats-page').style.display = 'none';
            this.setMenu();
        }
    }

    /**
     * disables difficulty menu content
     */
    disableDifficulty() {
        document.getElementsByClassName('difficulty')[0].style.color = 'rgba(218, 188, 34, 0.2)';
        const difs = document.getElementsByClassName('list-button');
        for (var i = 0; i < difs.length; i++) difs[i].style.color = 'rgba(218, 188, 34, 0.2)';
    }

    /**
     * disables firts player menu option
     */
    disableFirstPlayer() {
        document.getElementsByClassName('first')[0].style.color = 'rgba(218, 188, 34, 0.2)';
        const elems = document.getElementsByClassName('checkbox-content');
        for (var i = 0; i < elems.length; i++) {
            elems[i].style.color = 'rgba(218, 188, 34, 0.2)';
            elems[i].firstElementChild.style.opacity = 0.2;

        }
    }

    /**
     * callback of the game function
     * sets gameover menu based on winner and looser received in the params
     * @param players end state of the game
     */
    endGame(players) {
        // if player 1 ganha, redireciona para a página win
        // if player 2 ganha, redireciona para a página lost

        //update stats page based on points and name
        document.getElementById('loading-screen').style.display = 'none';
        if (players[0] instanceof Bot) {
            document.getElementById('gameStats').style.display = 'block';
            this.saveRankingOffline(players);
        }
        else {
            document.getElementById('gameStats').style.display = 'none';
        }
        

        document.getElementById('game-page').style.display = 'none';
        document.getElementById('sidebar').style.display = 'none';
        document.getElementById('game-over').style.display = 'block';
        const points0 = players[0].getPoints();
        const points1 = players[1].getPoints();

        const player1Wins = points1 > points0;
        const playersDraw = points1 == points0;
        const winElements = document.getElementsByClassName('winContainer');
        const lostElements = document.getElementsByClassName('lostContainer');
        const drawElements = document.getElementsByClassName('drawContainer');

        let win, lost, draw;

        if (player1Wins) { win = 'flex'; lost = 'none'; draw = 'none' }
        else if (playersDraw) { win = 'none'; lost = 'none', draw = 'flex' }
        else { win = 'none'; lost = 'flex'; draw = 'none' }

        for (let elem of winElements) {
            elem.style.display = win;
        }
        for (let elem of lostElements) {
            elem.style.display = lost;
        }
        for (let elem of drawElements) {
            elem.style.display = draw;
        }


        // pausa o tempo quando acaba
        // muda o estado
    }

    saveRankingOffline(players) {
        const botPoints = players[0].getPoints();
        const playerPoints = players[1].getPoints();
        //Player1 won
        let points = 3;

        //Bot won
        if (botPoints > playerPoints) return;

        //Draw
        if (botPoints == playerPoints) points = 1;

        const temp = localStorage.getItem('leaderboard');
        const player1Name = players[1].getName();

        if (!temp) {
            localStorage.setItem('leaderboard', JSON.stringify({ name: player1Name, points }));
            return;
        }

        const leaderboard = JSON.parse(temp);

        const idx = leaderboard.findIndex(elem => elem.name === player1Name.toUpperCase());

        if (idx < 0) leaderboard.push({
            name: player1Name.toUpperCase(),
            points
        });
        else leaderboard[idx] = {
            name: leaderboard[idx].name,
            points: leaderboard[idx].points + points
        };

        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }
}

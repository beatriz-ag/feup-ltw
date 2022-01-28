const crypto = require('crypto');
const fs = require('fs');

function checkUser(nick, password, dataArray) {
    for (data of dataArray) {
        if (data.nick === nick) {
            if (data.password !== password) return -1;
            return 1;
        }
    }
    return 0;
};

function writeToFile(dataArray, filename) {

    dataArray = dataArray.sort((player1, player2) => {
        if (player1.wins === player2.wins) return 0;
        if (player1.wins > player2.wins) return -1;
        if (player1.wins < player2.wins) return +1;

    });
    fs.writeFile(`${filename}`, `${JSON.stringify(dataArray)}`, (err) => {
        if (err) console.log(err);
        else console.log('Saved to file\n');
    })
};

function createGame(hash, size, initial, playerName, password, response1) {
    const board = new Array(size * 2 + 2).fill(initial);
    board[0] = 0;
    board[size + 1] = 0;
    return { hash: hash, board, size, turn: playerName, player1: playerName, password1: password, player2: null, password2: null, response1, response2: null, playerturn: null }
};

function findMatch(waitingList, size, initial) {
    for (let idx = 0; idx < waitingList.length; idx++) {
        const value = waitingList[idx];
        if (value.size === size && value.initial === initial) {
            const game = waitingList.splice(idx, 1)[0];
            return [1, createGame(game.hash, size, initial, game.nick, game.password, game.response1)];
        }
    }
    return [0, null];
};

function game_over(game, move, dataArray) {
    const { board, player1, player2 } = game;

    const half = board.length / 2;
    const player1Side = board.slice(1, half);
    const player2Side = board.slice(half + 1, board.length);

    if (player1Side.every((elem) => elem === 0) || player2Side.every((elem) => elem === 0)) {
        let winner;

        board[half] += player1Side.reduce((a, b) => a + b, 0);
        board[0] += player2Side.reduce((a, b) => a + b, 0);
        if (board[0] > board[half])
            winner = player2;
        else if (board[0] < board[half])
            winner = player1;
        else
            winner = null;

        updateDataArray(game, dataArray, winner);
        update(game, move, winner);
        return 1;
    }

    return 0;
};

function play(move, currentGames, gameIndex, dataArray) {
    const game = currentGames[gameIndex];
    const board = game.board;
    const length = board.length;
    const half = Math.floor(length / 2);

    //execute move
    let idx = (game.turn !== game.player1) ? move + half + 1 : move + 1;
    let currSeeds = board[idx];
    board[idx++] = 0;

    while (currSeeds) {
        currSeeds--;
        if (idx === 0) {
            if (game.turn === game.player2)
                board[idx] += 1;
            else
                currSeeds++;
            idx++;
            continue;
        }

        if (idx === half) {
            if (game.turn === game.player1)
                board[idx] += 1;
            else
                currSeeds++;
            idx++;
            continue;
        }
        idx = idx % length;

        board[idx] += 1;
        idx = (idx + 1) % length;
    }
    const lastPosition = (idx - 1) % length;
    const storage = (game.turn === game.player2) ? 0 : half;

    const playerSide = (game.turn === game.player1) ?
        lastPosition > 0 && lastPosition < half
        :
        lastPosition > half;


    if (lastPosition !== storage) {
        game.turn = (game.turn === game.player1) ? game.player2 : game.player1;
        game.playerturn = (game.playerturn === 1) ? 2 : 1;
    }

    if (board[lastPosition] === 1 && playerSide) {
        const oppponentHole = Math.abs(lastPosition - length);
        board[storage] += 1 + board[oppponentHole];
        board[lastPosition] = 0;
        board[oppponentHole] = 0;
    }


    if (game_over(game, move, dataArray)) {
        currentGames.splice(gameIndex, 1);
        clearTimeout(game.timeoutID);
        return;
    }

    update(game, move, undefined);
};

const update = (game, pit, winner) => {
    const {
        board,
        response1,
        response2,
        player1,
        player2,
        turn
    } = game;


    const half = game.board.length / 2;
    const message = {
        board: {
            sides: {
                [player1]: {
                    store: board[half],
                    pits: board.slice(1, half)
                },

                [player2]: {
                    store: board[0],
                    pits: board.slice(half + 1, board.length)
                }
            },
            turn: turn
        },
        stores: {
            [player1]: board[half],
            [player2]: board[0]
        }
    };
    if (pit !== undefined) message.pit = pit;
    if (winner !== undefined) message.winner = winner;

    response1.write(`data: ${JSON.stringify(message)}\n\n`);
    response2.write(`data: ${JSON.stringify(message)}\n\n`);
};

function updateDataArray(game, dataArray, user) {
    if (dataArray.length === 0) return;

    const player_winner = dataArray.find((player) => player.nick === user);
    player_winner.games += 1;
    player_winner.wins += 1;

    const loser = game.player1 === user ? game.player2 : game.player1;
    const player_loser = dataArray.find((player) => player.nick === loser);
    player_loser.games += 1;

    writeToFile(dataArray, './server/mancalaData.txt');
}

function playingTimeOut(game, dataArray, currentGames) {
    if (game === undefined) return;

    const gameIndex = currentGames.findIndex((elem) => elem.hash === game.hash);
    currentGames.splice(gameIndex, 1);


    //whoever didn't play is the looser
    const winner = (game.playerturn === 1) ? game.player1 : game.player2;

    updateDataArray(game, dataArray, winner);

    const message = {};
    message.winner = winner;

    if (game.response1 === undefined || game.response2 === undefined) return;

    game.response1.write(`data: ${JSON.stringify(message)}\n\n`);
    game.response2.write(`data: ${JSON.stringify(message)}\n\n`);
}

function joiningTimeOut(res, waitingList, waitingGame) {
    if (res === undefined) return;

    const gameIndex = waitingList.findIndex((elem) => elem.hash === waitingGame.hash);
    waitingList.slice(gameIndex, gameIndex + 1);

    res.write(`data: ${JSON.stringify({ winner: null })}\n\n`);
}

function sendLeave(game, nick) {
    const message = { quit: 'Opponnent quit' };
    clearTimeout(game.timeoutID);

    if (game.player1 === nick) {
        game.response2.write(`data: ${JSON.stringify(message)}\n\n`);
    } else {
        game.response1.write(`data: ${JSON.stringify(message)}\n\n`);
    }
}

exports.notify = function (req, currentGames, dataArray) {
    return new Promise(resolve => {
        let body = '';
        req.on('data', (temp) => { body += temp; })
            .on('end', () => {
                try {
                    const { nick, password, game, move } = JSON.parse(body);
                    const gameIndex = currentGames.findIndex((elem) => elem.hash === game);

                    if (gameIndex === -1) {
                        resolve({
                            status: 400,
                            error: JSON.stringify({ error: 'Game not found' })
                        });
                        return;
                    }
                    const currGame = currentGames[gameIndex];

                    if ((!(currGame.player1 === nick && currGame.password1 == password)) && (!(currGame.player2 === nick && currGame.password2 == password))) {
                        resolve({
                            status: 400,
                            error: JSON.stringify({ error: 'User credentials incorrect' })
                        });
                        return;
                    }

                    if (nick !== currGame.turn) {
                        //error -> não é o teu turno
                        resolve({
                            status: 400,
                            error: JSON.stringify({ error: 'Not your turn to play' })
                        });
                        return;
                    }

                    //erro -> move tem de ser inteiro positivo
                    if (!Number.isInteger(move) || move < 0 || move >= currGame.length / 2) {
                        resolve({
                            status: 400,
                            error: JSON.stringify({ error: 'Invalid move' })
                        });
                        return;
                    }

                    clearTimeout(currGame.timeoutID);
                    currGame.timeoutID = setTimeout(playingTimeOut, 120000, currGame, dataArray, currentGames);

                    play(move, currentGames, gameIndex, dataArray);
                    resolve({
                        status: 200,
                        message: JSON.stringify({})
                    });
                } catch (err) { console.log(err.message); }
            })
            .on('error', (err) => { console.log(err.message); });
    });
};

exports.leave = function (req, currentGames, dataArray) {
    return new Promise(resolve => {
        let body = '';
        req.on('data', (temp) => { body += temp; })
            .on('end', () => {
                try {
                    const { nick, game } = JSON.parse(body);
                    const gameIndex = currentGames.findIndex((elem) => elem.hash === game);
                    if (gameIndex === -1) {
                        resolve({
                            status: 400,
                            error: JSON.stringify({ error: 'Game not found' })
                        });
                        return;
                    }

                    const curGame = currentGames[gameIndex];
                    clearTimeout(curGame.timeoutID);

                    sendLeave(curGame, nick);

                    const game_over = currentGames.splice(gameIndex, 1)[0];
                    if ((game_over.player1 !== nick) && (game_over.player2 !== nick)) {
                        resolve({
                            status: 401,
                            error: JSON.stringify({ error: 'Invalid User credentials' })
                        });
                        return;
                    }

                    const loser = dataArray.find((player) => player.nick === nick);
                    const winner = game_over.player1 === loser ? game_over.player2 : game_over.player1;
                    updateDataArray(curGame, dataArray, winner)

                    resolve({
                        status: 200,
                        message: JSON.stringify({})
                    });
                } catch (err) { console.log(err.message); }
            })
            .on('error', (err) => { console.log(err.message); });
    });
};

exports.ranking = function (dataArray) {
    const top10 = dataArray.slice(0, 10);
    return { status: 200, message: JSON.stringify({ ranking: top10 }) };
};

exports.register = async function (req, dataArray) {
    return new Promise(resolve => {
        let body = '';
        req.on('data', (temp) => { body += temp; })
            .on('end', () => {
                try {
                    const { nick, password } = JSON.parse(body);
                    if (nick === undefined || password === undefined) {
                        resolve({
                            status: 401,
                            message: JSON.stringify({
                                error: 'User registered with a different password'
                            })
                        });
                    }

                    const validator = checkUser(nick, password, dataArray);
                    if (validator < 0) {
                        resolve({
                            status: 401,
                            message: JSON.stringify({
                                error: 'User registered with a different password'
                            })
                        });
                    } else if (validator) {
                        resolve({
                            status: 200,
                            message: JSON.stringify({})
                        });
                    } else {
                        const user = {
                            nick,
                            password,
                            wins: 0,
                            games: 0,
                        };
                        dataArray.push(user);
                        writeToFile(dataArray, './server/mancalaData.txt');

                        resolve({ status: 200, message: JSON.stringify({}) });
                    }
                } catch (err) { console.log(err.message); }
            })
            .on('error', (err) => { console.log(err.message); });
    });
};

exports.join = function (req, dataArray, currentGames, waitingList) {
    return new Promise(resolve => {
        let body = '';
        req.on('data', (temp) => { body += temp; })
            .on('end', () => {
                try {
                    let {
                        nick,
                        password,
                        size,
                        initial
                    } = JSON.parse(body);

                    nick = nick.toLowerCase();
                    if (isNaN(size) || size <= 0 || isNaN(initial) || initial < 0) {
                        resolve({
                            status: 401,
                            message: JSON.stringify({
                                error: 'Invalid game size'
                            })
                        });
                        return;
                    }

                    const validator = checkUser(nick, password, dataArray);
                    if (validator !== 1) {
                        resolve({
                            status: 401,
                            message: JSON.stringify({
                                error: 'User doesnt exists'
                            })
                        });
                        return;
                    }

                    //verify if player already in game
                    let playerWaiting = false, playerPlaying = false;


                    if (waitingList.length > 0)
                        playerWaiting = (waitingList.find((elem) => elem.nick === nick) !== undefined);
                    if (currentGames.length > 0)
                        playerPlaying = (currentGames.find((elem) => {
                            return (elem.player1 === nick || elem.player2 === nick);
                        }) !== undefined);

                    if (playerPlaying || playerWaiting) {
                        resolve({
                            status: 400,
                            message: JSON.stringify({ error: 'User already in game' })
                        });
                        return;
                    }

                    let [matched, game] = findMatch(waitingList, size, initial);

                    //found a game waiting for a player
                    if (matched) {
                        game.player2 = nick;
                        game.password2 = password;
                        currentGames.push(game);
                        resolve({
                            status: 200,
                            message: JSON.stringify({ game: game.hash })
                        });
                        return;
                    }

                    const hash = crypto
                        .createHash('md5')
                        .update(`${size}`)
                        .update(`${initial}`)
                        .update(`${(new Date()).getTime()}`)
                        .digest('hex');


                    waitingList.push({ hash, size, initial, nick, password, response1: null, playerturn: 1 });
                    resolve({
                        status: 200,
                        message: JSON.stringify({ game: hash })
                    });
                    return;
                } catch (err) {
                    console.log(err.message);
                }
            })
            .on('error', (err) => { console.log(err.message); });
    })
};

exports.remember = async function (params, res, waitingList, currentGames, dataArray) {
    /* Update handler foi definido */
    // Verifica se player está na waitingList -> se tiver substitui o player1.response por res
    // Else, Verifica se player está no currentGames -> se tiver substitui response do player em questão por res
    // Se ambos os players tiverem response !=== null, game começa e lança update
    return new Promise(async function (resolve) {
        try {
            const { nick, game } = params;
            const waitingGame = waitingList.find((elem) => elem.hash === game);

            if (waitingGame) {
                if (waitingGame.nick !== nick) {
                    resolve({ status: 401, error: 'Invalid nickname.' });
                    return;
                }

                if (waitingGame.timeoutID === undefined) {
                    const timeoutID = setTimeout(joiningTimeOut, 120000, res, waitingList, waitingGame);
                    waitingGame.timeoutID = timeoutID;
                }

                waitingGame.response1 = res;
                return;

            } else {
                const currentGame = currentGames.find((elem) => elem.hash === game);

                if (currentGame) {

                    //found a matching game join
                    //clear joining timeout
                    clearTimeout(currentGame.timeoutID);

                    if (currentGame.player2 === nick) {
                        currentGame.response2 = res;
                    } else if (currentGame.player1 === nick) {
                        currentGame.response1 = res;
                    } else {
                        resolve({ status: 400, error: 'Invalid nickname.' });
                        return;
                    }

                    resolve({ status: 200 });

                    setTimeout(() => { update(currentGame, undefined, undefined) }, 500);

                    //set playing timeout
                    currentGame.timeoutID = setTimeout(playingTimeOut, 120000, currentGame, dataArray, currentGames);
                    return;
                }
            }


            resolve({ status: 401, error: 'Invalid game reference.' });
            return;

        } catch (err) {
            console.log(err.message);
        }
    })

};

exports.forget = async function (params, waitingList, currentGames) {
    return new Promise(async function (resolve) {

        try {
            const { nick, game } = params;
            const waitingGame = waitingList.find((elem) => elem.hash === game);

            if (waitingGame) {
                if (waitingGame.nick !== nick) {
                    resolve({ status: 401, message: 'Invalid nickname.' });
                    return;
                }

                clearTimeout(waitingGame.timeoutID);
                resolve({ status: 200 });
                return;
            }

            const currentGame = currentGames.find((elem) => elem.hash === game);
            if (currentGame) {

                if (currentGame.player2 !== nick) {
                    resolve({ status: 401, message: 'Invalid nickname.' });
                    return;
                }
                resolve({ status: 200 });
                clearTimeout(currentGame.timeoutID);
                return;
            }

            resolve({ status: 401, message: 'Invalid game reference.' });
            return;

        } catch (err) {
            console.log(err.message);
        }
    })

};

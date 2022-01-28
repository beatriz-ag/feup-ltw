class Bot extends Player {
    constructor(level) {
        super(0, 'BOT');
        this.level = level;
    }

    botPlayingAwait() {
        return new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    verifyBadassMove(index, board, player) {
        if (!board.checkPlayerHole(player, index)) return 0;
        if (!board.checkNumberOfSeeds(index, 1)) return 0;

        const opponentIndex = index + board.getHoles() - (2 * (index - 1));
        const currPlayerSeeds = 1;
        const opponentSeeds = board.getHoleSeeds(opponentIndex);

        const totalSeeds = currPlayerSeeds + opponentSeeds;

        board.empty(index);
        board.empty(opponentIndex);

        return (!player) ? totalSeeds : totalSeeds * (-1);
    }

    moveSeeds(seeds, index, from, board, currentScore, player) {
        const maxHolesIndex = board.getHoles() + 2;

        index = index % maxHolesIndex;

        // Base case
        if (!seeds) {
            if (board.getPlayerStorage(player)) return [(!player) ? maxHolesIndex - 1 : index - 1, currentScore];
            else if (board.getPlayerStorage(!player)) return [(player) ? maxHolesIndex - 1 : index - 1, currentScore];
            return [index - 1, currentScore];
        }

        // Storage holes
        if (board.checkOpponentStorage(player, index)) return this.moveSeeds(seeds, index + 1, from, board, currentScore, player);
        if (board.checkPlayerStorage(player, index)) {
            currentScore += (!player) ? 1 : (-1);
        }

        board.increaseHoleSeeds(index);
        board.decreaseHoleSeeds(from, 1);

        return this.moveSeeds(seeds - 1, index + 1, from, board, currentScore, player);
    }

    executeMove(board, index, player) {
        const seeds = board.getHoleSeeds(index);

        let [finalPosition, score] = this.moveSeeds(seeds, index + 1, index, board, 0, player);

        if (!board.checkPlayerStorage(player, finalPosition)) {
            score += this.verifyBadassMove(finalPosition, board, player);
            player = (player + 1) % 2;
        }

        return [score, player];
    }
    
    chooseMove(board, depth, player) {
        let bestMove = -1;
        let bestScore = 0;
        const possibleMoves = board.getNonEmptyHoles(player);

        if (!possibleMoves.length) {
            const seeds = board.getSeedsPerHole();

            const botScore = seeds[0] + board.getAllSeeds(0);
            const playerScore = seeds[board.getPlayerStorage(1)] + board.getAllSeeds(1);

            if (botScore > playerScore) {
                return [bestMove, 999];
            } else if (botScore === playerScore) {
                return [bestMove, 0];
            } else {
                return [bestMove, -999];
            }
        }

        if (depth !== 0) {
            possibleMoves.forEach((possibleMove) => {
                const tempBoard = board.myClone(); //Board to use
                const [score, newPlayer] = this.executeMove(tempBoard, possibleMove, player); //Execute move
                const [move, newScore] = this.chooseMove(tempBoard, depth - 1, newPlayer); //Get the best move after this move
                if (bestMove === -1) {
                    bestMove = possibleMove;
                    bestScore = (score + newScore);
                } else if (bestScore < (score + newScore)) {
                    bestMove = possibleMove;
                    bestScore = (score + newScore);
                }
            });
        } else {
            possibleMoves.forEach((possibleMove) => {
                const tempBoard = board.myClone(); //Board to use
                const [score,] = this.executeMove(tempBoard, possibleMove, player); //Execute move
                if (bestMove === -1) {
                    bestMove = possibleMove;
                    bestScore = score;
                } else if (bestScore < score) {
                    bestMove = possibleMove;
                    bestScore = score;
                }
            });
        }
        return [bestMove, bestScore];
    }

    async play(board) {
        const newBoard = board.myClone();

        const [index,] = this.chooseMove(newBoard, this.level, 0);

        await this.botPlayingAwait();

        return index;
    }
}

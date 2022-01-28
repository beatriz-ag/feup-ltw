class Board {
    constructor(seeds, holes) {
        this.seeds = seeds;
        this.holes = holes;
        this.seedsPerHole = [];
        this.pointHoles = [0, 0];
        this.original = 1;
        this.seedColors = [
            ['rgba(231, 200, 37, 0.78)', '#808080', '#2f4f4f', '#dabc22', '#37706b'],
            ['rgba(200, 231, 37, 0.78)', '#656565', '#3fe211', '#cbadFF', '#12feaa'],
            ['rgba(231, 37, 200, 0.78)', '#505050', '#aaddef', '#ffffee', '#cceecc']
        ];
    }

    create() {
        const player0 = document.getElementsByClassName('player0')[0];
        while (player0.firstChild) player0.removeChild(player0.lastChild);
        const player1 = document.getElementsByClassName('player1')[0];
        while (player1.firstChild) player1.removeChild(player1.lastChild);

        this.seedsPerHole = Array(this.holes + 2).fill(this.seeds);

        const half = this.holes / 2;
        // Storage holes
        this.seedsPerHole[0] = 0;
        this.seedsPerHole[half + 1] = 0;

        const holesRow1 = document.getElementById('holes-row-1');
        const holesRow0 = document.getElementById('holes-row-0');
        while (holesRow1.firstChild) holesRow1.removeChild(holesRow1.firstChild);
        while (holesRow0.firstChild) holesRow0.removeChild(holesRow0.firstChild);
        player1.setAttribute('id', half + 1);

        let popup1 = document.createElement('div');
        popup1.textContent = 0;
        let point1 = document.createElement('div');
        popup1.className = 'popup';
        point1.className = 'point';
        popup1.append(point1);
        player1.append(popup1);

        let popup0 = document.createElement('div');
        popup0.textContent = 0;
        let point0 = document.createElement('div');
        popup0.className = 'popup';
        point0.className = 'point';
        popup0.append(point0);
        player0.append(popup0);

        for (var i = 1; i <= half; i++) {

            const hole1 = document.createElement('div');
            popup1 = document.createElement('div');
            popup1.textContent = parseInt(this.seeds);
            point1 = document.createElement('div');

            const hole0 = document.createElement('div');
            popup0 = document.createElement('div');
            popup0.textContent = parseInt(this.seeds);
            point0 = document.createElement('div');

            hole1.className = 'hole';
            popup1.className = 'popup';
            point1.className = 'point';

            hole0.className = 'hole';
            popup0.className = 'popup';
            point0.className = 'point';

            hole0.id = (this.holes - i) + 2;
            hole1.id = i;

            popup1.append(point1);
            hole1.append(popup1);
            popup0.append(point0);
            hole0.append(popup0);

            holesRow1.append(hole1);
            holesRow0.append(hole0);
        }

        this.createSeeds();

    }

    randomColor() {
        return Math.floor(Math.random() * this.seedColors.length);
    }

    randomDegree() {
        return Math.random() * 360;
    }

    randomOffset() {
        const x = Math.random() * 35 - 20;
        const y = Math.random() * 35 - 20;
        return [x, y];
    }

    createSeeds() {
        for (var i = 1; i < (this.holes + 2); i++) {

            if (i == this.holes / 2 + 1) continue;

            const hole = document.getElementById(i);

            for (var j = 0; j < this.seeds; j++) {
                let seed = document.createElement('div');
                seed.classList.add('seed');
                seed.id = `${i}-${j}`;

                const offset = this.randomOffset();
                seed.style.left = `${50 + offset[0]}%`;
                seed.style.top = `${50 + offset[1]}%`;

                const color = this.randomColor();
                seed.setAttribute('data-color', color);

                seed.style.background = `radial-gradient(circle at 30px, ${this.seedColors[0][color]}, #000)`;

                seed.style.transform = `rotate(${this.randomDegree()}deg)`;

                hole.append(seed);
            }
        }
    }

    setSeeds(value) {
        this.seeds = value;
    }

    setHoles(value) {
        this.holes = value;
    }

    updateSeeds(value) {
        this.seeds = parseInt(this.seeds) + parseInt(value);
    }

    getSeeds() {
        return this.seeds;
    }

    getPlayerStorage(player) {
        if (player) return this.holes / 2 + 1;
        return 0;
    }

    updateHoles(value) {
        this.holes = parseInt(this.holes) + value;
    }

    getHoles() {
        return this.holes;
    }

    getSeeds() {
        return this.seeds;
    }

    getHoleSeeds(index) {
        return this.seedsPerHole[index];
    }

    updateSeedsPerHole(index, value) {
        this.seedsPerHole[index] += value;
        if (this.original) document.getElementById(index).firstElementChild.firstChild.textContent = this.seedsPerHole[index];
    }

    increasePlayerSeeds(player, value) {
        this.pointHoles[player] += value;
        if (!player) this.updateSeedsPerHole(0, value);
        else this.updateSeedsPerHole(this.holes / 2 + 1, value);
    }

    getNonEmptyHoles(player) {
        let begin, end;
        const nonEmpty = [];
        if (player) {
            begin = 1;
            end = this.getPlayerStorage(player);
        } else {
            begin = this.getPlayerStorage(!player) + 1;
            end = this.holes + 2;
        }

        for (let i = begin; i < end; i++) {
            if (this.seedsPerHole[i]) nonEmpty.push(i);
        }
        return nonEmpty;
    }

    getAllSeeds(player) {
        const nonEmpty = this.getNonEmptyHoles(player);
        let res = 0;
        nonEmpty.forEach((hole) => {
            res += this.seedsPerHole[hole]
        })
        return res;
    }

    changePlayerHovers(player) {
        const turns = [document.getElementById('theirturn'), document.getElementById('yourturn')];
        turns[player].style.visibility = 'visible';
        turns[Math.abs(player - 1)].style.visibility = 'hidden';

        const previousPlayer = Math.abs((player - 1));


        const activeHoles = document.getElementById(`holes-row-${player}`).children;
        const deactiveHoles = document.getElementById(`holes-row-${previousPlayer}`).children;

        const nonEmptyHoles = this.getNonEmptyHoles(player);
        for (let hole of activeHoles) {
            if (nonEmptyHoles.includes(parseInt(hole.id))) hole.classList.add('active');
            else hole.classList.remove('active');
        }
        for (let hole of deactiveHoles) {
            hole.classList.remove('active');
        }

    }

    up() {
        const activeHoles = document.getElementById('holes-row-0').children;
        const deactiveHoles = document.getElementById('holes-row-1').children;

        const nonEmptyHoles = this.getNonEmptyHoles(player);
        for (let hole of activeHoles) {
            if (nonEmptyHoles.includes(parseInt(hole.id))) hole.classList.add('active');
            else hole.classList.remove('active');
        }
        for (let hole of deactiveHoles) {
            hole.classList.remove('active');
        }
    }

    down() {
        const activeHoles = document.getElementById('holes-row-1').children;
        const deactiveHoles = document.getElementById('holes-row-0').children;

        const nonEmptyHoles = this.getNonEmptyHoles(player);
        for (let hole of activeHoles) {
            if (nonEmptyHoles.includes(parseInt(hole.id))) hole.classList.add('active');
            else hole.classList.remove('active');
        }
        for (let hole of deactiveHoles) {
            hole.classList.remove('active');
        }
    }

    updateHovers(player) {
        const holes = document.getElementById(`holes-row-${player}`).children;

        const nonEmptyHoles = this.getNonEmptyHoles(player);
        for (let hole of holes) {
            if (nonEmptyHoles.includes(parseInt(hole.id))) hole.classList.add('active');
            else hole.classList.remove('active');
        }
    }

    // Clear hole
    empty(index) {
        this.decreaseHoleSeeds(index, this.seedsPerHole[index]);
    }

    checkNumberOfSeeds(index, number) {
        return this.seedsPerHole[index] === number;
    }

    checkPlayerStorage(player, index) {
        return (!player && !index) || (player && index === ((this.holes / 2) + 1));
    }

    checkOpponentStorage(player, index) {
        return (!player && index === ((this.holes / 2) + 1)) || (player && !index);
    }

    increaseHoleSeeds(index) {
        this.updateSeedsPerHole(index, 1);

        if (index === 0) {
            this.pointHoles[0]++;
        } else if (index === (this.holes / 2) + 1) {
            this.pointHoles[1]++;
        }

    }

    decreaseHoleSeeds(index, value) {
        this.updateSeedsPerHole(index, -value);
    }

    isInRange(x, point, range) {
        return (x <= point + range && x >= point - range);
    }

    equalPos(pos1, pos2) {
        return this.isInRange(pos1[0], pos2[0], 0.2) && this.isInRange(pos1[1], pos2[1], 0.2);
    }

    async animation(seed, holeTo) {

        const P4 = [holeTo.offsetLeft + (holeTo.style.width / 2), holeTo.offsetTop - (holeTo.style.height / 2)];

        let P1 = [seed.offsetLeft, seed.offsetTop];
        let t = 0;
        const R1 = [0, 1];
        const R4 = [0, -1];
        while (!this.equalPos(P1, P4)) {
            t += 0.1;
            seed.style.left = `${(2 * Math.pow(t, 3) - 3 * Math.pow(t, 2) + 1) * P1[0] + (-2 * Math.pow(t, 3) + 3 * Math.pow(t, 2)) * P4[0] + (Math.pow(t, 3) - 2 * Math.pow(t, 2) + t) * R1[0] + (Math.pow(t, 3) - Math.pow(t, 2)) * R4[0]}px`;
            seed.style.top = `${(2 * Math.pow(t, 3) - 3 * Math.pow(t, 2) + 1) * P1[1] + (-2 * Math.pow(t, 3) + 3 * Math.pow(t, 2)) * P4[1] + (Math.pow(t, 3) - 2 * Math.pow(t, 2) + t) * R1[1] + (Math.pow(t, 3) - Math.pow(t, 2)) * R4[1]}px`;
            P1 = [seed.offsetLeft, seed.offsetTop];
            await this.animationtime();
        }

        document.getElementById('game-board').removeChild(seed);

        holeTo.append(seed);

        const offset = this.randomOffset();
        seed.style.left = `${50 + offset[0]}%`;
        seed.style.top = `${50 + offset[1]}%`;

        await this.animationtime();
    }

    async moveSeeds(from, to, value) {
        const hole1 = document.getElementById(from);

        for (var i = 1; i <= value; i++) {
            const seed = hole1.getElementsByClassName('seed')[0];

            seed.style.transform = `rotate(${this.randomDegree()}deg)`;
            seed.style.left = '50%';
            seed.style.top = '50%';
            const previousPos = [seed.offsetLeft + hole1.offsetLeft, seed.offsetTop + hole1.offsetTop];

            hole1.removeChild(seed);
            document.getElementById('game-board').append(seed);

            seed.style.left = `${previousPos[0]}px`;
            seed.style.top = `${previousPos[1]}px`;

            const hole2 = document.getElementById(to);

            await this.animation(seed, hole2);
        }
    }

    animationtime() {
        return new Promise(resolve => setTimeout(resolve, 20));
    }

    checkPlayerHole(player, index) {
        const half = this.holes / 2;
        // Check the storage holes
        if (!index && index === half + 1) return false;
        // Check if the hole has seeds
        if (!this.seedsPerHole[index]) return false;
        // Player 0
        if (!player) return (index > (half + 1) && index <= (this.holes + 1));
        // Player 1
        return (index > 0 && index <= half);
    }

    myClone() {
        const result = new Board(this.seeds, this.holes);
        this.seedsPerHole.forEach((seed) => result.seedsPerHole.push(seed));
        result.pointHoles = [result.seedsPerHole[0], result.seedsPerHole[result.holes / 2 + 1]];
        result.original = 0;
        return result;
    }

    getSeedsPerHole() {
        return this.seedsPerHole;
    }

    setBoardColor(color) {
        document.getElementById('game-board').style.background = color;
    }

    setHolesColor(color) {
        const holes = document.getElementsByClassName('hole');
        const pointsHoles = document.getElementsByClassName('points-holes');
        pointsHoles[0].style.background = color;
        pointsHoles[1].style.background = color;
        for (let hole of holes) {
            hole.style.background = color;
        }
    }

    setSeedsColorSet(color) {
        const seeds = document.getElementsByClassName('seed');
        for (let seed of seeds) {
            const seedColor = this.seedColors[color][parseInt(seed.getAttribute('data-color'))];
            seed.style.background = `radial-gradient(circle at 30px, ${seedColor}, #000)`;
        }
    }

}

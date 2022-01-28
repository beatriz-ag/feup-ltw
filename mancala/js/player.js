class Player {
    constructor(id, name = '') {
        this.logged = name !== '';
        this.name = this.logged ? name : 'Player';
        this.points = 0;
        this.id = id;
    }

    setName(name) {
        if (name === '') return;
        this.logged = true;
        this.name = name;
    }

    getName() {
        return this.name;
    }

    getPoints() {
        return this.points;
    }

    increasePoints(value) {
        this.points += value;
        document.getElementsByClassName('game-scoreNumber')[Math.abs(this.id - 1)].innerHTML = this.points;
    }

    reset() {
        this.points = 0;
    }
}

export class GameElement {
    constructor(name, price) {
        this.name = name;
        this.price = price;
        this.hasSize = false;
        this.size = 0;
    }

    render() {
        throw new Error('Subclass must implement abstract method');
    }
}

export class Gpu extends GameElement {
    constructor(name, power, profitability, price, releaseDate) {
        super(name, price);
        this.power = power;
        this.profitability = profitability;
        this.releaseDate = releaseDate;
        this.hasSize = true;
        this.size = 1;
    }

    render() {
        return `
      <td>${this.name}</td>
      <td>${this.power}</td>
      <td>${this.profitability}</td>
      <td>${this.price}</td>
  `;
    }
}

export class PowerGenerator extends GameElement {
    constructor(name, power, price, size) {
        super(name, price);
        this.power = power;
        this.size = size;
        this.hasSize = true;
    }

    render() {
        return `
      <td>${this.name}</td>
      <td>${this.power}</td>
      <td>${this.size}</td>
      <td>${this.price}</td>
    `;
    }
}

export class Building extends GameElement {
    constructor(name, price, capacity) {
        super(name, price);
        this.capacity = capacity;
    }

    render() {
        return `
      <td>${this.name}</td>
      <td>${this.capacity}</td>
      <td>${this.price}</td>
    `;
    }
}
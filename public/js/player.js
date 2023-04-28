import { Gpu, Building, PowerGenerator } from './gameElements.js'

export class Player {
  constructor(startingMoney) {
    this.parts = [];
    this.powerElements = [];
    this.money = startingMoney;
    this.cryptoWallet = [];
    this.totalProfitability = 0;
    this.electricityCostPerDay = 0;
    this.totalHashrate = 0;
    this.buildings = [];
  }

  addPart(part) {
    this.getContainerForPart(part).push(part);
  }

  getMoney() {
    return this.money;
  }

  getCrypto(name) {
    const existingCrypto = this.cryptoWallet.find(crypto => crypto.name === name);

    if (existingCrypto) {
      return existingCrypto.amount;
    } else {
      console.log(`Error: no ${name} in wallet.`);
    }
  }

  getContainerForPart(part)
  {
    if(part instanceof Gpu) {
      return this.parts;
    }
    else if(part instanceof PowerGenerator) {
      return this.powerElements;
    }
    else if(part instanceof Building) {
      return this.buildings;
    }
  }

  addMoney(amount) {
    this.money += amount;
  }

  addCrypto(name, amount) {
    const existingCrypto = this.cryptoWallet.find(crypto => crypto.name === name);

    if (existingCrypto) {
      existingCrypto.amount += amount;
    } else {
      this.cryptoWallet.push({ name, amount });
    }
  }

  removeCrypto(name, amount) {
    const index = this.cryptoWallet.findIndex(crypto => crypto.name === name);
    if (index !== -1) {
      if (this.cryptoWallet[index].amount >= amount) {
        this.cryptoWallet[index].amount -= amount;
      } else {
        console.log(`Error: Insufficient ${name} in wallet.`);
      }
    } else {
      console.log(`Error: ${name} not found in wallet.`);
    }
  }

  getTotalCapacity() {
    return this.buildings.map(building => building.capacity).reduce((sum, cap) => sum + cap, 0);
  }

  getTotalSpaceUsed() {
    const spaceUsedByDevices = this.parts.length;
    const spaceUsedByPowerGenerators = this.powerElements.map(elem => elem.size).reduce((sum, size) => sum + size, 0);
    return spaceUsedByDevices + spaceUsedByPowerGenerators;
  }

  getTotalPower() {
    let totalPower = 0;
    this.parts.forEach(part => {
      if (part instanceof Gpu) {
        totalPower += part.power;
      }
    });
    return totalPower;
  }

  getTotalGeneratedPower() {
    return this.powerElements.reduce((acc, powerSource) => {
      return acc + powerSource.power;
    }, 0);
  }

  removePart(part) {
    let container = this.getContainerForPart(part);
    const index = container.indexOf(part);
    if (index > -1) {
      container.splice(index, 1); // Remove a part from the player's list of parts
    }
  }

  hasPart(part) {
    let container = this.getContainerForPart(part);
    return container.includes(part); // Check if the player has a specific part
  }

  hasEnoughMoney(price) {
    return this.money >= price; // Check if the player has enough money to buy a part
  }

  hasEnoughCapacity(partSize) {
    return ((this.getTotalSpaceUsed() + partSize) <= this.getTotalCapacity());
  }

  buyPart(part, price) {
    if (this.hasEnoughMoney(price)) {
      if(part.hasSize && this.hasEnoughCapacity(part.size)) {
        this.addPart(part);
        this.money -= price;
        return true;
      }
      else if(!part.hasSize) {
        this.addPart(part);
        this.money -= price;
        return true;
      }
      else {
        return false;
      }
    } else {
      return false;
    }
  }

  sellPart(part, price) {
    if (this.hasPart(part)) {
      this.removePart(part);c
      this.money += price;
      return true;
    } else {
      return false;
    }
  }

  sellOldDevices(availableDevices) {
    let partsToRemove = this.parts.filter(part => !availableDevices.find(device => device.name === part.name));
    partsToRemove.forEach(part => this.sellPart(part, part.price));
  }

  sellAll() {
    this.parts.forEach(part => this.addMoney(part.price));
    this.parts.splice(0, this.parts.length);
  }

  countItemsByName(collection, name) {
    let count = 0;
    for (let item of collection) {
      if (item.name === name) {
        count++;
      }
    }
    return count;
  }

  countGPUsByName(name) {
    return this.countItemsByName(this.parts, name);
  }

  countGeneratorsByName(name) {
    return this.countItemsByName(this.powerElements, name);
  }

  countBuildingsByName(name) {
    return this.countItemsByName(this.buildings, name);
  }
}
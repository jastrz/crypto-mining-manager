import { Player } from './player.js';
import { Gpu, Building, PowerGenerator } from './gameElements.js'
import { CryptoMarket, Cryptocurrency, BitcoinPriceTracker } from './market.js';
import { GameEvent, GameNews, GameEventManager } from './gameEventsManager.js';
import { GameView } from './gameView.js';
import { Tutorial, TimedTutorialEntry, TutorialEntry } from './tutorial.js'
import { TutorialEntries } from './tutorialEntries.js'
import { GameData } from './gameData.js';

export { GameView };

export class GameModel {
	constructor(gameData, player, gameEventManager, cryptoMarket) {
		this.gameData = gameData;
		this.player = player;
		this.gameEventManager = gameEventManager;
		this.cryptoMarket = cryptoMarket;
	}

	update() {
		this.cryptoMarket.update();
		this.gameEventManager.update();
		this.gameData.date.setDate(this.gameData.date.getDate() + 1);
	}

	simulate(time) {

	  const gpus = this.player.parts;
	  this.player.totalHashrate = gpus.reduce((acc, gpu) => {
	    return acc + gpu.profitability;
	  }, 0);

	  this.player.totalProfitability = 1000 * this.player.totalHashrate / this.gameData.difficulty;
	  const totalMined = this.player.totalProfitability * time;
	  this.player.addCrypto("BTC", totalMined);

	  let totalPowerUsage = gpus.reduce((acc, gpu) => {
	    return acc + gpu.power;
	  }, 0);

	  let totalPowerGenerated = this.player.getTotalGeneratedPower();
	  let powerDrawFromElectricNetwork = Math.max(totalPowerUsage - totalPowerGenerated, 0);

	  this.player.electricityCostPerDay = powerDrawFromElectricNetwork / 1000 * 24 * this.gameData.electricityCostPerKwh;
	  let electricityCost = this.player.electricityCostPerDay * time;
	  this.player.addMoney(-electricityCost);
	}

	async loadData(endpoint, gameView) {

	  const response = await fetch(endpoint);
	  const data = await response.json();

	  let gameData = this.gameData;

	  data.mining_devices.map(device => {
	    const [month, year] = device.release_date.split('/');
	    const releaseDate = new Date(year, month-1);
	    const deviceObj = new Gpu(device.name, device.power, device.hashrate, device.price, releaseDate);

	    this.gameEventManager.addEvent(new GameEvent("addDevice", releaseDate, () => {
	      gameData.setValue("addDevice", deviceObj);
	      gameView.renderPartsList(gameData.availableDevices, this.player);
	    }));

	    return deviceObj;
	  });

	  gameData.availableBuildings = data.buildings.map(building => new Building(building.name, building.price, building.capacity));
	  gameData.availablePowerSources = data.power_sources.map(powerSource => new PowerGenerator(powerSource.name, powerSource.power, powerSource.price, powerSource.size));
	}

	async fetchData(tracker, view) {
	  try {
	    await tracker.fetchData();
	    this.cryptoMarket.addCurrency(new Cryptocurrency("BTC", tracker.getNext(), tracker));
	    await this.gameEventManager.loadData("/events");
	    await this.loadData("/data", view);
	  } catch (error) {
	    console.error(error);
	  }
	}
}


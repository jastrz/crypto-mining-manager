import { Player } from './player.js';
import { CryptoMarket, Cryptocurrency, BitcoinPriceTracker } from './market.js';
import { GameEvent, GameNews, GameEventManager } from './gameEventsManager.js';
import { GameData } from './gameData.js';

import * as Engine from './game.js';

// Constants
const startingMoney = 110000;
const startDateString = '2013-01-01';
const startingElectricityCost = 0.1;
const startingDifficulty = 2222;
const marketName = "Bajnajs";
const currentDate = new Date(startDateString);

// Create game objects
const cryptoMarket = new CryptoMarket(marketName);
const player = new Player(startingMoney);
const gameData = new GameData(currentDate, startingElectricityCost, startingDifficulty);
const gameEventManager = new GameEventManager(gameData, []);

// Setup MVP
const gameView = new Engine.GameView();
const model = new Engine.GameModel(gameData, player, gameEventManager, cryptoMarket);
const game = new Engine.GamePresenter(model, gameView);

// Start the game
player.addCrypto("BTC", 0.01);
const btcTracker = new BitcoinPriceTracker(game.endGame.bind(game));
await game.run(btcTracker);
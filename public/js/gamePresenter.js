import {
    Player
} from './player.js';
import {
    Gpu,
    Building,
    PowerGenerator
} from './gameElements.js'
import {
    CryptoMarket,
    Cryptocurrency,
    BitcoinPriceTracker
} from './market.js';
import {
    GameEvent,
    GameNews,
    GameEventManager
} from './gameEventsManager.js';
import {
    GameView
} from './gameView.js';
import {
    Tutorial,
    TimedTutorialEntry,
    TutorialEntry
} from './tutorial.js'
import {
    TutorialEntries
} from './tutorialEntries.js'
import {
    GameModel
} from './gameModel.js'
import {
    GameData
} from './gameData.js';

export class GamePresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isRunning = false;
        this.isSimulationRunning = false;
        this.timeElapsed = 0;
        this.lastUpdateTime = 0;
        this.numDays = 0;
        this.simSpeed = 1;
        this.tutorial = new Tutorial(TutorialEntries.create(model.player, model.gameData, this));
    }

    async run(btcTracker) {
        await this.model.fetchData(btcTracker, this.view);
        this.start();
    }

    start() {
        this.isRunning = true;
        this.lastUpdateTime = Date.now();
        this.view.init(this.model.gameData, this.model.player, this.model.cryptoMarket, this);
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) {
            return;
        }

        const now = Date.now();
        const delta = (now - this.lastUpdateTime) / 1000;
        const adjustedDelta = delta * this.simSpeed;
        this.lastUpdateTime = now;

        if (this.isSimulationRunning) {
            this.timeElapsed += adjustedDelta;

            if (this.timeElapsed > this.numDays) {
                this.model.update();
                this.model.simulate(adjustedDelta);
                this.numDays++;
            }

            this.updateMarketPriceChart();
        }

        this.tutorial.update();
        this.handleNews();
        this.view.renderGame(this.getMainViewData(this.model.player, this.model.gameData));

        requestAnimationFrame(() => this.gameLoop());
    }

    handleNews() {
        if (this.model.gameData.news.length > 0) {
            this.view.renderNews(this.model.gameData.news);
            this.model.gameData.news = [];
        }
    }

    updateMarketPriceChart() {
        let btc = this.model.cryptoMarket.getCurrency("BTC");
        let priceHistory = btc.getPriceHistory();

        const labels = Array.from({
            length: priceHistory.length
        }, (_, i) => ' ');
        this.view.updatePriceChart(priceHistory, labels);
    }

    getMainViewData(player, gameData) {
        let gameViewData = {
            "Time": gameData.date.toLocaleDateString(),
            "BTC": player.getCrypto("BTC").toFixed(2) + " btc",
            "Money": player.getMoney().toFixed(0) + " $",
            "Total Hashrate": player.totalHashrate.toFixed(2) + " THs",
            "Profitability": player.totalProfitability.toFixed(4) + " btc/day",
            "Power balance": player.getTotalGeneratedPower() - player.getTotalPower() + "W",
            "Electricity Cost": player.electricityCostPerDay.toFixed(1) + " $/day",
            "Capacity": player.getTotalSpaceUsed() + " / " + player.getTotalCapacity()
        };

        return gameViewData;
    }

    resume() {
        this.lastTime = Date.now();
        this.isSimulationRunning = true;
    }

    stop() {
        this.isSimulationRunning = false;
    }

    endGame() {

        let player = this.model.player;
        let cryptoMarket = this.model.cryptoMarket;

        let dollars = player.getCrypto("BTC") * cryptoMarket.getPrice("BTC");
        player.addCrypto("BTC", -player.getCrypto("BTC"));
        player.addMoney(dollars);

        this.isRunning = false;
        var formData = new FormData();
        formData.set('name', localStorage.getItem('username'));
        formData.set('score', Math.floor(player.money));

        // Send an AJAX request to add the score to the database
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/highscores');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (xhr.status === 200) {
                // Reload the page to show the updated high scores
                alert('Game finished!');
                location.reload();
            } else {
                alert('Failed to add high score');
                window.location = '/';
            }
        };
        xhr.send(new URLSearchParams(formData));
    }
}
export class CryptoMarket {

	constructor(name) {
		this.name = name;
		this.currencies = [];
		this.history = [];
	}

	addCurrency(currency) {
		this.currencies.push(currency);
	}

	getCurrencies() {
		return this.currencies;
	}

	getPrice(currencyName) {
		const currency = this.currencies.find(crypto => crypto.getName() === currencyName);
		return currency.getPrice();
	}

	getCurrency(currencyName) {
		return this.currencies.find(crypto => crypto.getName() === currencyName);
	}

	exchangeCryptoToMoney(amount, currencyName) {
		let price = this.getPrice(currencyName);
		let total = price * amount;
		return total;
	}

	exchangeMoneyToCrypto(amount, currencyName) {
		let price = this.getPrice(currencyName);
		let total = amount / price;
		return total;
	}

	buyCrypto(amount, currencyName, player) {
    if(player.hasEnoughMoney(amount) && amount > 0) {
    	let cryptoAmount = amount / this.getPrice(currencyName);
    	player.addCrypto(currencyName, cryptoAmount);
    	player.addMoney(-amount);
    }
	}

	sellCrypto(amount, currencyName, player) {
		// let btcAmount = ratio * player.getCrypto(currencyName);
		if(player.getCrypto(currencyName) >= amount) {
	    let dollars = amount * this.getPrice(currencyName);
	    player.addCrypto(currencyName, -amount);
	    player.addMoney(dollars);
		}
	}

	update() {
		this.currencies.forEach((currency) => {
			currency.update();
		})
	}

	simulateNextPrice(volatility) {

		let currency = this.getCurrency("BTC");
		let price = currency.getPrice();

		// Simulate price change with random volatility
    const rand = Math.random();
    let change = rand * volatility * price;
    const direction = rand < 0.5 ? -1 : 1;
		change = direction * change;
		currency.setPrice(price + change);
	}

	generateData(startPrice, volatility) {
	  const data = [];
	  let price = startPrice;
	  
	  for (let i = 0; i < 52; i++) {

	    // Simulate price change with random volatility
	    const rand = Math.random();
	    const change = rand * volatility * price;
	    const direction = rand < 0.5 ? -1 : 1;
	    price += direction * change;
	    
	    // Round price to 2 decimal places
	    price = Math.round(price * 100) / 100;
	    
	    data.push(price);
	  }
	  
	  return data;
	}
}

export class Cryptocurrency {

  constructor(name, price, tracker) {
  	this.priceHistory = [];
    this.name = name;
    this.price = price;
    this.historySize = 100;
    this.tracker = tracker;
  }

  setPrice(price) {
  	this.price = price;
  	this.priceHistory.push(price);
  	if (this.priceHistory.length >= this.historySize) {
  		this.priceHistory = this.priceHistory.slice(1);
		}
  }

  update() {
  	this.setPrice(this.tracker.getNext());
  }

  getPrice() {
    return this.price;
  }

  getName() {
  	return this.name;
  }

  getPriceHistory() {
  	return this.priceHistory;
  }
}

export class BitcoinPriceTracker {
  constructor(trackerExpiredCallback) {
    this.history = [];
    this.currentDate = new Date(2013, 0, 1);
    this.index = 0;
    this.trackerExpiredCallback = trackerExpiredCallback;
  }

  async fetchData() {
    const startDate = this.currentDate.toISOString().slice(0, 10);
    const endDate = new Date().toISOString().slice(0, 10);
    const response = await fetch(`https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`);
    const data = await response.json();
    this.history = Object.entries(data.bpi).map(([date, price]) => ({ date, price }));
  }

  getNext() {
  	if(this.index < this.history.length) {
  		return this.history[this.index++].price;
  	}
  	else {
  		this.trackerExpiredCallback();
  		return 0;
  	}
  }
}
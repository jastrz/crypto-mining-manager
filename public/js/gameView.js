class ViewElement {
	constructor(name, element) {
		this.name = name;
		this.element = element;
	}

	setValue(value) {
		this.element.content.innerText = value;
	}
}

export class GameView {
	constructor() {

		this.newsContainer = document.getElementById('news-container');
		this.canvas = document.getElementById('myChart');
		this.mainViewContainer = document.getElementById('main-view-container');
		this.shopContainer = document.getElementById("game-elements");
		this.simSpeedElement = document.getElementById("sim-speed");
		this.currentlySelectedItem;
		this.mainViewElements = [];
		this.ratios = [.1, .25, .5, 1];
		this.buySellOptions = [1, 5, 25, 100];
		this.news = [];

		this.data = {
		  labels: [],
		  datasets: [{
		    label: 'btc/usd',
		    data: [],
		    backgroundColor: 'rgba(54, 162, 235, 0.2)',
		    borderColor: 'rgba(54, 162, 235, 1)',
		    borderWidth: 1
		  }]
		};

		this.options = {
		  scales: {
		    y: {
		      beginAtZero: false
		    }
		  }
		};

		this.btcPriceChart = new Chart(this.canvas, {
		  type: 'line',
		  data: this.data,
		  options: this.options
		});
	}

	init(gameData, player, cryptoMarket, game) {
		this.renderShopContent(gameData, player);
		this.initBuySellButtons(player, cryptoMarket, this.renderShopContent.bind(this, gameData, player), gameData);
		this.simSpeedElement.addEventListener('input', () => {
			game.simSpeed = parseFloat(this.simSpeedElement.value);
		});
	}

	renderShopContent(gameData, player) {
		this.renderPartsList(gameData.availableDevices, player);
  		this.renderPowerElements(gameData.availablePowerSources, player);
  		this.renderBuildingElements(gameData.availableBuildings, player);
	}

	updatePriceChart(prices, labels) {

	  this.btcPriceChart.data.datasets[0].data = prices;
	  this.btcPriceChart.data.labels = labels;
	  this.btcPriceChart.update();
	}

	initBuySellButtons(player, cryptoMarket, buySellActionCallback, gameData)
	{
		this.displayCryptoMarketButtons(
			"Buy", 
			(ratio) => { cryptoMarket.buyCrypto(player.getMoney() * ratio, "BTC", player); },
			...['is-primary', 'is-tiny']
		);

	 	this.displayCryptoMarketButtons(
	 		"Sell",
				(ratio) => { cryptoMarket.sellCrypto(player.getCrypto("BTC") * ratio, "BTC", player); }, 
				...['is-danger', 'is-tiny']
		);

		this.displayShopButtons("Buy", player.buyPart.bind(player), this.buySellOptions, 'is-primary', buySellActionCallback);
		this.displayShopButtons("Sell", player.sellPart.bind(player), this.buySellOptions, 'is-danger', buySellActionCallback);
		this.displayUtilityShopButtons(player, gameData, buySellActionCallback);
	}

	buyPart(player, selectedItem)
	{
		player.buyPart(selectedItem.part, selectedItem.price);
	}

	renderElements(elements, propertyList, tableName, countFunction) {
		let rows = elements
			.map(element => propertyList.map(property => element[property]));

		rows.forEach(row => {
			const name=row[0];
			const count = countFunction(name);
			row[row.length - 1] = count;
		});
	}

	renderGame(gameViewData) {

		for(const key in gameViewData) {
			const elementName = key;
			const elementValue = gameViewData[key];

			const existingElement = this.mainViewElements.find((el) => el.name === elementName)

			if(existingElement) {
				existingElement.setValue(elementValue);
			} else {
				const element = this.createMainViewElement(
					elementName, 
					elementValue, 
					`${elementName}-indicator`, 
					this.mainViewContainer
				);

				this.mainViewElements.push(new ViewElement(elementName, element));
			}
		}
	}

	createMainViewElement(title, content, id, holder) {
		const row = document.createElement('tr');
		row.id = id;
		const entryName = document.createElement('th');
		entryName.innerText = title;
		const entryContent = document.createElement('td');
		entryContent.innerText = content;
		row.appendChild(entryName);
		row.appendChild(entryContent);
		holder.appendChild(row);

		return { container: row, content: entryContent };
	}

	createButton(text, classList, onClick) {
		const btn = document.createElement('button');
		btn.classList.add(...classList);
		btn.textContent = text;
		btn.addEventListener('click', onClick);
		return btn;
	}

	getShopControlRow(parent) {
		const table = document.getElementById(parent); 
		const tableBody = table.querySelector('tbody');
		const tableRow = document.createElement('tr');
		const entryName = document.createElement('th');
		const entryContent = document.createElement('th');

		tableRow.appendChild(entryName);
		tableRow.appendChild(entryContent);
		tableBody.appendChild(tableRow);

		return { name: entryName, content: entryContent };
	}

	renderList(partsList, tableId, countFunction, buyFunction, sellFunction) {

	  const tableBody = document.querySelector(`#${tableId} tbody`);
	  tableBody.innerHTML = '';

	  partsList.forEach(part => {

	    const partRow = document.createElement('tr');
	    partRow.classList.add("is-small", "has-text-left");

	    partRow.addEventListener('click', () => {
	  		this.selectItem(new SelectedItem(partRow, part));
		});

		if(this.currentlySelectedItem && this.currentlySelectedItem.part === part) {
			this.selectItem(new SelectedItem(partRow, part));
		}
	    partRow.innerHTML = part.render() + `<td>${countFunction(part.name)}</td>`;
	    tableBody.appendChild(partRow);
	  });
	}

	selectItem(item) {

		if(this.currentlySelectedItem) {
			this.currentlySelectedItem.element.classList.remove('is-selected');
		}

		item.element.classList.add('is-selected');
		this.currentlySelectedItem = item;
	}

	renderPartsList(partsList, player) {

	  this.renderList(
	    partsList,
	    'parts-table', 
	    player.countGPUsByName.bind(player), 
	    player.buyPart.bind(player), 
	    player.sellPart.bind(player)
	  );
	}

	renderPowerElements(partsList, player) {

	  this.renderList(
	    partsList, 
	    'power-elements-table', 
	    player.countGeneratorsByName.bind(player), 
	    player.buyPart.bind(player), 
	    player.sellPart.bind(player)
	  );
	}

	renderBuildingElements(partsList, player) {

	  this.renderList(
	    partsList, 
	    'building-elements-table', 
	    player.countBuildingsByName.bind(player), 
	    player.buyPart.bind(player), 
	    player.sellPart.bind(player)
	  );
	}

	renderNews(newsArray) {
		this.renderGameNews(newsArray, this.newsContainer);
	}

	renderGameNews(newsArray, targetElement) {

	  // targetElement.innerText = "";
	  for (let i = 0; i < newsArray.length; i++) {

	    const newsDiv = document.createElement('div');
	    newsDiv.classList.add("card");
	    newsDiv.classList.add("mb-3");
	    newsDiv.classList.add("animate__animated");
	    newsDiv.classList.add("animate__slideInLeft");

	    const title = document.createElement('div');
	    title.classList.add('card-header');
	    const titleContent = document.createElement('p');
	    titleContent.classList.add('card-header-title');
	    titleContent.textContent = newsArray[i].title;
	    title.appendChild(titleContent);
	    newsDiv.appendChild(title);

	    const content = document.createElement('div');
	    content.classList.add('card-content');
	    const header = document.createElement('div');
	    header.classList.add('content');
	    const text = document.createElement('div');
	    text.classList.add('content');
	    text.classList.add('has-text-left');
	    text.textContent = newsArray[i].text;
	    content.appendChild(text);
	    newsDiv.appendChild(content);
	    targetElement.prepend(newsDiv);
	    this.news.push(newsDiv);

	    if(this.news.length > 3) {
	    	const elementToRemove = this.news[0];
	    	targetElement.removeChild(elementToRemove);
	    	this.news.splice(0, 1);
	    }
	  }
	}

	displayShopButtons(rowName, onClick, options, buttonClass, buySellActionCallback)
	{
	  const shopControlRow = this.getShopControlRow('shop-control');
	  
	  shopControlRow.name.innerText = rowName;
	  options.forEach((option) => {

	  	const button = this.createButton(
	  		`${option}x`, 
	  		['button', 'is-small', 'is-rounded', 'is-light', buttonClass], 
	  		() => {
				for(let i=0; i<option; i++) {
					onClick(this.currentlySelectedItem.part, this.currentlySelectedItem.part.price);
				}
				buySellActionCallback();
  		});

	  	shopControlRow.content.appendChild(button);
	  });
	}

	displayCryptoMarketButtons(name, onClick, ...buttonClasses) {
		const shopControlRow = this.getShopControlRow('crypto-market');
		shopControlRow.name.innerText = name;	
		const classes = ['button', 'is-small', 'is-light', 'is-rounded', 'mb-2', ...buttonClasses];

		this.ratios.forEach(ratio => {
			const btn = this.createButton(
			  `${ratio}x`, 
			  classes, 
			  () => { onClick(ratio); }
			);
			shopControlRow.content.appendChild(btn);
		});
	}

	displayUtilityShopButtons(player, gameData, buySellActionCallback) {
		let shopControlRow = this.getShopControlRow('shop-control');
		const sellOldbtn = this.createButton(
			"Sell old", 
			['button', 'is-small', 'is-rounded', 'is-danger'], 
			() => {
				player.sellOldDevices(gameData.availableDevices);
				buySellActionCallback();
			}
		);

		const sellAllbtn = this.createButton(
			"Sell all", 
			['button', 'is-small', 'is-rounded', 'is-danger'], 
			() => {
			player.sellAll();
			buySellActionCallback();
		});

		shopControlRow.content.appendChild(sellOldbtn);
		shopControlRow.content.appendChild(sellAllbtn);
	}
}

class SelectedItem {
	constructor(element, item) {
		this.element = element;
		this.part = item;
	}
}
import {
    GameData
} from './gameData.js'

export class GameEventManager {
    constructor(gameData, events) {
        this.gameData = gameData;
        this.events = events;
    }

    addEvent(event) {
        this.events.push(event);
    }

    removeEvent(event) {
        const index = this.events.indexOf(event);
        if (index !== -1) {
            this.events.splice(index, 1);
        }
    }

    update() {
        let consumedEvents = [];

        for (const event of this.events) {
            if (event.startDate <= this.gameData.date) {
                event.apply();
                consumedEvents.push(event);
            }
        }
        consumedEvents.forEach((event) => this.removeEvent(event));
    }

    async loadData(endpoint) {
        const response = await fetch(endpoint);
        console.log(response);
        const eventObjects = await response.json();

        // create GameEvent objects from the event data and add them to the events array
        eventObjects.events.forEach(event => {
            let applyFunction = () => {
                this.gameData.setValue(event.name, event.data)
            };
            const gameEvent = new GameEvent(event.name, new Date(event.startDate), applyFunction);
            this.events.push(gameEvent);

            if (event.news) {
                let newsApplyFunction = () => {
                    this.gameData.setValue("AddNews", event.news)
                };
                const newsEvent = new GameEvent(event.name, new Date(event.startDate), newsApplyFunction);
                this.events.push(newsEvent);
            }
        });
    }
}

export class GameNews {
    constructor(title, text) {
        this.title = title;
        this.text = text;
    }
}

export class GameEvent {
    constructor(name, startDate, applyFunction) {
        this.name = name;
        this.startDate = startDate;
        this.applyFunction = applyFunction;
    }

    apply() {
        this.applyFunction();
    }
}
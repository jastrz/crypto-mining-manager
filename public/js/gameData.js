import {
    GameNews
} from './gameEventsManager.js'

export class GameData {
    constructor(date, electricityCost, difficulty) {
        this.date = date;
        this.availableDevices = [];
        this.availablePowerSources = [];
        this.availableBuildings = [];
        this.difficulty = difficulty;
        this.electricityCostPerKwh = electricityCost;
        this.news = [];
    }

    setValue(dataType, value) {
        switch (dataType) {
            case 'addDevice':
                this.addDevice(value);
                this.news.push(new GameNews("New device!", `${value.name} has just been released!`));
                break;
            case 'availablePowerSources':
                this.availablePowerSources = value;
                break;
            case 'availableBuildings':
                this.availableBuildings = value;
                break;
            case 'SetDifficulty':
                this.difficulty = value;
                break;
            case 'SetElectricityCost':
                this.electricityCostPerKwh = value;
                break;
            case 'AddNews':
                let news = new GameNews(value.title, value.text);
                this.news.push(news);
                break;
            default:
                console.log('Invalid data type');
        }
    }

    addDevice(device) {
        console.log(`Gpu Added: ${device.name}`);
        this.availableDevices.push(device);
        if (this.availableDevices.length > 5) {
            this.availableDevices = this.availableDevices.slice(1);
        }
    }
}
import { Tutorial, TimedTutorialEntry, TutorialEntry } from './tutorial.js';
import { GameNews } from './gameEventsManager.js';

export class TutorialEntries {
  static create(player, gameData, game) {
    const tutorialEntries = [ 
      new TimedTutorialEntry(
        5,
        () => gameData.news.push(new GameNews(`Hello ${localStorage.getItem('username')}!`, "It is a BTC mining simulator game! Start with buying an apartment, device and power generator. Watch out to not become bankrupt! ;)"))
      ),
      new TutorialEntry(
        playerHasAtLeastOneBuilding,
        () => gameData.news.push(new GameNews("You need capacity for stuff!", "Buy an apartment by selecting an entry in buildings view, then in the top shop view click '1x' in BUY menu"))
      ),
      new TutorialEntry(
        playerHasAtLeastOnePowerGenerator,
        () => gameData.news.push(new GameNews("You need power device", "You don't want to overpay for electricity ;). Buy power generator of Your choice!")),
      ),
      new TimedTutorialEntry(
        3,
        () => gameData.news.push(new GameNews("You can start mining!", "A new mining device will be released in a second. Buy it!")),
        () => game.resume()
      )
    ];

    function playerHasAtLeastOneBuilding() {
      return player.buildings.length > 0;
    }

    function playerHasAtLeastOnePowerGenerator() {
      return player.powerElements.length > 0;
    }

    return tutorialEntries;
  }
}
import { GameMap, Location } from "./map";

export class Dracula {
  blood: number;
  currentLocation: Location

  constructor(gameMap: GameMap) {
    this.blood = 15;
    this.chooseStartLocation(gameMap);
  }

  chooseStartLocation(gameMap: GameMap): Location {
    this.currentLocation = gameMap.locations[Math.floor(Math.random()*gameMap.locations.length)];
    return this.currentLocation;
  }

  die(): number {
    this.blood = Math.max(0, Math.floor((this.blood - 1) / 5) * 5);
    return this.blood;
  }
}
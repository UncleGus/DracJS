import { Location, LocationType } from "./map";
import { Game } from "./game";
import { Encounter } from "./encounter";

export class Dracula {
  blood: number;
  currentLocation: Location;
  revealed: boolean;
  trail: TrailCard[];
  encounterHand: Encounter[];
  encounterHandSize: number;

  constructor() {
    this.blood = 15;
    this.revealed = false;
    this.trail = [];
    this.encounterHandSize = 5;
    this.encounterHand = [];
  }

  setLocation(newLocation: Location): string {
    this.revealed = true;
    this.currentLocation = newLocation;
    this.pushToTrail({ revealed: false, location: newLocation, encounter: this.selectEncounterFromHand()});
    return this.revealed ? `Dracula moved to ${this.currentLocation.name}` : 'Dracula moved to a hidden location';
  }
  
  chooseStartLocation(gameState: Game): Location {
    const validLocations = gameState.map.locations.filter(location => location.type == LocationType.smallCity || location.type == LocationType.largeCity);
    const distances = validLocations.map(location => {
      return Math.min(
        gameState.map.distanceBetweenLocations(location, gameState.godalming.currentLocation),
        gameState.map.distanceBetweenLocations(location, gameState.seward.currentLocation),
        gameState.map.distanceBetweenLocations(location, gameState.vanHelsing.currentLocation),
        gameState.map.distanceBetweenLocations(location, gameState.mina.currentLocation)
      );      
    });
    const furthestDistance = distances.reduce((prev, curr) => curr > prev ? curr : prev, 0);
    const furthestDistanceIndices = [];
    for (let i = 0; i < distances.length; i++) {
      if (distances[i] == furthestDistance) {
        furthestDistanceIndices.push(i);
      }
    }
    const randomChoice = Math.floor(Math.random()*furthestDistanceIndices.length);
    const randomIndex = furthestDistanceIndices[randomChoice];
    return validLocations[randomIndex];
  }

  die(): string {
    return `Dracula was dealt a mortal blow\n${this.setBlood(Math.floor((this.blood - 1) / 5) * 5)}`;
  }

  setBlood(newBlood: number): string {
    this.blood = Math.max(0, Math.min(newBlood, 15));
    return `Dracula is now on ${this.blood} blood`;
  }

  pushToTrail(newTrailCard: TrailCard): TrailCard {
    this.trail = [newTrailCard].concat(this.trail)
    return this.trail.length == 7 ? this.trail.splice(-1)[0] : null;
  }

  drawUpEncounters(encounterPool: Encounter[]): string {
    let drawCount = 0;
    while (this.encounterHand.length < this.encounterHandSize) {
      this.encounterHand.push(encounterPool.pop());
      drawCount++;
    }
    return `Dracula drew ${drawCount} encounters`;
  }

  selectEncounterFromHand(): Encounter {
    const randomChoice = Math.floor(Math.random()*this.encounterHand.length);
    return this.encounterHand.splice(randomChoice, 1)[0];
  }
}

interface TrailCard {
  revealed: boolean;
  location: Location;
  encounter: Encounter;
}
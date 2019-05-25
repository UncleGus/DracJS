import { Location, LocationType } from "./map";
import { Game } from "./game";
import { Encounter } from "./encounter";
import * as _ from 'lodash';

export class Dracula {
  blood: number;
  currentLocation: Location;
  revealed: boolean;
  trail: TrailCard[];
  encounterHand: Encounter[];
  encounterHandSize: number;
  droppedOffEncounter: Encounter;
  seaBloodPaid: boolean;

  constructor() {
    this.blood = 15;
    this.revealed = false;
    this.trail = [];
    this.encounterHandSize = 5;
    this.encounterHand = [];
    this.seaBloodPaid = false;
  }

  setLocation(newLocation: Location): string {
    this.revealed = false;
    this.currentLocation = newLocation;
    if (this.currentLocation.type == LocationType.castle) {
      this.revealed = true;
    }
    console.log(`Dracula moved to ${this.currentLocation.name}`);
    return this.revealed ? `Dracula moved to ${this.currentLocation.name}` : 'Dracula moved to a hidden location';
  }
  
  chooseStartLocation(gameState: Game): Location {
    // TODO: improve logic
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

  chooseNextLocation(gameState: Game): Location {
    // TODO: make logical decision 
    // TODO: catacombs cards are also invalid
    const connectedLocationNames = _.union(this.currentLocation.roadConnections, this.currentLocation.seaConnections);
    console.log('Connected locations are:');
    console.log(connectedLocationNames);
    const connectedLocations = connectedLocationNames.map(name => gameState.map.getLocationByName(name));
    const invalidLocations = this.trail.map(trail => trail.location);

    if (this.blood == 1 && (this.currentLocation.type !== LocationType.sea || (this.currentLocation.type == LocationType.sea && !this.seaBloodPaid))) {
      invalidLocations.concat(connectedLocations.filter(location => location.type == LocationType.sea));
    }
    console.log('Invalid locations are:');
    console.log(invalidLocations.map(location => location.name));
    const validLocations = _.without(connectedLocations, ...invalidLocations, gameState.map.locations.find(location => location.type == LocationType.hospital));
    console.log('Valid locations are:');
    console.log(validLocations.map(location => location.name));
    const randomChoice = Math.floor(Math.random()*validLocations.length);
    return validLocations[randomChoice];
  }

  chooseEncounter(): Encounter {
    // TODO: make logical decision
    // TODO: either include logic for catacombs choice here or make a second function for that case
    const randomChoice = Math.floor(Math.random()*this.encounterHand.length);
    return this.encounterHand.splice(randomChoice, 1)[0];
  }

  die(): string {
    return `Dracula was dealt a mortal blow\n${this.setBlood(Math.floor((this.blood - 1) / 5) * 5)}`;
  }

  setBlood(newBlood: number): string {
    // TODO: handle Dracula loss condition
    this.blood = Math.max(0, Math.min(newBlood, 15));
    return `Dracula is now on ${this.blood} blood`;
  }

  pushToTrail(newTrailCard: TrailCard): string {
    this.trail.unshift(newTrailCard);
    return 'Dracula added a card to the trail';
  }

  drawUpEncounters(encounterPool: Encounter[]): string {
    let drawCount = 0;
    while (this.encounterHand.length < this.encounterHandSize) {
      this.encounterHand.push(encounterPool.pop());
      drawCount++;
    }
    return `Dracula drew ${drawCount} encounters`;
  }

  decideFateOfDroppedOffCard(gameState: Game): string {
    // TODO: make logical decision
    // TODO: consider power cards, catacombs only applies to locations
    if (Math.random() < 0.2 && gameState.catacombs.length < 3) {
      this.trail[6].encounters.push(this.chooseEncounter());
      gameState.catacombs.push(this.trail.pop());
      return 'Dracula moved the card to the catacombs with an additional encounter on it'
    }
    this.droppedOffEncounter = this.trail[6].encounters[0];
    this.trail.pop();
    return 'Dracula returned the dropped off card to the Location deck';
  }
}

export interface TrailCard {
  revealed: boolean;
  location: Location;
  encounters: Encounter[];
}
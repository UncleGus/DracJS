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
  debugMode: boolean;

  constructor() {
    this.blood = 15;
    this.revealed = false;
    this.trail = [];
    this.encounterHandSize = 5;
    this.encounterHand = [];
    this.seaBloodPaid = false;
    this.debugMode = true;
  }

  setLocation(newLocation: Location): string {
    this.currentLocation = newLocation;
    this.debug(`Dracula moved to ${this.currentLocation.name}`);
    return this.revealed ? `Dracula moved to ${this.currentLocation.name}` : 'Dracula moved to a hidden location';
  }
  
  chooseStartLocation(gameState: Game): Location {
    // TODO: improve logic
    const validLocations = gameState.map.locations.filter(location => location.type == LocationType.smallCity || location.type == LocationType.largeCity);
    this.debug(`Valid locations are: ${validLocations.map(location => location.name)}`);
    const distances = validLocations.map(location => {
      return Math.min(
        gameState.map.distanceBetweenLocations(location, gameState.godalming.currentLocation),
        gameState.map.distanceBetweenLocations(location, gameState.seward.currentLocation),
        gameState.map.distanceBetweenLocations(location, gameState.vanHelsing.currentLocation),
        gameState.map.distanceBetweenLocations(location, gameState.mina.currentLocation)
      );      
    });
    this.debug(`Distances are: ${distances.toString()}`);
    const furthestDistance = distances.reduce((prev, curr) => curr > prev ? curr : prev, 0);
    this.debug(`Furthest distance is ${furthestDistance}`);
    const furthestDistanceIndices = [];
    for (let i = 0; i < distances.length; i++) {
      if (distances[i] == furthestDistance) {
        furthestDistanceIndices.push(i);
      }
    }
    this.debug(`Locations at furthest distance are at indices; ${furthestDistanceIndices.toString()}`);
    const randomChoice = Math.floor(Math.random()*furthestDistanceIndices.length);
    const randomIndex = furthestDistanceIndices[randomChoice];
    this.debug(`Choosing ${validLocations[randomIndex].name}`);
    return validLocations[randomIndex];
  }

  chooseNextLocation(gameState: Game): Location {
    // TODO: make logical decision 
    const connectedLocationNames = _.union(this.currentLocation.roadConnections, this.currentLocation.seaConnections);
    this.debug(`Connected locations are: ${connectedLocationNames.toString()}`);
    const connectedLocations = connectedLocationNames.map(name => gameState.map.getLocationByName(name));
    const invalidLocations = this.trail.map(trail => trail.location).concat(gameState.catacombs.map(catacomb => catacomb.location));

    if (this.blood == 1 && (this.currentLocation.type !== LocationType.sea || (this.currentLocation.type == LocationType.sea && !this.seaBloodPaid))) {
      invalidLocations.concat(connectedLocations.filter(location => location.type == LocationType.sea));
    }
    this.debug(`Invalid locations are: ${invalidLocations.map(location => location.name).toString()}`);
    const validLocations = _.without(connectedLocations, ...invalidLocations, gameState.map.locations.find(location => location.type == LocationType.hospital));
    this.debug(`Valid locations are: ${validLocations.map(location => location.name).toString()}`);
    if (validLocations.length == 0) {
      return null;
    }
    const randomChoice = Math.floor(Math.random()*validLocations.length);
    this.debug(`Choosing ${validLocations[randomChoice].name}`);
    return validLocations[randomChoice];
  }

  chooseEncounter(): Encounter {
    // TODO: make logical decision
    // TODO: either include logic for catacombs choice here or make a second function for that case
    const randomChoice = Math.floor(Math.random()*this.encounterHand.length);
    this.debug(`Choosing ${this.encounterHand[randomChoice].name}`);
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
      this.debug(`Dracula drew encounter ${this.encounterHand[this.encounterHand.length -1].name}`);
      drawCount++;
    }
    return `Dracula drew ${drawCount} encounters`;
  }

  decideFateOfDroppedOffCard(gameState: Game): string {
    // TODO: make logical decision
    // TODO: consider power cards, catacombs only applies to locations
    if (Math.random() < 0.2 && gameState.catacombs.length < 3 && this.trail[6].location.type !== LocationType.sea) {
      gameState.catacombEncounters.push(this.chooseEncounter());
      this.debug(`Card added to catacombs: ${this.trail[6].location.name} with ${this.trail[6].encounter ? this.trail[6].encounter.name: '__'} and ${gameState.catacombEncounters[gameState.catacombEncounters.length -1].name}`);
      gameState.catacombs.push(this.trail.pop());
      return 'Dracula moved the card to the catacombs with an additional encounter on it'
    }
    this.debug(`Card returned to deck: ${this.trail[6].location.name}`);
    this.droppedOffEncounter = this.trail[6].encounter;
    if (this.droppedOffEncounter) {
      this.debug(`Encounter ${this.droppedOffEncounter.name} to be dealt with later`);
    }
    this.trail.pop();
    return 'Dracula returned the dropped off card to the Location deck';
  }

  evaluateCatacombs(gameState: Game): string {
    // TODO: make logical decision
    let logMessage = '';
    for (let i = gameState.catacombs.length -1; i >= 0 ; i--) {
      if (Math.random() < 0.2) {
        this.debug(`Discarding catacomb ${gameState.catacombs[i].location.name} with ${gameState.catacombEncounters[i].name}`);
        logMessage += logMessage ? ` and position ${i + 1}` : `Dracula discarded catacomb card from position ${i + 1}`;
        gameState.encounterPool.push(gameState.catacombEncounters.splice(i, 1)[0]);
        if (gameState.catacombs[i].encounter) {
          gameState.encounterPool.push(gameState.catacombs[i].encounter);
          this.debug(` and ${gameState.catacombs[i].encounter.name}`);
        }
        gameState.catacombs.splice(i, 1);
        gameState.shuffleEncounters();
      }
    }
    return logMessage;
  }

  clearTrail(gameState: Game, remainingCards: number): string {
    let cardsCleared = 0;
    let encountersCleared = 0;
    while (this.trail.length > remainingCards) {
      const cardToClear = this.trail.pop();
      cardsCleared++;
      this.debug(`Returning ${cardToClear.location.name} to the Location deck`);
      if (cardToClear.encounter) {
        this.debug(`Returning ${cardToClear.encounter.name} to the encounter pool`);
        encountersCleared++;
        gameState.encounterPool.push(cardToClear.encounter);
        gameState.shuffleEncounters();
      }
    }
    return `Returned ${cardsCleared} cards and ${encountersCleared} encounters`;
  }

  debug(message: string) {
    if (this.debugMode) {
      console.log(message);
    }
  }
}

export interface TrailCard {
  revealed: boolean;
  location: Location;
  encounter: Encounter;
}
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
  nextMove: PossibleMove;
  powers: Power[];
  hideLocation: Location;

  constructor() {
    this.blood = 15;
    this.revealed = false;
    this.trail = [];
    this.encounterHandSize = 5;
    this.encounterHand = [];
    this.seaBloodPaid = false;
    this.powers = [
      {
        name: PowerName.darkCall,
        nightOnly: true,
        cost: 2
      },
      {
        name: PowerName.doubleBack,
        nightOnly: false,
        cost: 0
      },
      {
        name: PowerName.feed,
        nightOnly: true,
        cost: -1
      },
      {
        name: PowerName.hide,
        nightOnly: false,
        cost: 0
      },
      {
        name: PowerName.wolfForm,
        nightOnly: true,
        cost: 1
      },
      {
        name: PowerName.wolfFormAndDoubleBack,
        nightOnly: true,
        cost: 1
      },
      {
        name: PowerName.wolfFormAndHide,
        nightOnly: true,
        cost: 1
      },
    ];
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
    // this.debug(`Valid locations are: ${validLocations.map(location => location.name)}`);
    const distances = validLocations.map(location => {
      return Math.min(
        gameState.map.distanceBetweenLocations(location, gameState.godalming.currentLocation),
        gameState.map.distanceBetweenLocations(location, gameState.seward.currentLocation),
        gameState.map.distanceBetweenLocations(location, gameState.vanHelsing.currentLocation),
        gameState.map.distanceBetweenLocations(location, gameState.mina.currentLocation)
      );      
    });
    // this.debug(`Distances are: ${distances.toString()}`);
    const furthestDistance = distances.reduce((prev, curr) => curr > prev ? curr : prev, 0);
    // this.debug(`Furthest distance is ${furthestDistance}`);
    const furthestDistanceIndices = [];
    for (let i = 0; i < distances.length; i++) {
      if (distances[i] == furthestDistance) {
        furthestDistanceIndices.push(i);
      }
    }
    // this.debug(`Locations at furthest distance are at indices; ${furthestDistanceIndices.toString()}`);
    const randomChoice = Math.floor(Math.random()*furthestDistanceIndices.length);
    const randomIndex = furthestDistanceIndices[randomChoice];
    // this.debug(`Choosing ${validLocations[randomIndex].name}`);
    return validLocations[randomIndex];
  }

  
  chooseNextMove(gameState: Game): string {
    // TODO: make logical decision
    // TODO: handle discarding catacombs to allow movement there if not using double back
    this.nextMove = null;
    const possibleMoves: PossibleMove[] = [];
    const connectedLocationNames = _.union(this.currentLocation.roadConnections, this.currentLocation.seaConnections);
    // this.debug(`Connected locations are: ${connectedLocationNames.toString()}`);
    const connectedLocations = connectedLocationNames.map(name => gameState.map.getLocationByName(name));
    const invalidLocations = this.trail.filter(trail => trail.location).map(trail => trail.location);
    if (this.blood == 1 && (this.currentLocation.type !== LocationType.sea || (this.currentLocation.type == LocationType.sea && !this.seaBloodPaid))) {
      invalidLocations.concat(connectedLocations.filter(location => location.type == LocationType.sea));
    }
    // this.debug(`Invalid locations are: ${invalidLocations.map(location => location.name).toString()}`);
    const validLocations = _.without(connectedLocations, ...invalidLocations, gameState.map.locations.find(location => location.type == LocationType.hospital));
    // this.debug(`Valid locations are: ${validLocations.map(location => location.name).toString()}`);
    validLocations.map(location => possibleMoves.push({ location, value: 1}));

    const possiblePowers = this.powers.slice(0, 5).filter(power => (power.nightOnly == false || gameState.timePhase > 2) && power.cost < this.blood && this.currentLocation.type !== LocationType.sea);
    // this.debug(`Possible powers are ${possiblePowers.map(power => power.name)}`);
    const invalidPowers: Power[] = [];
    this.trail.forEach(trailCard => {
      if (trailCard.power) {
        invalidPowers.push(trailCard.power);
        if (trailCard.power.name == PowerName.wolfFormAndDoubleBack) {
          invalidPowers.push(this.powers.find(power => power.name == PowerName.wolfForm));
          invalidPowers.push(this.powers.find(power => power.name == PowerName.doubleBack));
        }
        if (trailCard.power.name == PowerName.wolfFormAndHide) {
          invalidPowers.push(this.powers.find(power => power.name == PowerName.wolfForm));
          invalidPowers.push(this.powers.find(power => power.name == PowerName.hide));
        }
      }
    });

    // this.debug(`Invalid powers are ${invalidPowers.map(power => power.name)}`);
    const validPowers = _.without(possiblePowers, ...invalidPowers);
    if (validPowers.find(power => power.name == PowerName.wolfForm)) {
      if (validPowers.find(power => power.name == PowerName.doubleBack)) {
        validPowers.push(this.powers.find(power => power.name == PowerName.wolfFormAndDoubleBack));
      }
      if (validPowers.find(power => power.name == PowerName.hide)) {
        validPowers.push(this.powers.find(power => power.name == PowerName.wolfFormAndHide));
      }
    }
    // this.debug(`Valid powers are ${validPowers.map(power => power.name)}`);
    validPowers.forEach(validPower => {
      let potentialDestinations: Location[] = [];
      let secondLayerDestination: Location[] = [];
      switch(validPower.name) {
        case PowerName.darkCall:
          possibleMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.doubleBack:
          this.trail.concat(gameState.catacombs).forEach(trailCard => {
            if (gameState.map.distanceBetweenLocations(this.currentLocation, trailCard.location, ['road', 'sea']) == 1) {
              possibleMoves.push({ location: trailCard.location, power: validPower, value: 1 });
            }
          });
          break;
        case PowerName.feed:
          possibleMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.hide:
          possibleMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.wolfForm:
          potentialDestinations = this.currentLocation.roadConnections.map(conn => gameState.map.getLocationByName(conn));
          potentialDestinations.forEach(dest => secondLayerDestination = secondLayerDestination.concat(dest.roadConnections.map(conn => gameState.map.getLocationByName(conn))));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => !this.trail.find(trailCard => trailCard.location == dest) && !gameState.catacombs.find(trailCard => trailCard.location == dest));
          potentialDestinations = _.without(potentialDestinations, this.currentLocation);
          potentialDestinations.forEach(dest => possibleMoves.push({ power: validPower, location: dest, value: 1}));
          break;
        case PowerName.wolfFormAndDoubleBack:
          potentialDestinations = this.currentLocation.roadConnections.map(conn => gameState.map.getLocationByName(conn));
          potentialDestinations.forEach(dest => secondLayerDestination = secondLayerDestination.concat(dest.roadConnections.map(conn => gameState.map.getLocationByName(conn))));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => this.trail.find(trailCard => trailCard.location == dest) || gameState.catacombs.find(trailCard => trailCard.location == dest));
          potentialDestinations.forEach(dest => possibleMoves.push({ power: validPower, location: dest, value: 1}));
        break;
        case PowerName.wolfFormAndHide:
          possibleMoves.push({ power: validPower, value: 1});
          break;
      }
    });
    this.debug(`Possible moves are to: ${possibleMoves.filter(move => !move.power).map(move => move.location.name)}`);
    this.debug(`Possible powers are: ${possibleMoves.filter(move => move.power && !move.location).map(move => move.power.name)}`);
    this.debug(`Possible power moves are: ${possibleMoves.filter(move => move.power && move.location).map(move => `${move.power.name} to ${move.location.name}`)}`);
    if (possibleMoves.length > 0) {
      const valueSum = possibleMoves.reduce((sum, curr) => sum += curr.value, 0);
      // this.debug(`Total moves value sum is ${valueSum}`);
      const randomChoice = Math.floor(Math.random()*valueSum);
      // this.debug(`Random choice is ${randomChoice}`);
      let index = 0;
      let cumulativeValue = 0;
      while (cumulativeValue < randomChoice) {
        cumulativeValue += possibleMoves[index].value;
        index++;
        // this.debug(`Random choice not reached yet, moving to next possible move. Cumulative value is now ${cumulativeValue} and index is now ${index}`);
      }
      // this.debug(`Reached random choice at possible move index ${index}`);
      this.nextMove = possibleMoves[index];
      this.debug((this.nextMove.power ? this.nextMove.power.name : 'Move') + (this.nextMove.location ? ` to ${this.nextMove.location.name}` : ''));
    } else {
      this.debug('No possible moves');
    }
    return 'Dracula has decided what to do this turn';
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

  executeDarkCall(gameState: Game): string {
    // TODO: actually draw encounters and discard them logically
    return 'Dracula has chosen his encounters';
  }

  drawUpEncounters(encounterPool: Encounter[]): string {
    let drawCount = 0;
    while (this.encounterHand.length < this.encounterHandSize) {
      this.encounterHand.push(encounterPool.pop());
      this.debug(`Dracula drew encounter ${this.encounterHand[this.encounterHand.length -1].name}`);
      drawCount++;
    }
    return drawCount > 0 ? `Dracula drew ${drawCount} encounters` : '';
  }

  decideWhichEncounterToKeep(encounterA: Encounter, encounterB: Encounter): Encounter {
    // TODO: make logical decision
    if (!encounterA) {
      return encounterB;
    }
    if (Math.floor(Math.random()) < 0.5) {
      return encounterA;
    } else {
      return encounterB;
    }
  }

  decideFateOfDroppedOffCard(droppedOffCard: TrailCard, gameState: Game): string {
    // TODO: make logical decision
    if (droppedOffCard.location) {
      if (Math.random() < 0.2 && gameState.catacombs.length < 3 && droppedOffCard.location.type !== LocationType.sea) {
        gameState.catacombEncounters.push(this.chooseEncounter());
        this.debug(`Card added to catacombs: ${droppedOffCard.location.name} with ${droppedOffCard.encounter ? droppedOffCard.encounter.name: '__'} and ${gameState.catacombEncounters[gameState.catacombEncounters.length -1].name}`);
        gameState.catacombs.push(droppedOffCard);
        return 'Dracula moved the card to the catacombs with an additional encounter on it'
      }
      this.debug(`Card returned to deck: ${droppedOffCard.location.name}`);
      this.droppedOffEncounter = droppedOffCard.encounter;
      if (this.droppedOffEncounter) {
        this.debug(`Encounter ${this.droppedOffEncounter.name} to be dealt with later`);
      }
    }
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
      if (cardToClear.location) {
        this.debug(`Returning ${cardToClear.location.name} to the Location deck`);
      }
      if (cardToClear.power) {
        cardsCleared++;
        this.debug(`Returning ${cardToClear.power.name} to the Location deck`);
      }
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
  location?: Location;
  encounter?: Encounter;
  power?: Power;
}

interface PossibleMove {
  location?: Location;
  power?: Power;
  value: number;
}

interface Power {
  name: PowerName;
  nightOnly: boolean;
  cost: number;
}

export enum PowerName {
  darkCall = 'Dark Call',
  doubleBack = 'Double Back',
  feed = 'Feed',
  hide = 'Hide',
  wolfForm = 'Wolf Form',
  wolfFormAndDoubleBack = 'Wolf Form and Double Back',
  wolfFormAndHide = 'Wolf Form and Hide'
}
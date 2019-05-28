import { Location, LocationType } from "./map";
import { Game } from "./game";
import { Encounter } from "./encounter";
import * as _ from 'lodash';

export class Dracula {
  blood: number;
  currentLocation: Location;
  revealed: boolean;
  encounterHand: Encounter[];
  encounterHandSize: number;
  droppedOffEncounter: Encounter;
  seaBloodPaid: boolean;
  nextMove: PossibleMove;
  powers: Power[];
  hideLocation: Location;
  possibleMoves: PossibleMove[];

  constructor() {
    this.blood = 15;
    this.revealed = false;
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
  }

  setLocation(newLocation: Location): string {
    this.currentLocation = newLocation;
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

  
  chooseNextMove(gameState: Game): string {
    // TODO: make logical decision
    this.nextMove = null;
    this.possibleMoves = [];
    const connectedLocationNames = _.union(this.currentLocation.roadConnections, this.currentLocation.seaConnections);
    const connectedLocations = connectedLocationNames.map(name => gameState.map.getLocationByName(name));
    const invalidLocations = gameState.trail.filter(trail => trail.location).map(trail => trail.location);
    if (this.blood == 1 && (this.currentLocation.type !== LocationType.sea || (this.currentLocation.type == LocationType.sea && !this.seaBloodPaid))) {
      invalidLocations.concat(connectedLocations.filter(location => location.type == LocationType.sea));
    }
    const validLocations = _.without(connectedLocations, ...invalidLocations, gameState.map.locations.find(location => location.type == LocationType.hospital));
    validLocations.map(location => {
      let catacombIndex = gameState.catacombs.length -1;
      for (catacombIndex; catacombIndex > -1; catacombIndex--) {
        if (gameState.catacombs[catacombIndex].location == location) {
          break;
        }
      }
      if (catacombIndex > -1) {
        this.possibleMoves.push({ location, value: 1, catacombToDiscard: catacombIndex});
      } else {
        this.possibleMoves.push({ location, value: 1})
      }
    });

    const possiblePowers = this.powers.slice(0, 5).filter(power => (power.nightOnly == false || gameState.timePhase > 2) && power.cost < this.blood && this.currentLocation.type !== LocationType.sea);
    const invalidPowers: Power[] = [];
    gameState.trail.forEach(trailCard => {
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

    const validPowers = _.without(possiblePowers, ...invalidPowers);
    if (validPowers.find(power => power.name == PowerName.wolfForm)) {
      if (validPowers.find(power => power.name == PowerName.doubleBack)) {
        validPowers.push(this.powers.find(power => power.name == PowerName.wolfFormAndDoubleBack));
      }
      if (validPowers.find(power => power.name == PowerName.hide)) {
        validPowers.push(this.powers.find(power => power.name == PowerName.wolfFormAndHide));
      }
    }
    validPowers.forEach(validPower => {
      let potentialDestinations: Location[] = [];
      let secondLayerDestination: Location[] = [];
      switch(validPower.name) {
        case PowerName.darkCall:
          this.possibleMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.doubleBack:
            gameState.trail.concat(gameState.catacombs).forEach(trailCard => {
            if (gameState.map.distanceBetweenLocations(this.currentLocation, trailCard.location, ['road', 'sea']) == 1) {
              this.possibleMoves.push({ location: trailCard.location, power: validPower, value: 1 });
            }
          });
          break;
        case PowerName.feed:
            this.possibleMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.hide:
            this.possibleMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.wolfForm:
          potentialDestinations = this.currentLocation.roadConnections.map(conn => gameState.map.getLocationByName(conn));
          potentialDestinations.forEach(dest => secondLayerDestination = secondLayerDestination.concat(dest.roadConnections.map(conn => gameState.map.getLocationByName(conn))));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => !gameState.trail.find(trailCard => trailCard.location == dest) && !gameState.catacombs.find(trailCard => trailCard.location == dest));
          potentialDestinations = _.without(potentialDestinations, this.currentLocation);
          potentialDestinations.forEach(dest => this.possibleMoves.push({ power: validPower, location: dest, value: 1}));
          break;
        case PowerName.wolfFormAndDoubleBack:
          potentialDestinations = this.currentLocation.roadConnections.map(conn => gameState.map.getLocationByName(conn));
          potentialDestinations.forEach(dest => secondLayerDestination = secondLayerDestination.concat(dest.roadConnections.map(conn => gameState.map.getLocationByName(conn))));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => gameState.trail.find(trailCard => trailCard.location == dest) || gameState.catacombs.find(trailCard => trailCard.location == dest));
          potentialDestinations.forEach(dest => this.possibleMoves.push({ power: validPower, location: dest, value: 1}));
          break;
        case PowerName.wolfFormAndHide:
          this.possibleMoves.push({ power: validPower, value: 1});
          break;
      }
    });
    if (this.possibleMoves.length > 0) {
      const valueSum = this.possibleMoves.reduce((sum, curr) => sum += curr.value, 0);
      const randomChoice = Math.floor(Math.random()*valueSum);
      let index = 0;
      let cumulativeValue = 0;
      while (cumulativeValue < randomChoice) {
        cumulativeValue += this.possibleMoves[index].value;
        index++;
      }
      this.nextMove = this.possibleMoves[index];
    }
    return 'Dracula has decided what to do this turn';
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

  executeDarkCall(gameState: Game): string {
    // TODO: actually draw encounters and discard them logically
    return 'Dracula has chosen his encounters';
  }

  drawUpEncounters(encounterPool: Encounter[]): string {
    let drawCount = 0;
    while (this.encounterHand.length < this.encounterHandSize) {
      this.encounterHand.push(encounterPool.pop());
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
        gameState.catacombs.push(droppedOffCard);
        return 'Dracula moved the card to the catacombs with an additional encounter on it'
      }
      this.droppedOffEncounter = droppedOffCard.encounter;
    }
    return 'Dracula returned the dropped off card to the Location deck';
  }

  evaluateCatacombs(gameState: Game): string {
    // TODO: make logical decision
    const catacombToDiscard = this.nextMove.catacombToDiscard || -1;
    let logMessage = '';
    for (let i = gameState.catacombs.length -1; i >= 0 ; i--) {
      if (Math.random() < 0.2 || i == catacombToDiscard) {
        logMessage += logMessage ? ` and position ${i + 1}` : `Dracula discarded catacomb card from position ${i + 1}`;
        gameState.encounterPool.push(gameState.catacombEncounters.splice(i, 1)[0]);
        if (gameState.catacombs[i].encounter) {
          gameState.encounterPool.push(gameState.catacombs[i].encounter);
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
    while (gameState.trail.length > remainingCards) {
      const cardToClear = gameState.trail.pop();
      cardsCleared++;
      if (cardToClear.location) {
      }
      if (cardToClear.power) {
        cardsCleared++;
      }
      if (cardToClear.encounter) {
        encountersCleared++;
        gameState.encounterPool.push(cardToClear.encounter);
        gameState.shuffleEncounters();
      }
    }
    return `Returned ${cardsCleared} cards and ${encountersCleared} encounters`;
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
  catacombToDiscard?: number;
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
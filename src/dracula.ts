import { Location, LocationType } from "./map";
import { Game } from "./game";
import { Encounter, EncounterName } from "./encounter";
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
        name: PowerName.DarkCall,
        nightOnly: true,
        cost: 2
      },
      {
        name: PowerName.DoubleBack,
        nightOnly: false,
        cost: 0
      },
      {
        name: PowerName.Feed,
        nightOnly: true,
        cost: -1
      },
      {
        name: PowerName.Hide,
        nightOnly: false,
        cost: 0
      },
      {
        name: PowerName.WolfForm,
        nightOnly: true,
        cost: 1
      },
      {
        name: PowerName.WolfFormAndDoubleBack,
        nightOnly: true,
        cost: 1
      },
      {
        name: PowerName.WolfFormAndHide,
        nightOnly: true,
        cost: 1
      },
    ];
  }

  /**
   * Sets Dracula's currentLocation
   * @param newLocation The Location to which to move Dracula
   */
  setLocation(newLocation: Location): string {
    this.currentLocation = newLocation;
    return this.revealed ? `Dracula moved to ${this.currentLocation.name}` : 'Dracula moved to a hidden location';
  }
  
  /**
   * Selects Dracula's first Location at the state of the game
   * @param gameState The state of the game
   */
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

  /**
   * Decides Dracula's next move based on the current state of the game
   * @param gameState The state of the game
   */
  chooseNextMove(gameState: Game): string {
    // TODO: make logical decision
    this.nextMove = null;
    this.possibleMoves = [];
    const connectedLocationNames = _.union(this.currentLocation.roadConnections, this.currentLocation.seaConnections);
    const connectedLocations = connectedLocationNames.map(name => gameState.map.getLocationByName(name));
    let invalidLocations = gameState.trail.filter(trail => trail.location).map(trail => trail.location);
    let seaIsInvalid = false;
    if (this.blood == 1) {
      if (this.currentLocation.type !== LocationType.sea) {
        seaIsInvalid = true;
      }
      if (!this.seaBloodPaid) {
        seaIsInvalid = true;
      }
    }
    if (seaIsInvalid) {
      invalidLocations = invalidLocations.concat(connectedLocations.filter(location => location.type == LocationType.sea));
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
        if (trailCard.power.name == PowerName.WolfFormAndDoubleBack) {
          invalidPowers.push(this.powers.find(power => power.name == PowerName.WolfForm));
          invalidPowers.push(this.powers.find(power => power.name == PowerName.DoubleBack));
        }
        if (trailCard.power.name == PowerName.WolfFormAndHide) {
          invalidPowers.push(this.powers.find(power => power.name == PowerName.WolfForm));
          invalidPowers.push(this.powers.find(power => power.name == PowerName.Hide));
        }
      }
    });

    const validPowers = _.without(possiblePowers, ...invalidPowers);
    if (validPowers.find(power => power.name == PowerName.WolfForm)) {
      if (validPowers.find(power => power.name == PowerName.DoubleBack)) {
        validPowers.push(this.powers.find(power => power.name == PowerName.WolfFormAndDoubleBack));
      }
      if (validPowers.find(power => power.name == PowerName.Hide)) {
        validPowers.push(this.powers.find(power => power.name == PowerName.WolfFormAndHide));
      }
    }
    validPowers.forEach(validPower => {
      let potentialDestinations: Location[] = [];
      let secondLayerDestination: Location[] = [];
      switch(validPower.name) {
        case PowerName.DarkCall:
          this.possibleMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.DoubleBack:
            gameState.trail.concat(gameState.catacombs).forEach(trailCard => {
            if (gameState.map.distanceBetweenLocations(this.currentLocation, trailCard.location, ['road', 'sea']) == 1) {
              this.possibleMoves.push({ location: trailCard.location, power: validPower, value: 1 });
            }
          });
          break;
        case PowerName.Feed:
            this.possibleMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.Hide:
            this.possibleMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.WolfForm:
          potentialDestinations = this.currentLocation.roadConnections.map(conn => gameState.map.getLocationByName(conn));
          potentialDestinations.forEach(dest => secondLayerDestination = secondLayerDestination.concat(dest.roadConnections.map(conn => gameState.map.getLocationByName(conn))));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => !gameState.trail.find(trailCard => trailCard.location == dest) && !gameState.catacombs.find(trailCard => trailCard.location == dest));
          potentialDestinations = _.without(potentialDestinations, this.currentLocation);
          potentialDestinations.forEach(dest => this.possibleMoves.push({ power: validPower, location: dest, value: 1}));
          break;
        case PowerName.WolfFormAndDoubleBack:
          potentialDestinations = this.currentLocation.roadConnections.map(conn => gameState.map.getLocationByName(conn));
          potentialDestinations.forEach(dest => secondLayerDestination = secondLayerDestination.concat(dest.roadConnections.map(conn => gameState.map.getLocationByName(conn))));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => gameState.trail.find(trailCard => trailCard.location == dest) || gameState.catacombs.find(trailCard => trailCard.location == dest));
          potentialDestinations.forEach(dest => this.possibleMoves.push({ power: validPower, location: dest, value: 1}));
          break;
        case PowerName.WolfFormAndHide:
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

  /**
   * Chooses which Encounter to place on a trail card
   */
  chooseEncounter(): Encounter {
    // TODO: make logical decision
    // TODO: either include logic for catacombs choice here or make a second function for that case
    const randomChoice = Math.floor(Math.random()*this.encounterHand.length);
    return this.encounterHand.splice(randomChoice, 1)[0];
  }

  /**
   * Updates Dracula's blood after he has received a "death" combat strike or run out of possible moves
   */
  die(): string {
    return `Dracula was dealt a mortal blow\n${this.setBlood(Math.floor((this.blood - 1) / 5) * 5)}`;
  }

  /**
   * Sets Dracula's blood
   * @param newBlood The value to which to set Dracula's blood
   */
  setBlood(newBlood: number): string {
    this.blood = Math.max(0, Math.min(newBlood, 15));
    if (this.blood == 0) {
      return 'Dracula is dead. The Hunters win!';
    }
    return `Dracula is now on ${this.blood} blood`;
  }

  /**
   * Executes Dark Call power
   * @param gameState The state of the game
   */
  executeDarkCall(gameState: Game): string {
    this.encounterHandSize += 10;
    gameState.log(this.drawUpEncounters(gameState.encounterPool));
    this.encounterHandSize -= 10;
    gameState.log(this.discardDownEncounters(gameState.encounterPool));
    gameState.log(gameState.shuffleEncounters());
    return 'Dracula has chosen his encounters';
  }

  /**
   * Draws Encounters up to Dracula's hand limit
   * @param encounterPool The pool of Encounters from which to draw
   */
  drawUpEncounters(encounterPool: Encounter[]): string {
    let drawCount = 0;
    while (this.encounterHand.length < this.encounterHandSize) {
      this.encounterHand.push(encounterPool.pop());
      drawCount++;
    }
    return drawCount > 0 ? `Dracula drew ${drawCount} encounter${drawCount > 1 ? 's': ''}` : '';
  }

  /**
   * Discards Encounters down to Dracula's hand limit
   * @param encounters The pool of Encounter to which to discard
   */
  discardDownEncounters(encounters: Encounter[]): string {
    // TODO: Make logical decision
    let discardCount = 0;
    while (this.encounterHand.length > this.encounterHandSize) {
      const choice = Math.floor(Math.random()*this.encounterHand.length);
      encounters.push(this.encounterHand.splice(choice, 1)[0]);
      discardCount++;
    }
    return discardCount > 0 ? `Dracula discarded ${discardCount} encounter${discardCount > 1 ? 's': ''}` : '';
  }

  /**
   * Decides which Encounter to keep on a Catacomb card to which Dracula has Doubled Back
   * @param card The catacomb card
   * @param gameState The state of the game
   */
  decideWhichEncounterToKeep(card: TrailCard, gameState: Game): string {
    // TODO: make logical decision
    if (!card.catacombEncounter) {
      return;
    }
    if (card.catacombEncounter && !card.encounter) {
      card.encounter = card.catacombEncounter;
      delete card.catacombEncounter;
      return;
    }
    if (Math.floor(Math.random()) < 0.5) {
      gameState.encounterPool.push(card.encounter);
      card.encounter = card.catacombEncounter;
      delete card.catacombEncounter;
      gameState.shuffleEncounters();
    } else {
      gameState.encounterPool.push(card.catacombEncounter);
      delete card.catacombEncounter;
      gameState.shuffleEncounters();
    }    
    return 'Dracula kept the one encounter from the catacomb card and discarded the other';
  }

  /**
   * Decides what to do with a card that has dropped off the end of the trail
   * @param droppedOffCard The card that has dropped off
   * @param gameState The state of the game
   */
  decideFateOfDroppedOffCard(droppedOffCard: TrailCard, gameState: Game): string {
    // TODO: make logical decision
    if (droppedOffCard.location) {
      if (Math.random() < 0.2 && gameState.catacombs.length < 3 && droppedOffCard.location.type !== LocationType.sea) {
        droppedOffCard.catacombEncounter = this.chooseEncounter();
        gameState.catacombs.push(droppedOffCard);
        delete droppedOffCard.power;
        return 'Dracula moved the card to the catacombs with an additional encounter on it'
      } else {
        this.droppedOffEncounter = droppedOffCard.encounter;
      }
    }
    return 'Dracula returned the dropped off card to the Location deck';
  }

  /**
   * Checks the locations in the catacombs and decides what to do with them
   * @param gameState The state of the game
   */
  evaluateCatacombs(gameState: Game): string {
    // TODO: make logical decision
    let catacombToDiscard: number;
    if (this.nextMove) {
      catacombToDiscard = this.nextMove.catacombToDiscard || -1;
    }
    let logMessage = '';
    for (let i = gameState.catacombs.length -1; i >= 0 ; i--) {
      if (Math.random() < 0.2 || i == catacombToDiscard || (!gameState.catacombs[i].encounter && !gameState.catacombs[i].catacombEncounter)) {
        logMessage += logMessage ? ` and position ${i + 1}` : `Dracula discarded catacomb card from position ${i + 1}`;
        if (gameState.catacombs[i].encounter) {
          gameState.encounterPool.push(gameState.catacombs[i].encounter);
        }
        if (gameState.catacombs[i].catacombEncounter) {
          gameState.encounterPool.push(gameState.catacombs[i].catacombEncounter);
        }
        gameState.catacombs.splice(i, 1);
        gameState.shuffleEncounters();
      }
    }
    return logMessage;
  }

  /**
   * Clears cards out of the trail
   * @param gameState The state of the game
   * @param remainingCards The number of cards to leave behind in the trail
   */
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

  /**
   * Decides what to do with an Encounter that has dropped off the end of the trail
   * @param gameState The state of the game
   */
  decideFateOfDroppedOffEncounter(gameState: Game): string {
    // TODO: Make logical decision
    let discardEncounter = true;
    switch(this.droppedOffEncounter.name) {
      case EncounterName.Ambush:
        break;
      case EncounterName.DesecratedSoil:
        break;
      case EncounterName.NewVampire:
        break;
    }
    if (discardEncounter) {
      gameState.encounterPool.push(this.droppedOffEncounter);
      gameState.log(gameState.shuffleEncounters());
      this.droppedOffEncounter = null;
      return 'Dracula returned the dropped off encounter to the encounter pool';
    }
  }
}

export interface TrailCard {
  revealed: boolean;
  location?: Location;
  encounter?: Encounter;
  catacombEncounter?: Encounter;
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
  DarkCall = 'Dark Call',
  DoubleBack = 'Double Back',
  Feed = 'Feed',
  Hide = 'Hide',
  WolfForm = 'Wolf Form',
  WolfFormAndDoubleBack = 'Wolf Form and Double Back',
  WolfFormAndHide = 'Wolf Form and Hide'
}
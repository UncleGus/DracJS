import * as _ from 'lodash';
import { Location, LocationType, LocationDomain, TravelMethod } from "./map";
import { Game } from "./game";
import { Encounter, EncounterName } from "./encounter";
import { Event, EventName } from "./event";
import { Hunter } from "./hunter";
import { ItemName } from './item';

export class Dracula {
  blood: number;
  currentLocation: Location;
  revealed: boolean;
  encounterHand: Encounter[];
  encounterHandSize: number;
  eventHand: Event[];
  eventHandSize: number;
  droppedOffEncounters: Encounter[];
  ambushEncounter: Encounter;
  seaBloodPaid: boolean;
  nextMove: PossibleMove;
  powers: Power[];
  hideLocation: Location;
  possibleMoves: PossibleMove[];
  availableAttacks: string[];
  lastUsedAttack: string;
  lastAttackedHunter: Hunter;
  repelled: boolean;
  eventAwaitingApproval: string;
  potentialTargetHunters: Hunter[];
  hypnosisInEffect: boolean;
  gameState: Game;
  evasionSlot: number;
  possibleTrails: TrailCard[][];

  constructor() {
    this.blood = 15;
    this.revealed = false;
    this.encounterHandSize = 5;
    this.encounterHand = [];
    this.eventHand = [];
    this.droppedOffEncounters = [];
    this.eventHandSize = 4;
    this.evasionSlot = 8;
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
    this.possibleTrails = [];
  }

  /**
   * Sets Dracula's currentLocation
   * @param newLocation The Location to which to move Dracula
   */
  setLocation(newLocation: Location): string {
    this.currentLocation = newLocation;
    this.gameState.logVerbose(`Dracula moved to ${this.currentLocation.name}`);
    return this.revealed ? `Dracula moved to ${this.currentLocation.name}` : 'Dracula moved to a hidden location';
  }

  initialisePossibleTrails() {
    const validLocations = this.gameState.map.locations.filter(location => location.type == LocationType.largeCity || location.type == LocationType.smallCity);
    _.remove(validLocations, location => location == this.gameState.godalming.currentLocation || location == this.gameState.seward.currentLocation || location == this.gameState.vanHelsing.currentLocation || location == this.gameState.mina.currentLocation);
    validLocations.forEach(location => {
      const newCard: TrailCard = {
        revealed: false,
        location
      }
      this.possibleTrails.push([newCard]);
    });
  }

  /**
   * Selects Dracula's first Location at the state of the game
   */
  chooseStartLocation(): Location {
    const validLocations = this.gameState.map.locations.filter(location => location.type == LocationType.smallCity || location.type == LocationType.largeCity);
    const distances = validLocations.map(location => this.evaluateMove({ location, value: 1 }));
    const totalValue = distances.reduce((prev, curr) => prev + curr, 0);
    const randomChoice = Math.random() * totalValue;
    let currentValue = 0;
    let index = 0;
    while (currentValue < randomChoice) {
      currentValue += distances[index];
    }
    return validLocations[index];
  }

  /**
   * Chooses a Location to move to when Evade is resolved
   */
  chooseEvasionDestination(): Location {
    const validLocations = this.gameState.map.locations.filter(location =>
      (location.type == LocationType.smallCity || location.type == LocationType.largeCity) && !this.gameState.trailContains(location)
      && !this.gameState.hunterIsIn(location));
    const distances = validLocations.map(location => this.evaluateMove({ location, value: 1 }));
    const totalValue = distances.reduce((prev, curr) => prev + curr, 0);
    const randomChoice = Math.random() * totalValue;
    let currentValue = 0;
    let index = 0;
    while (currentValue < randomChoice) {
      currentValue += distances[index];
    }
    this.evasionSlot = 0;
    return validLocations[index];
  }

  /**
   * Determines what moves are legal for Dracula at the present time
   */
  determineLegalMoves(): PossibleMove[] {
    // assume that this move will be carried out after the Timekeeping phase
    let newTimePhase = this.gameState.timePhase;
    if (this.currentLocation.type !== LocationType.sea) {
      newTimePhase = (newTimePhase + 1) % 6;
    }

    const legalMoves: PossibleMove[] = [];
    // start with all locations connected by road
    const connectedLocations = _.union(this.currentLocation.roadConnections, this.currentLocation.seaConnections);

    // remove all locations already in the trail
    let invalidLocations = this.gameState.trail.filter(trail => trail.location).map(trail => trail.location);

    // remove the hospital and the consecrated ground location
    invalidLocations.push(this.gameState.map.locations.find(location => location.type == LocationType.hospital), this.gameState.consecratedLocation);

    // if Dracula does not have a Devilish Power to discard a Heavenly Host, then those locations are also invalid
    if (!this.eventHand.find(event => event.name == EventName.DevilishPower)) {
      invalidLocations.push(...this.gameState.heavenlyHostLocations);
    }

    // if there is a Stormy Seas in effect, that location is also invalid
    if (this.gameState.stormRounds > 0) {
      invalidLocations.push(this.gameState.stormLocation);
    }

    // sea moves might be invalid if Dracula is on 1 blood
    let seaIsInvalid = false;
    if (this.blood == 1) {
      if (this.currentLocation.type !== LocationType.sea) {
        seaIsInvalid = true;
      }
      if (!this.seaBloodPaid || this.gameState.hunterAlly.name == EventName.RufusSmith) {
        seaIsInvalid = true;
      }
    }
    if (seaIsInvalid) {
      invalidLocations = invalidLocations.concat(connectedLocations.filter(location => location.type == LocationType.sea));
    }

    // remove all invalid locations from the list of valid ones
    const validLocations = _.without(connectedLocations, ...invalidLocations, this.gameState.map.locations.find(location => location.type == LocationType.hospital));

    // each valid location is a valid move, but some may require discarding the corresponding catacomb card first before moving there
    validLocations.map(location => {
      let catacombIndex = this.gameState.catacombs.length - 1;
      for (catacombIndex; catacombIndex > -1; catacombIndex--) {
        if (this.gameState.catacombs[catacombIndex].location == location) {
          break;
        }
      }
      if (catacombIndex > -1) {
        legalMoves.push({ location, value: 1, catacombToDiscard: catacombIndex });
      } else {
        legalMoves.push({ location, value: 1 })
      }
    });

    // start with all powers that can be played at the new time of day
    const possiblePowers = this.powers.slice(0, 5).filter(power => (power.nightOnly == false || newTimePhase > 2) && power.cost < this.blood && this.currentLocation.type !== LocationType.sea);
    const invalidPowers: Power[] = [];

    // remove all powers that are already in the trail
    this.gameState.trail.forEach(trailCard => {
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
      switch (validPower.name) {
        case PowerName.DarkCall:
          legalMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.DoubleBack:
          this.gameState.trail.concat(this.gameState.catacombs).forEach(trailCard => {
            if (this.gameState.map.distanceBetweenLocations(this.currentLocation, trailCard.location, [TravelMethod.road, TravelMethod.sea]) == 1) {
              legalMoves.push({ location: trailCard.location, power: validPower, value: 1 });
            }
          });
          break;
        case PowerName.Feed:
          legalMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.Hide:
          legalMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.WolfForm:
          potentialDestinations = this.currentLocation.roadConnections.filter(road => !this.gameState.cityIsConsecrated(road));
          potentialDestinations.forEach(dest => secondLayerDestination.push(...dest.roadConnections));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => !this.gameState.trailContains(dest) && !this.gameState.catacombsContains(dest) && !this.gameState.cityIsConsecrated(dest));
          potentialDestinations = _.without(potentialDestinations, this.currentLocation);
          potentialDestinations.forEach(dest => legalMoves.push({ power: validPower, location: dest, value: 1 }));
          break;
        case PowerName.WolfFormAndDoubleBack:
          potentialDestinations = this.currentLocation.roadConnections;
          potentialDestinations.forEach(dest => secondLayerDestination = secondLayerDestination.concat(dest.roadConnections));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => (this.gameState.trailContains(dest) || this.gameState.catacombsContains(dest)) && !this.gameState.cityIsConsecrated(dest));
          potentialDestinations.forEach(dest => legalMoves.push({ power: validPower, location: dest, value: 1 }));
          break;
        case PowerName.WolfFormAndHide:
          legalMoves.push({ power: validPower, value: 1 });
          break;
      }
    });
    return legalMoves;
  }

  /**
   * Determines if a given move is legal at the present time
   * @param move 
   */
  moveIsLegal(move: PossibleMove): boolean {
    const legalMoves = this.determineLegalMoves();
    return !!legalMoves.find(legalMove => legalMove.catacombToDiscard == move.catacombToDiscard &&
      legalMove.location == move.location && legalMove.power == move.power);
  }

  /**
   * Decides Dracula's next move based on the current state of the game
   */
  chooseNextMove(): string {
    if (this.nextMove && this.moveIsLegal(this.nextMove)) {
      return 'Dracula\'s next move is already determined';
    }
    this.possibleMoves = this.determineLegalMoves();
    if (this.possibleMoves.length > 0) {
      this.possibleMoves.forEach(move => move.value = this.evaluateMove(move));
      const valueSum = this.possibleMoves.reduce((sum, curr) => sum += curr.value, 0);
      const randomChoice = Math.floor(Math.random() * valueSum);
      let index = 0;
      let cumulativeValue = 0;
      while (cumulativeValue < randomChoice) {
        cumulativeValue += this.possibleMoves[index].value;
        index++;
      }
      this.nextMove = this.possibleMoves[index];
    }
    if (this.hypnosisInEffect) {
      return 'Dracula is unable to perform the action declared during Hypnosis; he has chosen a new course of action';
    }
    return 'Dracula has decided what to do this turn';
  }

  /**
   * Chooses which Encounter to place on a trail card
   */
  chooseEncounterForTrail(): Encounter {
    // TODO: make logical decision
    // Things to consider:
    // how warm the trail is
    // if there are any Encounters about to mature that would clear this Encounter off the trail
    let rightmostClearedTrailSpace = 5;
    for (let i = this.gameState.trail.length - 1; i > -1; i--) {
      if (this.gameState.trail[i].encounter) {
        if (this.gameState.trail[i].encounter.name == EncounterName.NewVampire) {
          rightmostClearedTrailSpace = i - 6;
        } else if (this.gameState.trail[i].encounter.name == EncounterName.Ambush ||
          this.gameState.trail[i].encounter.name == EncounterName.DesecratedSoil) {
          rightmostClearedTrailSpace = i - 3;
        }
      }
    }
    const encountersValued: { name: string, value: number }[] = [];
    this.encounterHand.forEach(enc => {
      switch (enc.name) {
        case EncounterName.Plague:
          encountersValued.push({ name: enc.name, value: 1 });
          break;
        case EncounterName.Rats:
          encountersValued.push({ name: enc.name, value: 2 });
          break;
        case EncounterName.Peasants:
          if (this.currentLocation.domain == LocationDomain.west) {
            encountersValued.push({ name: enc.name, value: 3 });
          } else {
            encountersValued.push({ name: enc.name, value: 9 });
          }
          break;
        case EncounterName.Thief:
          encountersValued.push({ name: enc.name, value: 4 });
          break;
        case EncounterName.Hoax:
          if (this.currentLocation.domain == LocationDomain.east) {
            encountersValued.push({ name: enc.name, value: 5 });
          } else {
            encountersValued.push({ name: enc.name, value: 11 });
          }
          break;
        case EncounterName.MinionWithKnife:
          encountersValued.push({ name: enc.name, value: 6 });
          break;
        case EncounterName.MinionWithKnifeAndPistol:
          encountersValued.push({ name: enc.name, value: 7 });
          break;
        case EncounterName.MinionWithKnifeAndRifle:
          encountersValued.push({ name: enc.name, value: 8 });
          break;
        case EncounterName.Saboteur:
          encountersValued.push({ name: enc.name, value: 10 });
          break;
        case EncounterName.Wolves:
          encountersValued.push({ name: enc.name, value: 12 });
          break;
        case EncounterName.Lightning:
          encountersValued.push({ name: enc.name, value: 13 });
          break;
        case EncounterName.Assassin:
          encountersValued.push({ name: enc.name, value: 14 });
          break;
        case EncounterName.Fog:
          encountersValued.push({ name: enc.name, value: 15 });
          break;
        case EncounterName.Bats:
          encountersValued.push({ name: enc.name, value: 16 });
          break;
        case EncounterName.Spy:
          encountersValued.push({ name: enc.name, value: 17 });
          break;
        case EncounterName.DesecratedSoil:
          if (rightmostClearedTrailSpace > 0) {
            encountersValued.push({ name: enc.name, value: 18 });
          } else {
            encountersValued.push({ name: enc.name, value: -1 });
          }
          break;
        case EncounterName.Ambush:
          if (rightmostClearedTrailSpace > 0) {
            encountersValued.push({ name: enc.name, value: 19 });
          } else {
            encountersValued.push({ name: enc.name, value: -2 });
          }
          break;
        case EncounterName.NewVampire:
          if (rightmostClearedTrailSpace > 0) {
            encountersValued.push({ name: enc.name, value: 20 });
          } else {
            encountersValued.push({ name: enc.name, value: -3 });
          }
          break;
      }
    });
    encountersValued.sort((a, b) => b.value - a.value);

    encountersValued.forEach(enc => {
      for (let i = 0; i < this.encounterHand.length; i++) {
        if (this.encounterHand[i].name == enc.name) {
          return this.encounterHand.splice(i, 1)[0];
        }
      }
    });

    // if something goes horrible wrong, choose one at random
    const randomChoice = Math.floor(Math.random() * this.encounterHand.length);
    return this.encounterHand.splice(randomChoice, 1)[0];
  }

  /**
   * Chooses which Encounter to place on a catacombs card
   */
  chooseEncounterForCatacombs(): Encounter {
    // TODO: make logical decision
    // Shouldn't choose an Encounter that has a mature effect unless intending to Double Back here
    const randomChoice = Math.floor(Math.random() * this.encounterHand.length);
    return this.encounterHand.splice(randomChoice, 1)[0];
  }

  /**
   * Updates Dracula's blood after he has received a "death" combat strike or run out of possible moves
   */
  die(): string {
    return `Dracula was dealt a mortal blow\n${this.setBlood(Math.floor((this.blood - 1) / 5) * 5)}`;
  }

  /**
   * Chooses the order in which Dracula would like the Encounters resolved
   * @param encounters The list of Encounters to be resolved
   */
  chooseEncounterResolutionOrder(encounters: Encounter[]): string {
    // TODO: make logical decision
    // Should resolve turn-ending Encounters last
    if (encounters.length == 1) {
      return `Resolve ${encounters[0].name}`;
    }
    const encountersCopy: Encounter[] = [];
    while (encounters.length > 0) {
      const choice = Math.floor(Math.random() * encounters.length);
      encountersCopy.push(encounters.splice(choice, 1)[0]);
    }
    return 'Dracula chose this order for the encounters to be resolved: ' + encountersCopy.map(encounter => encounter.name).join(', ');
  }

  /**
   * Decide where so send the Hunter affected by Bats
   * @param hunter The Hunter affected by Bats
   */
  decideBatsDestination(hunter: Hunter): Location {
    // TODO: make logical decision
    // Move Hunter away if Dracula is trying to hide
    // Move Hunter onto Dracula if fighting is good
    // Move Hunter onto another Encounter if they don't have gear to counter it
    let possibleDestinations: Location[] = [hunter.currentLocation, ...hunter.currentLocation.roadConnections];
    let nextLayerDestination: Location[] = [];
    possibleDestinations.forEach(location => nextLayerDestination = nextLayerDestination.concat(location.roadConnections));
    possibleDestinations = _.uniq(possibleDestinations.concat(nextLayerDestination));
    const choice = Math.floor(Math.random() * possibleDestinations.length);
    return possibleDestinations[choice];
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
   */
  executeDarkCall(): string {
    this.encounterHandSize += 10;
    this.gameState.log(this.drawUpEncounters());
    this.encounterHandSize -= 10;
    this.gameState.log(this.discardDownEncounters());
    this.gameState.log(this.gameState.shuffleEncounters());
    return 'Dracula has chosen his encounters';
  }

  /**
   * Draws Encounters up to Dracula's hand limit
   */
  drawUpEncounters(): string {
    let drawCount = 0;
    while (this.encounterHand.length < this.encounterHandSize) {
      this.encounterHand.push(this.gameState.encounterPool.pop());
      this.gameState.logVerbose(`Dracula drew Encounter ${this.encounterHand[this.encounterHand.length - 1].name}`);
      drawCount++;
    }
    return drawCount > 0 ? `Dracula drew ${drawCount} encounter${drawCount > 1 ? 's' : ''}` : '';
  }

  /**
   * Discards Encounters down to Dracula's hand limit
   */
  discardDownEncounters(): string {
    // TODO: Make logical decision
    // Value order of Encounters
    // some might be more useful for current conditions
    let discardCount = 0;
    while (this.encounterHand.length > this.encounterHandSize) {
      const choice = Math.floor(Math.random() * this.encounterHand.length);
      this.gameState.encounterPool.push(this.encounterHand.splice(choice, 1)[0]);
      this.gameState.logVerbose(`Dracula discarded ${this.gameState.encounterPool[this.gameState.encounterPool.length - 1].name}`);
      discardCount++;
    }
    return discardCount > 0 ? `Dracula discarded ${discardCount} encounter${discardCount > 1 ? 's' : ''}` : '';
  }

  /**
   * Discards Events down to Dracula's hand limit
   */
  discardDownEvents(): string {
    // TODO: Make logical decision
    // value order of Events
    // some might be more or less useful based on current conditions
    let discardCount = 0;
    while (this.eventHand.length > this.eventHandSize) {
      const choice = Math.floor(Math.random() * this.eventHand.length);
      this.gameState.eventDiscard.push(this.eventHand.splice(choice, 1)[0]);
      this.gameState.logVerbose(`Dracula discarded ${this.gameState.eventDiscard[this.gameState.eventDiscard.length - 1].name}`);
      discardCount++;
    }
    return discardCount > 0 ? `Dracula discarded ${discardCount} event${discardCount > 1 ? 's' : ''}` : '';
  }

  /**
   * Discards Event of the given name from Dracula's hand
   * @param eventName The name of the Event to discard
   */
  discardEvent(eventName: string) {
    let eventIndex = 0;
    for (eventIndex; eventIndex < this.eventHand.length; eventIndex++) {
      if (this.eventHand[eventIndex].name == eventName) {
        break;
      }
    }
    if (eventIndex > this.eventHand.length) {
      return;
    }
    this.gameState.eventDiscard.push(this.eventHand.splice(eventIndex, 1)[0]);
    this.gameState.logVerbose(`Dracula discarded ${this.gameState.eventDiscard[this.gameState.eventDiscard.length - 1].name}`);
  }

  /**
   * Decides which Encounter to keep on a Catacomb card to which Dracula has Doubled Back
   * @param card The catacomb card
   */
  decideWhichEncounterToKeep(card: TrailCard): string {
    // TODO: make logical decision
    // value order of Encounters
    // some might be more useful based on current conditions
    if (!card.catacombEncounter) {
      return;
    }
    if (card.catacombEncounter && !card.encounter) {
      card.encounter = card.catacombEncounter;
      delete card.catacombEncounter;
      return;
    }
    if (Math.floor(Math.random()) < 0.5) {
      this.gameState.encounterPool.push(card.encounter);
      this.gameState.logVerbose(`Dracula discarded ${card.encounter.name} and kept ${card.catacombEncounter.name}`);
      card.encounter = card.catacombEncounter;
      delete card.catacombEncounter;
      this.gameState.shuffleEncounters();
    } else {
      this.gameState.encounterPool.push(card.catacombEncounter);
      this.gameState.logVerbose(`Dracula discarded ${card.catacombEncounter.name} and kept ${card.encounter.name}`);
      delete card.catacombEncounter;
      this.gameState.shuffleEncounters();
    }
    return 'Dracula kept one encounter from the catacomb card and discarded the other';
  }

  /**
   * Decides what to do with a card that has dropped off the end of the trail
   * @param droppedOffCard The card that has dropped off
   */
  decideFateOfDroppedOffCard(droppedOffCard: TrailCard): string {
    // TODO: make logical decision
    // most of the time it won't be worth keeping the card
    // unless the trail is already warm and there's a juicy encounter on this one
    if (droppedOffCard.location) {
      if (Math.random() < 0.2 && this.gameState.catacombs.length < 3 && droppedOffCard.location.type !== LocationType.sea) {
        droppedOffCard.catacombEncounter = this.chooseEncounterForCatacombs();
        this.gameState.logVerbose(`Dracula moved Location ${droppedOffCard.location.name} to the catacmobs and placed ${droppedOffCard.catacombEncounter.name} on it`);
        this.gameState.catacombs.push(droppedOffCard);
        delete droppedOffCard.power;
        return 'Dracula moved the card to the catacombs with an additional encounter on it'
      } else {
        this.droppedOffEncounters.push(droppedOffCard.encounter);
      }
      this.gameState.logVerbose(`${droppedOffCard.location.name} returned to the Location deck`);
    } else {
      this.gameState.logVerbose(`${droppedOffCard.power.name} returned to the Power deck`);
    }
    return 'Dracula returned the dropped off card to the Location deck';
  }

  /**
   * Checks the locations in the catacombs and decides what to do with them
   */
  evaluateCatacombs(): string {
    // TODO: make logical decision
    // if the Hunters are nowhere near this, remove it    
    let catacombToDiscard: number;
    if (this.nextMove) {
      catacombToDiscard = this.nextMove.catacombToDiscard || -1;
    }
    let logMessage = '';
    for (let i = this.gameState.catacombs.length - 1; i >= 0; i--) {
      if (Math.random() < 0.2 || i == catacombToDiscard || (!this.gameState.catacombs[i].encounter && !this.gameState.catacombs[i].catacombEncounter)) {
        logMessage += logMessage ? ` and position ${i + 1}` : `Dracula discarded catacomb card from position ${i + 1}`;
        this.gameState.logVerbose(`Dracula returned Location ${this.gameState.catacombs[i].location.name} to the Location deck`);
        if (this.gameState.catacombs[i].encounter) {
          this.gameState.encounterPool.push(this.gameState.catacombs[i].encounter);
          this.gameState.logVerbose(`Dracula returned Encounter ${this.gameState.catacombs[i].encounter.name} to the Encounter pool`);
        }
        if (this.gameState.catacombs[i].catacombEncounter) {
          this.gameState.encounterPool.push(this.gameState.catacombs[i].catacombEncounter);
          this.gameState.logVerbose(`Dracula returned Encounter ${this.gameState.catacombs[i].catacombEncounter.name} to the Encounter pool`);
        }
        this.gameState.catacombs.splice(i, 1);
        this.gameState.shuffleEncounters();
      }
    }
    return logMessage;
  }

  /**
   * Clears cards out of the trail
   * @param remainingCards The number of cards to leave behind in the trail
   */
  clearTrail(remainingCards: number): string {
    let cardsCleared = 0;
    let encountersCleared = 0;
    let cardIndex = this.gameState.trail.length - 1;
    while (this.gameState.trail.length > remainingCards) {
      if (this.gameState.trail[cardIndex].location !== this.currentLocation) {
        const cardToClear = this.gameState.trail.splice(cardIndex, 1)[0];
        if (cardToClear.location) {
          this.gameState.logVerbose(`${cardToClear.location.name} returned to Location deck`);
          cardsCleared++;
        }
        if (cardToClear.power) {
          this.gameState.logVerbose(`${cardToClear.power.name} returned to Power deck`);
          cardsCleared++;
        }
        if (cardToClear.encounter) {
          encountersCleared++;
          this.gameState.logVerbose(`${cardToClear.encounter.name} returned to Encounter pool`);
          this.gameState.encounterPool.push(cardToClear.encounter);
          this.gameState.shuffleEncounters();
        }
      }
      cardIndex--;
    }
    return `Returned ${cardsCleared} cards and ${encountersCleared} encounters`;
  }

  /**
   * Decides what to do with Encounters that have dropped off the end of the trail
   */
  decideFateOfDroppedOffEncounters(): string {
    // TODO: Make logical decision
    // need to consider what is on the trail cards that would be cleared if this matures
    // also the heat of the trail, clearing the cards might help turn the trail cold
    // most of the time it will be advantageous to mature it, especially if the effect
    // of clearing the trail was taken into account when choosing encounters to place in the first place
    let logMessage = '';
    this.droppedOffEncounters.forEach(encounter => {
      switch (encounter.name) {
        case EncounterName.Ambush:
          if (this.willMatureAmbush()) {
            const ambushHunter = this.chooseAmbushEncounter();
            if (this.ambushEncounter) {
              logMessage += `Dracula matured Ambush and played ${this.ambushEncounter.name} on ${ambushHunter.name}`;
              this.clearTrail(3);
            }
          }
          break;
        case EncounterName.DesecratedSoil:
          if (this.willMatureDesecratedSoil()) {
            logMessage += 'Dracula matured Desecrated soil. Draw event cards, discarding Hunter events until two Dracula event cards have been drawn.';
            this.clearTrail(3);
          }
          break;
        case EncounterName.NewVampire:
          logMessage += 'Dracula matured New Vampire';
          this.gameState.setVampireTrack(this.gameState.vampireTrack + 2);
          this.clearTrail(1);
          break;
        default:
          logMessage += 'Dracula returned the dropped off encounter to the encounter pool';
      }
      this.gameState.encounterPool.push(encounter);
    });
    this.droppedOffEncounters = [];
    this.gameState.log(this.gameState.shuffleEncounters());
    return logMessage;
  }

  /**
   * Decides whether or not to mature Ambush
   */
  willMatureAmbush(): boolean {
    // TODO: make logical decision
    // pretty much always yes
    if (Math.random() < 0.5) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Decides whether or not to mature Desecrated Soil
   */
  willMatureDesecratedSoil(): boolean {
    // TODO: make logical decision
    // pretty much always yes
    if (Math.random() < 0.5) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Chooses a Hunter and an Encounter to play when maturing an Ambush Encounter
   */
  chooseAmbushEncounter(): Hunter {
    // TODO: make logical decision
    // need to consider what equipment the Hunters have
    // and what Encounters are available
    const validHunters = [this.gameState.godalming, this.gameState.seward, this.gameState.vanHelsing, this.gameState.mina]
      .filter(hunter => hunter.currentLocation.type !== LocationType.sea && hunter.currentLocation.type !== LocationType.hospital);
    if (validHunters.length == 0) {
      this.ambushEncounter = null;
      return null;
    }
    const encounterChoice = Math.floor(Math.random() * this.encounterHand.length);
    this.ambushEncounter = this.encounterHand.splice(encounterChoice, 1)[0];
    const hunterChoice = Math.floor(Math.random() * validHunters.length);
    return validHunters[hunterChoice];
  }

  /**
   * Chooses which combat card to use in the current round of combat
   * @param hunters The Hunters involved in the combat
   */
  chooseCombatCardAndHunter(hunters: Hunter[]): string {
    // TODO: Make logical descision
    // need to consider what items the Hunter has, current blood, Hunter health, etc.
    let allowedAttacks = _.without(this.availableAttacks, this.lastUsedAttack);
    if (this.repelled) {
      allowedAttacks = _.without(this.availableAttacks, Attack.Claws, Attack.Fangs, Attack.Mesmerize, Attack.Strength);
    }
    if (this.gameState.rageRounds > 0) {
      allowedAttacks = _.without(this.availableAttacks, Attack.EscapeBat, Attack.EscapeMan, Attack.EscapeMist);
      this.gameState.rageRounds -= 1;
    }
    const attackChoice = Math.floor(Math.random() * allowedAttacks.length);
    const targetChoice = Math.floor(Math.random() * hunters.length);
    this.lastUsedAttack = allowedAttacks[attackChoice];
    this.lastAttackedHunter = hunters[targetChoice];
    return `Dracula chose ${allowedAttacks[attackChoice]} against ${hunters[targetChoice].name}`;
  }

  /**
   * Selects a destination for Escape as Bat
   * @param possibleDestinations The list of possible Locations
   */
  chooseBatDestination(possibleDestinations: Location[]): Location {
    // TODO: Make logical decision
    // need to decide whether to try to hide or attack another Hunter
    const choice = Math.floor(Math.random() * possibleDestinations.length);
    return possibleDestinations[choice];
  }

  /**
   * Chooses whether to play Control Storms on the set of Hunters
   * @param hunters The Hunters potentially affected
   */
  chooseControlStormsDestination(hunters: Hunter[]): Location {
    // TODO: Make logical decision
    // move Hunter away from trail
    // move Hunter onto another Encounter
    // consider Customs Search
    if (this.eventHand.find(event => event.name == EventName.ControlStorms)) {
      if (Math.random() < 0.5) {
        const destinations = this.gameState.map.portsWithinRange(hunters[0].currentLocation, 4);
        if (destinations.length > 0) {
          const choice = Math.floor(Math.random() * destinations.length);
          this.discardEvent(EventName.ControlStorms);
          return destinations[choice];
        }
      }
    }
    return null;
  }

  /**
   * Decides whether or not to play Customs Search on a Hunter
   * @param hunter The Hunter who moved
   * @param previousLocation The previous Location of the Hunter
   */
  willPlayCustomsSearch(hunter: Hunter, previousLocation: Location): boolean {
    // TODO: Make logical decision
    // consider Hunter equipment
    // consider if there is another Hunter with better equipment that is likely to cross the border
    if (!this.eventHand.find(event => event.name == EventName.CustomsSearch)) {
      return false;
    }
    let canPlayCustomsSearch = false;
    if ((hunter.currentLocation.type == LocationType.largeCity || hunter.currentLocation.type == LocationType.smallCity)
      && hunter.currentLocation.seaConnections.length > 0) {
      canPlayCustomsSearch = true;
    }
    if ((hunter.currentLocation.domain == LocationDomain.west && previousLocation.domain == LocationDomain.east)
      || (hunter.currentLocation.domain == LocationDomain.east && previousLocation.domain == LocationDomain.west)) {
      canPlayCustomsSearch = true;
    }
    const trailCard = this.gameState.trail.find(trail => trail.location == hunter.currentLocation);
    if (trailCard) {
      if (trailCard.encounter) {
        canPlayCustomsSearch = false;
      }
    }
    const catacombsCard = this.gameState.catacombs.find(catacomb => catacomb.location == hunter.currentLocation);
    if (catacombsCard) {
      if (catacombsCard.encounter || catacombsCard.catacombEncounter) {
        canPlayCustomsSearch = false;
      }
    }
    if (!canPlayCustomsSearch) {
      return false;
    }
    if (Math.random() < 0.5) {
      this.discardEvent(EventName.CustomsSearch);
      this.gameState.eventPendingResolution = EventName.CustomsSearch;
      this.eventAwaitingApproval = EventName.CustomsSearch;
      this.potentialTargetHunters = [hunter];
      return true;
    }
  }

  /**
   * Decides whether to play False Tip-off on a Hunter or group
   * @param hunters The Hunters attempting to catch a train
   */
  willPlayFalseTipoff(hunters: Hunter[]): boolean {
    // TODO: Make logical decision
    // consider proximity to Dracula and if there is another Hunter that would be better to play this on
    if (this.eventHand.find(event => event.name == EventName.FalseTipoff)) {
      if (Math.random() < 0.25) {
        this.discardEvent(EventName.FalseTipoff);
        this.gameState.eventPendingResolution = EventName.FalseTipoff;
        this.eventAwaitingApproval = EventName.FalseTipoff;
        return true;
      }
      return false;
    }
  }

  /**
   * Decides which Event, if any, to play at the start of Dracula's turn
   */
  chooseStartOfTurnEvents(): string {
    // TODO: Make logical decision
    // Consider current location, Hunter's path to that, heat of trail
    if (this.eventAwaitingApproval) {
      return;
    }
    let potentialEvents = this.eventHand.filter(card => card.name
      == EventName.DevilishPower
      || card.name == EventName.Roadblock
      || card.name == EventName.TimeRunsShort
      || card.name == EventName.UnearthlySwiftness);
    if (potentialEvents.find(card => card.name == EventName.DevilishPower)) {
      let canPlayDevilishPower = false;
      if (this.gameState.hunterAlly || this.gameState.heavenlyHostLocations.length > 0) {
        canPlayDevilishPower = true;
      }
      if (!canPlayDevilishPower) {
        potentialEvents = potentialEvents.filter(card => card.name !== EventName.DevilishPower);
      }
    }
    if (potentialEvents.find(card => card.name == EventName.TimeRunsShort)) {
      let canPlayTimeRunsShort = false;
      if (this.gameState.timePhase !== 5) {
        canPlayTimeRunsShort = true;
      }
      if (!canPlayTimeRunsShort) {
        potentialEvents = potentialEvents.filter(card => card.name !== EventName.TimeRunsShort);
      }
    }
    if (potentialEvents.length == 0) {
      return null;
    }
    if (this.gameState.heavenlyHostLocations.find(location => location == this.nextMove.location)) {
      // Dracula has decided to move to a Heavenly Host location, which is only possible if he plays Devilish Power
      this.discardEvent(EventName.DevilishPower);
      this.eventAwaitingApproval = EventName.DevilishPower;
      this.gameState.eventPendingResolution = EventName.DevilishPower;
      return `Dracula played ${EventName.DevilishPower}`;
    }
    if (Math.random() < 0.2) {
      const choice = Math.floor(Math.random() * potentialEvents.length);
      this.discardEvent(potentialEvents[choice].name);
      this.eventAwaitingApproval = potentialEvents[choice].name;
      this.gameState.eventPendingResolution = potentialEvents[choice].name;
      return `Dracula played ${potentialEvents[choice].name}`;
    }
  }

  /**
   * Used when playing the Devilish Power card to remove a game component
   */
  chooseTargetForDevilishPower(): string {
    // TODO: Make logical decision
    // Which Ally is in power
    // which Allies are already in the discard
    // is there going to be a more powerful Ally that might come out?
    let options = [];
    if (this.gameState.hunterAlly) {
      options.push('discard the Hunters\' Ally');
    }
    if (this.gameState.heavenlyHostLocations.length > 0) {
      options.push(`discard the Heavenly Host in ${this.gameState.heavenlyHostLocations[0]}`);
    }
    if (this.gameState.heavenlyHostLocations.length > 1) {
      options.push(`discard the Heavenly Host in ${this.gameState.heavenlyHostLocations[1]}`);
    }
    if (this.gameState.heavenlyHostLocations.find(location => location == this.nextMove.location)) {
      // Dracula has decided to move to a Heavenly Host location, which is only possible if he plays Devilish Power
      return `Dracula played Devilish power to discard the Heavenly Host in ${this.nextMove.location.name}`;
    }
    const choice = Math.floor(Math.random() * options.length);
    this.eventAwaitingApproval = null;
    return `Dracula played Devilish power to ${options[choice]}`;
  }

  /**
   * Decides whether to replace the existing Ally with the one drawn
   * @param ally The newly drawn Ally
   */
  replaceExistingAlly(ally: Event): boolean {
    // TODO: Make logical decision
    // value order of Allies
    // consider Event card count
    if (Math.random() < 0.5) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Choose which bitten Hunter to play Night Visit on
   */
  chooseHunterToNightVisit(): string {
    // TODO: Make logical decision
    // which Hunter is closer to death
    const bittenHunters = [this.gameState.godalming, this.gameState.seward, this.gameState.vanHelsing, this.gameState.mina].filter(hunter => hunter.bites > 0);
    const choice = Math.floor(Math.random() * bittenHunters.length);
    return `Dracula pays a Night Visit to ${bittenHunters[choice].name}, costing them 2 health`;
  }

  /**
   * Chooses a victim for Quincey P. Morris
   */
  chooseVictimForQuincey(): string {
    // TODO: Make logical decision, integrate with Dracula's knowledge of Hunters' cards
    // which Hunter is closer to death
    const hunters = [this.gameState.godalming, this.gameState.seward, this.gameState.vanHelsing, this.gameState.mina];
    const huntersWithoutGuaranteedProtection = hunters.filter(hunter => !hunter.knownItems.find(item => item == ItemName.Crucifix) && !hunter.knownItems.find(item => item == ItemName.HeavenlyHost));
    if (huntersWithoutGuaranteedProtection.length == 0) {
      const choice = Math.floor(Math.random() * 4);
      return `Quincey has targeted ${hunters[choice].name}, who must show Dracula a Heavenly Host or Crucifix or suffer 1 health loss`;
    }
    const choice = Math.floor(Math.random() * huntersWithoutGuaranteedProtection.length);
    return `Quincey has targeted ${huntersWithoutGuaranteedProtection[choice].name}, who must show Dracula a Heavenly Host or Crucifix or suffer 1 health loss`;
  }

  /**
   * Decides whether or not to play Rage
   * @param hunters The potential targets
   */
  willPlayRage(hunters: Hunter[]): string {
    // TODO: Make logical decision, integrate with Dracula's knowledge of Hunters' cards
    // consider Hunter equipment
    if (!this.eventHand.find(event => event.name == EventName.Rage)) {
      return;
    }
    if (Math.random() < 0.5) {
      this.discardEvent(EventName.Rage);
      this.eventAwaitingApproval = EventName.Rage;
      this.gameState.eventPendingResolution = EventName.Rage;
      this.potentialTargetHunters = hunters;
      return 'Dracula played Rage';
    }
  }

  /**
   * Chooses a target for Rage
   */
  chooseRageVictim(): string {
    // TODO: Make logical decision, integrate with Dracula's knowledge of Hunters' cards
    // consider Hunter equipment
    const hunterChoice = Math.floor(Math.random() * this.potentialTargetHunters.length);
    const targetHunter = this.potentialTargetHunters[hunterChoice];
    const itemChoice = Math.floor(Math.random() * targetHunter.items.length);
    return `Dracula played Rage against ${targetHunter.name} and discarded ${targetHunter.items[itemChoice].name}`;
  }

  /**
   * Decides whether or not to play Relentless Minion
   */
  willPlayRelentlessMinion(): boolean {
    // TODO: Make logical decision
    // is there another minion likely to be in combat soon that would be better than this one?
    if (![Attack.DodgeMinion, Attack.Knife, Attack.Pistol, Attack.Punch, Attack.Rifle].find(attack => attack == this.lastUsedAttack)) {
      return false;
    } else {
      if (Math.random() < 0.5) {
        this.discardEvent(EventName.RelentlessMinion);
        return true;
      }
    }
  }

  /**
   * Chooses a road to block with Roadblock
   */
  chooseRoadBlockTarget(): Location[] {
    // TODO: Make logical decision
    // consider likely Hunter path
    // trail heat
    const landLocations = this.gameState.map.locations.filter(location => location.type != LocationType.sea && location.roadConnections.length > 0);
    const choice1 = Math.floor(Math.random() * landLocations.length);
    const target1 = landLocations[choice1];
    const choice2 = Math.floor(Math.random() * target1.roadConnections.length);
    const target2 = target1.roadConnections[choice2];
    return [target1, target2];
  }

  /**
   * Decides whether or not to play Seduction when a Hunter group encounters a New Vampire at night
   */
  willPlaySeduction(hunters: Hunter[]): boolean {
    if (this.eventHand.find(event => event.name == EventName.Seduction)) {
      this.eventAwaitingApproval = EventName.Seduction;
      this.gameState.eventPendingResolution = EventName.Seduction;
      this.potentialTargetHunters = hunters;
      this.discardEvent(EventName.Seduction);
      return true;
    }
    return false;
  }

  /**
   * Chooses a card to play to cancel the Hunter card just played
   * @param eventJustPlayed The Hunter Event just played
   */
  cardPlayedToCancel(eventJustPlayed: string): Event {
    // TODO: Make logical decision
    // consider if there is a better use for this cancel card
    // False Tip-Off can pretty much always be played, unless there is a better Hunter to use it on
    // check if the event just played can be cancelled
    const possibleCancellationCards: string[] = [];
    if (this.eventHand.find(event => event.name == EventName.DevilishPower)) {
      possibleCancellationCards.push(EventName.DevilishPower);
    }
    if (eventJustPlayed == EventName.CharteredCarriage && this.eventHand.find(event => event.name == EventName.FalseTipoff)) {
      possibleCancellationCards.push(EventName.FalseTipoff);
    }
    if (possibleCancellationCards.length == 0) {
      return null;
    }
    if (Math.random() > 0.5) {
      return null;
    }
    const choice = Math.floor(Math.random() * possibleCancellationCards.length);
    let eventIndex = 0;
    for (eventIndex; eventIndex < this.eventHand.length; eventIndex++) {
      if (this.eventHand[eventIndex].name == possibleCancellationCards[choice]) {
        break;
      }
    }
    const cancelCard = this.eventHand.splice(eventIndex, 1)[0];
    this.gameState.eventDiscard.push(cancelCard);
    return cancelCard;
  }

  /**
   * Decides whether to play Sensationalist Press
   */
  willPlaySensationalistPress(): boolean {
    // TODO: Make logical decision
    // consider heat of trail
    // if the location to be revealed is pretty much already known, then don't bother
    // if the Newspaper Reports would have no effect, don't bother
    if (!this.eventHand.find(event => event.name == EventName.SensationalistPress)) {
      return false;
    }
    if (Math.random() < 0.5) {
      this.discardEvent(EventName.SensationalistPress);
      this.eventAwaitingApproval = EventName.SensationalistPress;
      this.gameState.eventPendingResolution = EventName.SensationalistPress;
      return true;
    }
  }

  /**
   * Chooses which Location to keep hidden with Sensationalist Press
   */
  chooseLocationForSensationalistPress() {
    // TODO: Make logical decision
    // pretty much always going to be the oldest one in the trail
    const choice = Math.floor(Math.random() * (this.gameState.trailCardsToBeRevealed.length + this.gameState.catacombCardsToBeRevealed.length));
    if (choice < this.gameState.trailCardsToBeRevealed.length) {
      this.gameState.trailCardsToBeRevealed.splice(choice, 1);
    } else {
      this.gameState.catacombCardsToBeRevealed.splice(choice - this.gameState.trailCardsToBeRevealed.length, 1);
    }
  }

  /**
   * Chooses which bitten Hunter to influence with Vampiric Influence
   */
  chooseHunterToInfluence(): Hunter {
    // TODO: Make logical decision
    // consider what is known about Hunter equipment
    const bittenHunters = [this.gameState.godalming, this.gameState.seward, this.gameState.vanHelsing, this.gameState.mina].filter(hunter => hunter.bites > 0);
    const choice = Math.floor(Math.random() * bittenHunters.length);
    return bittenHunters[choice];
  }

  /**
   * Decides whether to play Wild horses on a Hunter
   * @param hunters The Hunters entering combat with Dracula
   */
  willPlayWildHorses(hunters: Hunter[]): boolean {
    // TODO: Make logical decision
    // consider if combat is desirable or not with this Hunter
    if (!this.eventHand.find(event => event.name == EventName.WildHorses)) {
      return false;
    }
    if (Math.random() < 0.5) {
      this.gameState.eventPendingResolution = EventName.WildHorses;
      this.eventAwaitingApproval = EventName.WildHorses;
      this.potentialTargetHunters = hunters;
      return true;
    }
    return false;
  }

  /**
   * Chooses where to send a Hunter with Wild Horses
   */
  chooseWildHorsesLocation(): Location {
    // TODO: Make logical decision
    // consider Encounters nearby, Fog, Roadblock
    const choice = Math.floor(Math.random() * this.potentialTargetHunters[0].currentLocation.roadConnections.length);
    return this.potentialTargetHunters[0].currentLocation.roadConnections[choice];
  }

  /**
   * Calculates a value for a given possible move
   * @param possibleMove The move to evaluate
   */
  evaluateMove(possibleMove: PossibleMove): number {
    // things to consider
    // if the trail is all unknown, it is best to stay hidden
    // moving to sea is bad
    // fighting a Hunter is okay if they don't have good gear, but staying hidden is more valuable
    // clearing the trail doesn't mean that the Hunters won't remember any revealed cards that were there
    // using powers costs blood
    // double back is good for keeping a trail short, like after a Vampire is matured or at the start of the game
    // but shouldn't be used if there's a Vampire about to drop off the trail
    // Hunters with no gear will favour large cities, so smaller cities are best for avoiding them
    // cities with more road connections make the trail harder to predict
    // cities with rail connections are easier to get to quicker, which is particularly bad when Dracula's whereabouts is known
    // Feed and Hide are brilliant for staying put, which is especially good when the trail is cold
    // if a Hunter's next move is known, it should be considered here

    const location = possibleMove.location || this.currentLocation;
    const distanceToNearestHunter = Math.min(
      this.gameState.map.distanceBetweenLocations(location, this.gameState.godalming.currentLocation),
      this.gameState.map.distanceBetweenLocations(location, this.gameState.seward.currentLocation),
      this.gameState.map.distanceBetweenLocations(location, this.gameState.vanHelsing.currentLocation),
      this.gameState.map.distanceBetweenLocations(location, this.gameState.mina.currentLocation)
    );
    return Math.pow(possibleMove.value * distanceToNearestHunter / 3, 1.2);
  }

  /**
   * Updates the Items that Dracula knows a Hunter has after they show him one
   * @param hunter The Hunter showing Dracula an Item
   * @param eventName The name of the Item shown
   */
  updateEventTrackingFromShown(hunter: Hunter, eventName: string) {
    if (!hunter.knownEvents.find(item => item == eventName)) {
      hunter.knownEvents.push(eventName);
    }
  }

  /**
   * Updates the Items that Dracula knows a Hunter has after they show him one
   * @param hunter The Hunter showing Dracula an Item
   * @param itemName The name of the Item shown
   */
  updateItemTrackingFromShown(hunter: Hunter, itemName: string, offset: number = 0) {
    if (!hunter.knownItems.find(item => item == itemName)) {
      hunter.knownItems.push(itemName);
      const alreadyPossibleItem = hunter.possibleItems.find(possibleItem => possibleItem.item == itemName);
      if (alreadyPossibleItem) {
        const totalCards = hunter.items.length - offset;
        const unknownCards = totalCards - hunter.knownItems.length;
        alreadyPossibleItem.chance *= unknownCards / totalCards;
      }
    }
  }

  /**
   * Updates the Items the Dracula knows the Hunters have after a round of combat
   * @param hunters The Hunters in combat
   * @param items The Items used by the Hunters
   */
  updateItemTrackingFromCombat(hunters: Hunter[], items: string[]) {
    for (let i = 0; i < hunters.length; i++) {
      if (items[i] == 'Dodge' || items[i] == 'Punch' || items[i] == 'Escape') {
        continue;
      }
      this.updateItemTrackingFromShown(hunters[i], items[i], -3);
      if (hunters[i].lastUsedCombatItem == items[i]) {
        if (hunters[i].knownItems.find(item => item == items[i]).length < 2) {
          hunters[i].knownItems.push(items[i]);
          const alreadyPossibleItem = hunters[i].possibleItems.find(possibleItem => possibleItem.item == items[i]);
          if (alreadyPossibleItem) {
            const totalCards = hunters[i].items.length - 3;
            const unknownCards = totalCards - hunters[i].knownItems.length;
            alreadyPossibleItem.chance *= unknownCards / totalCards;
          }
        }
      }
    }
  }

  updateItemTrackingFromTrade(fromHunter: Hunter, toHunter: Hunter) {
    const fromHunterItemCount = fromHunter.items.length + 1;
    const fromHunterNumberOfKnownItems = fromHunter.knownItems.length;
    const fromHunterNumberOfDifferentKnownItemTypes = _.uniq(fromHunter.knownItems).length;
    let fromHunterAllItemsAreTheSame = false;

    if (fromHunterNumberOfKnownItems == fromHunterItemCount && fromHunterNumberOfDifferentKnownItemTypes == 1) {
      fromHunterAllItemsAreTheSame = true;
    }

    if (fromHunterAllItemsAreTheSame) {
      // take one from fromHunter and give it to toHunter
      toHunter.knownItems.push(fromHunter.knownItems.splice(0, 1)[0]);
    } else {
      // convert each fromHunter known item into a possible item with 100% chance
      let knownItemTypesProcessed: string[] = [];
      fromHunter.knownItems.forEach(knownItem => {
        // if we haven't already done this for one known item, since only one can be traded at a time
        if (!knownItemTypesProcessed.find(item => item == knownItem)) {
          knownItemTypesProcessed.push(knownItem);
          const alreadyPossibleItem = fromHunter.possibleItems.find(possibleItem => possibleItem.item == knownItem);
          if (alreadyPossibleItem) {
            alreadyPossibleItem.chance += 1;
          } else {
            fromHunter.possibleItems.push({ item: knownItem, chance: 1 });
          }
        }
      });
      // calculate the cardChance as 1 / total cards
      const cardChance = 1 / fromHunterItemCount;
      // "give" each possible item to toHunter as a possible with cardChance
      fromHunter.possibleItems.forEach(possItem => {
        const alreadyPossibleItem = toHunter.possibleItems.find(possibleItem => possibleItem.item == possItem.item);
        if (alreadyPossibleItem) {
          alreadyPossibleItem.chance += possItem.chance * cardChance;
        } else {
          toHunter.possibleItems.push({ item: possItem.item, chance: possItem.chance * cardChance });
        }
        // update each fromHunter possible card with remaining percentage
        possItem.chance /= cardChance;
      });
    }
  }

  /**
   * Updates Dracula's tracking of known Hunter Items after a Hunter discards one
   * @param hunter The Hunter discarding the Item
   * @param itemName The Item discarded
   */
  updateItemTrackingFromDiscard(hunter: Hunter, itemName: string) {
    let itemIndex = 0;
    for (itemIndex; itemIndex < hunter.knownItems.length; itemIndex++) {
      if (hunter.knownItems[itemIndex] == itemName) {
        break;
      }
    }
    if (itemIndex < hunter.knownItems.length) {
      hunter.knownItems.splice(itemIndex, 1);
    }
    const totalItems = hunter.items.length - (hunter.inCombat ? 3 : 0);
    const unaccountedItems = totalItems - hunter.knownItems.length;
    hunter.possibleItems.forEach(possItem => {
      possItem.chance *= unaccountedItems / totalItems;
    });
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

export enum Attack {
  Claws = 'Claws',
  DodgeDracula = 'Dodge (Dracula)',
  EscapeMan = 'Escape (Man)',
  EscapeBat = 'Escape (Bat)',
  EscapeMist = 'Escape (Mist)',
  Fangs = 'Fangs',
  Mesmerize = 'Mesmerize',
  Strength = 'Strength',
  DodgeMinion = 'Dodge (Minion)',
  Punch = 'Punch',
  Knife = 'Knife',
  Pistol = 'Pistol',
  Rifle = 'Rifle'
}
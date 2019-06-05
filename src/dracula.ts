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
  droppedOffEncounter: Encounter;
  ambushEncounter: Encounter;
  ambushHunter: Hunter;
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

  constructor() {
    this.blood = 15;
    this.revealed = false;
    this.encounterHandSize = 5;
    this.encounterHand = [];
    this.eventHand = [];
    this.eventHandSize = 4;
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
    return validLocations[index];
  }

  /**
   * Decides Dracula's next move based on the current state of the game
   */
  chooseNextMove(): string {
    if (!this.hypnosisInEffect) {
      this.nextMove = null;
    }
    this.possibleMoves = [];
    const connectedLocations = _.union(this.currentLocation.roadConnections, this.currentLocation.seaConnections);
    let invalidLocations = this.gameState.trail.filter(trail => trail.location).map(trail => trail.location);
    invalidLocations.push(this.gameState.map.locations.find(location => location.type == LocationType.hospital), this.gameState.consecratedLocation);
    if (this.gameState.stormRounds > 0) {
      invalidLocations.push(this.gameState.stormLocation);
    }
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
    const validLocations = _.without(connectedLocations, ...invalidLocations, this.gameState.map.locations.find(location => location.type == LocationType.hospital));
    validLocations.map(location => {
      let catacombIndex = this.gameState.catacombs.length - 1;
      for (catacombIndex; catacombIndex > -1; catacombIndex--) {
        if (this.gameState.catacombs[catacombIndex].location == location) {
          break;
        }
      }
      if (catacombIndex > -1) {
        this.possibleMoves.push({ location, value: 1, catacombToDiscard: catacombIndex });
      } else {
        this.possibleMoves.push({ location, value: 1 })
      }
    });

    const possiblePowers = this.powers.slice(0, 5).filter(power => (power.nightOnly == false || this.gameState.timePhase > 2) && power.cost < this.blood && this.currentLocation.type !== LocationType.sea);
    const invalidPowers: Power[] = [];
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
          this.possibleMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.DoubleBack:
          this.gameState.trail.concat(this.gameState.catacombs).forEach(trailCard => {
            if (this.gameState.map.distanceBetweenLocations(this.currentLocation, trailCard.location, [TravelMethod.road, TravelMethod.sea]) == 1) {
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
          potentialDestinations = this.currentLocation.roadConnections.filter(road => !this.gameState.cityIsConsecrated(road));
          potentialDestinations.forEach(dest => secondLayerDestination.push(...dest.roadConnections));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => !this.gameState.trailContains(dest) && !this.gameState.catacombsContains(dest) && !this.gameState.cityIsConsecrated(dest));
          potentialDestinations = _.without(potentialDestinations, this.currentLocation);
          potentialDestinations.forEach(dest => this.possibleMoves.push({ power: validPower, location: dest, value: 1 }));
          break;
        case PowerName.WolfFormAndDoubleBack:
          potentialDestinations = this.currentLocation.roadConnections;
          potentialDestinations.forEach(dest => secondLayerDestination = secondLayerDestination.concat(dest.roadConnections));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => (this.gameState.trailContains(dest) || this.gameState.catacombsContains(dest)) && !this.gameState.cityIsConsecrated(dest));
          potentialDestinations.forEach(dest => this.possibleMoves.push({ power: validPower, location: dest, value: 1 }));
          break;
        case PowerName.WolfFormAndHide:
          this.possibleMoves.push({ power: validPower, value: 1 });
          break;
      }
    });
    if (this.possibleMoves.length > 0) {
      if (this.hypnosisInEffect) {
        if (this.possibleMoves.find(move => move.catacombToDiscard == this.nextMove.catacombToDiscard
          && move.location == this.nextMove.location && move.power.name == this.nextMove.power.name)) {
            return 'Dracula is bound by Hypnosis';
          }
        }
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
    const randomChoice = Math.floor(Math.random() * this.encounterHand.length);
    return this.encounterHand.splice(randomChoice, 1)[0];
  }

  /**
   * Chooses which Encounter to place on a catacombs card
   */
  chooseEncounterForCatacombs(): Encounter {
    // TODO: make logical decision
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
    this.gameState.log(this.drawUpEncounters(this.gameState.encounterPool));
    this.encounterHandSize -= 10;
    this.gameState.log(this.discardDownEncounters(this.gameState.encounterPool));
    this.gameState.log(this.gameState.shuffleEncounters());
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
    return drawCount > 0 ? `Dracula drew ${drawCount} encounter${drawCount > 1 ? 's' : ''}` : '';
  }

  /**
   * Discards Encounters down to Dracula's hand limit
   * @param encounters The pool of Encounter to which to discard
   */
  discardDownEncounters(encounters: Encounter[]): string {
    // TODO: Make logical decision
    let discardCount = 0;
    while (this.encounterHand.length > this.encounterHandSize) {
      const choice = Math.floor(Math.random() * this.encounterHand.length);
      encounters.push(this.encounterHand.splice(choice, 1)[0]);
      discardCount++;
    }
    return discardCount > 0 ? `Dracula discarded ${discardCount} encounter${discardCount > 1 ? 's' : ''}` : '';
  }

  /**
   * Discards Events down to Dracula's hand limit
   * @param events The pool of Events to which to discard
   */
  discardDownEvents(events: Event[]): string {
    // TODO: Make logical decision
    let discardCount = 0;
    while (this.eventHand.length > this.eventHandSize) {
      const choice = Math.floor(Math.random() * this.eventHand.length);
      events.push(this.eventHand.splice(choice, 1)[0]);
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
  }

  /**
   * Decides which Encounter to keep on a Catacomb card to which Dracula has Doubled Back
   * @param card The catacomb card
   */
  decideWhichEncounterToKeep(card: TrailCard): string {
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
      this.gameState.encounterPool.push(card.encounter);
      card.encounter = card.catacombEncounter;
      delete card.catacombEncounter;
      this.gameState.shuffleEncounters();
    } else {
      this.gameState.encounterPool.push(card.catacombEncounter);
      delete card.catacombEncounter;
      this.gameState.shuffleEncounters();
    }
    return 'Dracula kept the one encounter from the catacomb card and discarded the other';
  }

  /**
   * Decides what to do with a card that has dropped off the end of the trail
   * @param droppedOffCard The card that has dropped off
   */
  decideFateOfDroppedOffCard(droppedOffCard: TrailCard): string {
    // TODO: make logical decision
    if (droppedOffCard.location) {
      if (Math.random() < 0.2 && this.gameState.catacombs.length < 3 && droppedOffCard.location.type !== LocationType.sea) {
        droppedOffCard.catacombEncounter = this.chooseEncounterForCatacombs();
        this.gameState.catacombs.push(droppedOffCard);
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
   */
  evaluateCatacombs(): string {
    // TODO: make logical decision
    let catacombToDiscard: number;
    if (this.nextMove) {
      catacombToDiscard = this.nextMove.catacombToDiscard || -1;
    }
    let logMessage = '';
    for (let i = this.gameState.catacombs.length - 1; i >= 0; i--) {
      if (Math.random() < 0.2 || i == catacombToDiscard || (!this.gameState.catacombs[i].encounter && !this.gameState.catacombs[i].catacombEncounter)) {
        logMessage += logMessage ? ` and position ${i + 1}` : `Dracula discarded catacomb card from position ${i + 1}`;
        if (this.gameState.catacombs[i].encounter) {
          this.gameState.encounterPool.push(this.gameState.catacombs[i].encounter);
        }
        if (this.gameState.catacombs[i].catacombEncounter) {
          this.gameState.encounterPool.push(this.gameState.catacombs[i].catacombEncounter);
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
    console.log(this.gameState.trail);
    while (this.gameState.trail.length > remainingCards) {
      console.log(`Looking at index ${cardIndex}`);
      if (this.gameState.trail[cardIndex].location !== this.currentLocation) {
        const cardToClear = this.gameState.trail.splice(cardIndex, 1)[0];
        if (cardToClear.location) {
          console.log(`Removed location card ${cardToClear.location.name}`);
          cardsCleared++;
        }
        if (cardToClear.power) {
          console.log(`Removed power card ${cardToClear.power.name}`);
          cardsCleared++;
        }
        if (cardToClear.encounter) {
          console.log(`Removed encounter ${cardToClear.encounter.name}`);
          encountersCleared++;
          this.gameState.encounterPool.push(cardToClear.encounter);
          this.gameState.shuffleEncounters();
        }
      }
      console.log(`${this.gameState.trail.length} cards left in trail`);
      cardIndex--;
    }
    console.log('Done');
    return `Returned ${cardsCleared} cards and ${encountersCleared} encounters`;
  }

  /**
   * Decides what to do with an Encounter that has dropped off the end of the trail
   */
  decideFateOfDroppedOffEncounter(): string {
    // TODO: Make logical decision
    let logMessage = 'Dracula returned the dropped off encounter to the encounter pool';
    switch (this.droppedOffEncounter.name) {
      case EncounterName.Ambush:
        if (this.willMatureAmbush()) {
          this.chooseAmbushEncounter();
          if (this.ambushEncounter) {
            logMessage = `Dracula matured Ambush and played ${this.ambushEncounter.name} on ${this.ambushHunter.name}`;
            this.clearTrail(3);
          }
        }
        break;
      case EncounterName.DesecratedSoil:
        if (this.willMatureDesecratedSoil()) {
          logMessage = 'Dracula matured Desecrated soil. Draw event cards, discarding Hunter events until two Dracula event cards have been drawn.';
          this.clearTrail(3);
        }
        break;
      case EncounterName.NewVampire:
        logMessage = 'Dracula matured New Vampire';
        this.gameState.setVampireTrack(this.gameState.vampireTrack + 2);
        this.clearTrail(1);
        break;
    }
    this.gameState.encounterPool.push(this.droppedOffEncounter);
    this.gameState.log(this.gameState.shuffleEncounters());
    this.droppedOffEncounter = null;
    return logMessage;
  }

  /**
   * Decides whether or not to mature Ambush
   */
  willMatureAmbush(): boolean {
    // TODO: make logical decision
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
    if (Math.random() < 0.5) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Chooses a Hunter and an Encounter to play when maturing an Ambush Encounter
   */
  chooseAmbushEncounter() {
    const validHunters = [this.gameState.godalming, this.gameState.seward, this.gameState.vanHelsing, this.gameState.mina]
      .filter(hunter => hunter.currentLocation.type !== LocationType.sea && hunter.currentLocation.type !== LocationType.hospital);
    if (validHunters.length == 0) {
      this.ambushEncounter = null;
      this.ambushHunter = null;
      return;
    }
    const encounterChoice = Math.floor(Math.random() * this.encounterHand.length);
    this.ambushEncounter = this.encounterHand.splice(encounterChoice, 1)[0];
    const hunterChoice = Math.floor(Math.random() * validHunters.length);
    this.ambushHunter = validHunters[hunterChoice];
  }

  /**
   * Chooses which combat card to use in the current round of combat
   * @param hunters The Hunters involved in the combat
   */
  chooseCombatCardAndHunter(hunters: Hunter[]): string {
    // TODO: Make logical descision
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
    return `Dracula chose ${allowedAttacks[attackChoice]} against ${hunters[targetChoice]}`;
  }

  /**
   * Selects a destination for Escape as Bat
   * @param possibleDestinations The list of possible Locations
   */
  chooseBatDestination(possibleDestinations: Location[]): Location {
    // TODO: Make logical decision
    const choice = Math.floor(Math.random() * possibleDestinations.length);
    return possibleDestinations[choice];
  }

  /**
   * Chooses whether to play Control Storms on the set of Hunters
   * @param hunters The Hunters potentially affected
   */
  chooseControlStormsDestination(hunters: Hunter[]): Location {
    // TODO: Make logical decision
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
  chooseStartOfTurnEvent(): string {
    // TODO: Make logical decision
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
    if (potentialEvents.length == 0) {
      return null;
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
    const bittenHunters = [this.gameState.godalming, this.gameState.seward, this.gameState.vanHelsing, this.gameState.mina].filter(hunter => hunter.bites > 0);
    const choice = Math.floor(Math.random() * bittenHunters.length);
    return `Dracula pays a Night Visit to ${bittenHunters[choice].name}, costing them 2 health`;
  }

  /**
   * Chooses a victim for Quincey P. Morris
   */
  chooseVictimForQuincey(): string {
    // TODO: Make logical decision, integrate with Dracula's knowledge of Hunters' cards
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
    // TODO: Make logical decision; spoiler: always do this
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
    const choice = Math.floor(Math.random() * this.potentialTargetHunters[0].currentLocation.roadConnections.length);
    return this.potentialTargetHunters[0].currentLocation.roadConnections[choice];
  }

  /**
   * Calculates a value for a given possible move
   * @param possibleMove The move to evaluate
   */
  evaluateMove(possibleMove: PossibleMove): number {
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
      fromHunter.knownItems.forEach(knownItem => {
        const alreadyPossibleItem = fromHunter.possibleItems.find(possibleItem => possibleItem.item == knownItem);
        if (alreadyPossibleItem) {
          alreadyPossibleItem.chance += 1;
        } else {
          fromHunter.possibleItems.push({ item: knownItem, chance: 1 });
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
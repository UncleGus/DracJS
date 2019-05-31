import * as _ from 'lodash';
import { Location, LocationType, LocationDomain, TravelMethod } from "./map";
import { Game } from "./game";
import { Encounter, EncounterName } from "./encounter";
import { Event, EventName } from "./event";
import { Hunter } from "./hunter";

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
  lastPlayedEvent: string;
  eventAwaitingApproval: string;
  potentialTargetHunters: Hunter[];
  hypnosisInEffect: boolean;

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
    const randomChoice = Math.floor(Math.random() * furthestDistanceIndices.length);
    const randomIndex = furthestDistanceIndices[randomChoice];
    return validLocations[randomIndex];
  }

  /**
   * Chooses a Location to move to when Evade is resolved
   * @param gameState 
   */
  chooseEvasionDestination(gameState: Game): Location {
    // TODO: improve logic
    const validLocations = gameState.map.locations.filter(location =>
      (location.type == LocationType.smallCity || location.type == LocationType.largeCity) && !gameState.trailContains(location));
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
    const randomChoice = Math.floor(Math.random() * furthestDistanceIndices.length);
    const randomIndex = furthestDistanceIndices[randomChoice];
    return validLocations[randomIndex];
  }

  /**
   * Decides Dracula's next move based on the current state of the game
   * @param gameState The state of the game
   */
  chooseNextMove(gameState: Game): string {
    // TODO: make logical decision
    if (!this.hypnosisInEffect) {
      this.nextMove = null;
    }
    this.possibleMoves = [];
    const connectedLocations = _.union(this.currentLocation.roadConnections, this.currentLocation.seaConnections);
    let invalidLocations = gameState.trail.filter(trail => trail.location).map(trail => trail.location);
    invalidLocations.push(gameState.map.locations.find(location => location.type == LocationType.hospital), gameState.consecratedLocation);
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
      let catacombIndex = gameState.catacombs.length - 1;
      for (catacombIndex; catacombIndex > -1; catacombIndex--) {
        if (gameState.catacombs[catacombIndex].location == location) {
          break;
        }
      }
      if (catacombIndex > -1) {
        this.possibleMoves.push({ location, value: 1, catacombToDiscard: catacombIndex });
      } else {
        this.possibleMoves.push({ location, value: 1 })
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
      switch (validPower.name) {
        case PowerName.DarkCall:
          this.possibleMoves.push({ power: validPower, value: 1 });
          break;
        case PowerName.DoubleBack:
          gameState.trail.concat(gameState.catacombs).forEach(trailCard => {
            if (gameState.map.distanceBetweenLocations(this.currentLocation, trailCard.location, [TravelMethod.road, TravelMethod.sea]) == 1) {
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
          potentialDestinations = this.currentLocation.roadConnections.filter(road => !gameState.cityIsConsecrated(road));
          potentialDestinations.forEach(dest => secondLayerDestination.push(...dest.roadConnections));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => !gameState.trailContains(dest) && !gameState.catacombsContains(dest) && !gameState.cityIsConsecrated(dest));
          potentialDestinations = _.without(potentialDestinations, this.currentLocation);
          potentialDestinations.forEach(dest => this.possibleMoves.push({ power: validPower, location: dest, value: 1 }));
          break;
        case PowerName.WolfFormAndDoubleBack:
          potentialDestinations = this.currentLocation.roadConnections;
          potentialDestinations.forEach(dest => secondLayerDestination = secondLayerDestination.concat(dest.roadConnections));
          potentialDestinations = _.union(potentialDestinations, secondLayerDestination);
          potentialDestinations = _.uniq(potentialDestinations);
          potentialDestinations = potentialDestinations.filter(dest => (gameState.trailContains(dest) || gameState.catacombsContains(dest)) && !gameState.cityIsConsecrated(dest));
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

  decideBatsDestination(hunter: Hunter, gameState: Game): Location {
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
   * Plays Event of the given name from Dracula's hand
   * @param eventName The name of the Event to discard
   * @param events The pool of Events to which to discard
   */
  playEvent(eventName: string, events: Event[]) {
    this.lastPlayedEvent = eventName;
    this.discardEvent(eventName, events);
  }

  /**
   * Discards Event of the given name from Dracula's hand
   * @param eventName The name of the Event to discard
   * @param events The pool of Events to which to discard
   */
  discardEvent(eventName: string, events: Event[]) {
    let eventIndex = 0;
    for (eventIndex; eventIndex < this.eventHand.length; eventIndex++) {
      if (this.eventHand[eventIndex].name == eventName) {
        break;
      }
    }
    if (eventIndex > this.eventHand.length) {
      return;
    }
    events.push(this.eventHand.splice(eventIndex, 1)[0]);
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
        droppedOffCard.catacombEncounter = this.chooseEncounterForCatacombs();
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
    for (let i = gameState.catacombs.length - 1; i >= 0; i--) {
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
    let logMessage = 'Dracula returned the dropped off encounter to the encounter pool';
    switch (this.droppedOffEncounter.name) {
      case EncounterName.Ambush:
        if (this.willMatureAmbush(gameState)) {
          this.chooseAmbushEncounter(gameState);
          if (this.ambushEncounter) {
            logMessage = `Dracula matured Ambush and played ${this.ambushEncounter.name} on ${this.ambushHunter.name}`;
            this.clearTrail(gameState, 3);
          }
        }
        break;
      case EncounterName.DesecratedSoil:
        if (this.willMatureDesecratedSoil(gameState)) {
          logMessage = 'Dracula matured Desecrated soil. Draw event cards, discarding Hunter events until two Dracula event cards have been drawn.';
          this.clearTrail(gameState, 3);
        }
        break;
      case EncounterName.NewVampire:
        logMessage = 'Dracula matured New Vampire';
        gameState.setVampireTrack(gameState.vampireTrack + 2);
        this.clearTrail(gameState, 1);
        break;
    }
    gameState.encounterPool.push(this.droppedOffEncounter);
    gameState.log(gameState.shuffleEncounters());
    this.droppedOffEncounter = null;
    return logMessage;
  }

  /**
   * Decides whether or not to mature Ambush Soil
   * @param gameState The state of the game
   */
  willMatureAmbush(gameState: Game): boolean {
    // TODO: make logical decision
    if (Math.random() < 0.5) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Decides whether or not to mature Desecrated Soil
   * @param gameState The state of the game
   */
  willMatureDesecratedSoil(gameState: Game): boolean {
    // TODO: make logical decision
    if (Math.random() < 0.5) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Chooses a Hunter and an Encounter to play when maturing an Ambush Encounter
   * @param gameState The state of the game
   */
  chooseAmbushEncounter(gameState: Game) {
    const validHunters = [gameState.godalming, gameState.seward, gameState.vanHelsing, gameState.mina]
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
   * @param gameState The state of the game
   */
  chooseCombatCardAndHunter(hunters: Hunter[], gameState: Game): string {
    // TODO: Make logical descision
    let allowedAttacks = _.without(this.availableAttacks, this.lastUsedAttack);
    if (this.repelled) {
      allowedAttacks = _.without(this.availableAttacks, Attack.Claws, Attack.Fangs, Attack.Mesmerize, Attack.Strength);
    }
    if (gameState.rageRounds > 0) {
      allowedAttacks = _.without(this.availableAttacks, Attack.EscapeBat, Attack.EscapeMan, Attack.EscapeMist);
      gameState.rageRounds -= 1;
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
   * @gameState The state of the game
   */
  chooseBatDestination(possibleDestinations: Location[], gameState: Game): Location {
    // TODO: Make logical decision
    const choice = Math.floor(Math.random() * possibleDestinations.length);
    return possibleDestinations[choice];
  }

  /**
   * Chooses whether to play Control Storms on the set of Hunters
   * @param hunters The Hunters potentially affected
   * @param gameState The state of the game
   */
  chooseControlStormsDestination(hunters: Hunter[], gameState: Game): Location {
    // TODO: Make logical decision
    if (this.eventHand.find(event => event.name == EventName.ControlStorms)) {
      if (Math.random() < 0.5) {
        const destinations = gameState.map.portsWithinRange(hunters[0].currentLocation, 4);
        if (destinations.length > 0) {
          const choice = Math.floor(Math.random() * destinations.length);
          this.playEvent(EventName.ControlStorms, gameState.eventDiscard);
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
   * @param gameState The state of the game
   */
  willPlayCustomsSearch(hunter: Hunter, previousLocation: Location, gameState: Game): boolean {
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
    const trailCard = gameState.trail.find(trail => trail.location == hunter.currentLocation);
    if (trailCard) {
      if (trailCard.encounter) {
        canPlayCustomsSearch = false;
      }
    }
    const catacombsCard = gameState.catacombs.find(catacomb => catacomb.location == hunter.currentLocation);
    if (catacombsCard) {
      if (catacombsCard.encounter || catacombsCard.catacombEncounter) {
        canPlayCustomsSearch = false;
      }
    }
    if (!canPlayCustomsSearch) {
      return false;
    }
    if (Math.random() < 0.5) {
      this.playEvent(EventName.CustomsSearch, gameState.eventDiscard);
      return true;
    }
  }

  /**
   * Decides whether to cancel a played Event with Devilish Power
   * @param event The Event being played
   * @param gameState The state of the game
   */
  willPlayDevilishPowerToCancel(event: Event, gameState: Game): boolean {
    // TODO: Make logical decision
    if (!this.eventHand.find(event => event.name == EventName.DevilishPower)) {
      return false;
    }
    if (Math.random() < 0.25) {
      this.playEvent(EventName.DevilishPower, gameState.eventDiscard);
      return true;
    }
  }

  /**
   * Decides whether to cancel a played Event with False Tip-off
   * @param event The Event being played
   * @param gameState The state of the game
   */
  willPlayFalseTipOffToCancel(event: Event, gameState: Game): boolean {
    // TODO: Make logical decision
    if (!this.eventHand.find(event => event.name == EventName.FalseTipoff)) {
      return false;
    }
    if (event.name !== EventName.CharteredCarriage) {
      return false;
    }
    if (Math.random() < 0.25) {
      this.playEvent(EventName.FalseTipoff, gameState.eventDiscard);
      return true;
    }
  }

  /**
   * Decides whether to play False Tip-off on a Hunter or group
   * @param hunters The Hunters attempting to catch a train
   * @param gameState The state of the game
   */
  willPlayFalseTipoff(hunters: Hunter[], gameState: Game): boolean {
    // TODO: Make logical decision
    if (this.eventHand.find(event => event.name == EventName.FalseTipoff)) {
      if (Math.random() < 0.25) {
        this.playEvent(EventName.FalseTipoff, gameState.eventDiscard);
        return true;
      }
      return false;
    }
  }

  /**
   * Decides which Event, if any, to play at the start of Dracula's turn
   * @param gameState The state of the game
   */
  chooseStartOfTurnEvent(gameState: Game): string {
    // TODO: Make logical decision
    if (this.eventAwaitingApproval) {
      return;
    }
    let potentialEvents = this.eventHand.filter(card => card.name
      == EventName.DevilishPower);
    // || card.name == EventName.Roadblock
    // || card.name == EventName.TimeRunsShort
    // || card.name == EventName.UnearthlySwiftness);
    if (potentialEvents.find(card => card.name == EventName.DevilishPower)) {
      let canPlayDevilishPower = false;
      if (gameState.hunterAlly || gameState.heavenlyHostLocations.length > 0) {
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
      this.playEvent(potentialEvents[choice].name, gameState.eventDiscard);
      this.eventAwaitingApproval = potentialEvents[choice].name;
      return `Dracula played ${potentialEvents[choice].name}`;
    }
  }

  /**
   * Used when playing the Devilish Power card to remove a game component
   * @param gameState The state of the game
   */
  chooseTargetForDevilishPower(gameState: Game): string {
    // TODO: Make logical decision
    let options = [];
    if (gameState.hunterAlly) {
      options.push('discard the Hunters\' Ally');
    }
    if (gameState.heavenlyHostLocations.length > 0) {
      options.push(`discard the Heavenly Host in ${gameState.heavenlyHostLocations[0]}`);
    }
    if (gameState.heavenlyHostLocations.length > 1) {
      options.push(`discard the Heavenly Host in ${gameState.heavenlyHostLocations[1]}`);
    }
    const choice = Math.floor(Math.random() * options.length);
    this.lastPlayedEvent = this.eventAwaitingApproval;
    this.eventAwaitingApproval = null;
    return `Dracula played Devilish power to ${options[choice]}`;
  }

  /**
   * Decides whether to replace the existing Ally with the one drawn
   * @param ally The newly drawn Ally
   * @param gameState The state of the game
   */
  replaceExistingAlly(ally: Event, gameState: Game): boolean {
    // TODO: Make logical decision
    if (Math.random() < 0.5) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Choose which bitten Hunter to play Night Visit on
   * @param gameState The state of the game
   */
  chooseHunterToNightVisit(gameState: Game): string {
    // TODO: Make logical decision
    const bittenHunters = [gameState.godalming, gameState.seward, gameState.vanHelsing, gameState.mina].filter(hunter => hunter.bites > 0);
    const choice = Math.floor(Math.random() * bittenHunters.length);
    return `Dracula pays a Night Visit to ${bittenHunters[choice].name}, costing them 2 health`;
  }

  /**
   * Chooses a victim for Quincey P. Morris
   * @param gameState The state of the game
   */
  chooseVictimForQuincey(gameState: Game): string {
    // TODO: Make logical decision, integrate with Dracula's knowledge of Hunters' cards
    const hunters = [gameState.godalming, gameState.seward, gameState.vanHelsing, gameState.mina];
    const choice = Math.floor(Math.random() * 4);
    return `Quincey has targeted ${hunters[choice].name}, who must show Dracula a Heavenly Host or Crucifix or suffer 1 health loss`;
  }

  willPlayRage(hunters: Hunter[], gameState: Game): string {
    // TODO: Make logical decision, integrate with Dracula's knowledge of Hunters' cards
    if (!this.eventHand.find(event => event.name == EventName.Rage)) {
      return;
    }
    if (Math.random() < 0.5) {
      this.playEvent(EventName.Rage, gameState.eventDiscard);
      this.eventAwaitingApproval = EventName.Rage;
      this.potentialTargetHunters = hunters;
      return 'Dracula played Rage';
    }
  }

  chooseRageVictim(gameState: Game): string {
    // TODO: Make logical decision, integrate with Dracula's knowledge of Hunters' cards
    const hunterChoice = Math.floor(Math.random() * this.potentialTargetHunters.length);
    const targetHunter = this.potentialTargetHunters[hunterChoice];
    const itemChoice = Math.floor(Math.random() * targetHunter.items.length);
    return `Dracula played Rage against ${targetHunter.name} and discarded ${targetHunter.items[itemChoice].name}`;
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
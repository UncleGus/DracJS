import * as _ from 'lodash';
import { GameMap, LocationType, Location, LocationName, LocationDomain, TravelMethod } from "./map";
import { Dracula, TrailCard, PowerName, Attack } from "./dracula";
import { Hunter, HunterName } from "./hunter";
import { Encounter, initialiseEncounterPool, EncounterName } from "./encounter";
import { Item, initialiseItemDeck, ItemName } from "./item";
import { Event, initialiseEventDeck, EventType, EventName, resolveEvent } from "./event";
import { getHunterSuccessCombatOutcome, CombatOutcome, getEnemySuccessCombatOutcome } from "./combat";

export class Game {
  map: GameMap;
  encounterPool: Encounter[];
  itemDeck: Item[];
  itemDiscard: Item[];
  itemInTrade: Item;
  eventDeck: Event[];
  eventDiscard: Event[];
  consecratedLocation: Location;
  heavenlyHostLocations: Location[];
  hunterAlly: Event;
  draculaAlly: Event;
  dracula: Dracula;
  godalming: Hunter;
  seward: Hunter;
  vanHelsing: Hunter;
  mina: Hunter;
  logText: string;
  logVerboseText: string;
  timePhase: number;
  vampireTrack: number;
  resolveTrack: number;
  trail: TrailCard[];
  catacombs: TrailCard[];
  selectedTrailEncounter: number;
  selectedCatacombEncounterA: number;
  selectedCatacombEncounterB: number;
  selectedAmbushEncounter: boolean;
  roundsContinued: number;
  rageRounds: number;
  roadBlock: Location[];
  eventPendingResolution: string;
  hiredScoutsInEffect: boolean;
  goodLuckInEffect: boolean;
  trailCardsToBeRevealed: number[];
  catacombCardsToBeRevealed: number[];
  stormySeasInEffect: boolean;
  stormRounds: number;
  stormLocation: Location;
  hunterWhoPlayedEvent: Hunter;
  unearthlySwiftnessInEffect: boolean;
  vampireLairInEffect: boolean;
  opponent: string;
  fromHunter: Hunter;

  constructor() {
    // construct game components
    this.map = new GameMap();
    this.encounterPool = initialiseEncounterPool();
    this.itemDeck = initialiseItemDeck();
    this.itemDiscard = [];
    this.eventDeck = initialiseEventDeck();
    this.eventDiscard = [];
    this.catacombs = [];
    this.roadBlock = [];
    this.heavenlyHostLocations = [];
    this.trailCardsToBeRevealed = [];
    this.catacombCardsToBeRevealed = [];
    this.stormRounds = 0;
    this.dracula = new Dracula();
    this.dracula.gameState = this;
    this.godalming = new Hunter(HunterName.godalming, 12);
    this.seward = new Hunter(HunterName.seward, 10);
    this.vanHelsing = new Hunter(HunterName.vanHelsing, 8);
    this.mina = new Hunter(HunterName.mina, 8, 1);

    // set initial locations to avoid null references
    this.dracula.setLocation(this.map.getLocationByName(LocationName.London));
    this.godalming.setLocation(this.map.getLocationByName(LocationName.London));
    this.seward.setLocation(this.map.getLocationByName(LocationName.London));
    this.vanHelsing.setLocation(this.map.getLocationByName(LocationName.London));
    this.mina.setLocation(this.map.getLocationByName(LocationName.London));
  }

  /**
   * Decides which Hunter to whom to apply the successful attack
   * @param hunters The Hunters involved in the combat
   */
  applyEnemyAttackSuccess() {
    const outcome = getEnemySuccessCombatOutcome(this.dracula.lastAttackedHunter.lastUsedCombatItem, this.dracula.lastUsedAttack);
    this.dracula.repelled = false;
    let continued = false;
    outcome.forEach(effect => {
      this.handleCombatEffect(effect, this.dracula.lastAttackedHunter);
      if (effect == CombatOutcome.Continue) {
        continued = true;
      }
    });
    if (!continued) {
      this.roundsContinued = 0;
    }
  }

  /**
   * Applies the outcome of a successful attack with the given Item
   * @param itemName The name of the Item used in the successful attack
   */
  applyHunterAttackSuccess(itemName: string) {
    const outcome = getHunterSuccessCombatOutcome(itemName, this.dracula.lastUsedAttack);
    this.dracula.repelled = false;
    let continued = false;
    outcome.forEach(effect => {
      this.handleCombatEffect(effect, this.dracula.lastAttackedHunter);
      if (effect == CombatOutcome.Continue) {
        continued = true;
      }
    });
    if (!continued) {
      this.roundsContinued = 0;
    }
  }

  /**
   * Determines if a given Location is in the catacombs
   * @param location The Location to look for
   */
  catacombsContains(location: Location): boolean {
    this.catacombs.forEach(card => {
      if (card.location == location) {
        return true;
      }
    });
    return false;
  }


  /**
   * Determines if a Location is blocked to Dracula due to Consecrated Ground or one of the Heavenly Hosts or by being the Hospital
   * @param location The Location to check
   */
  cityIsConsecrated(location: Location) {
    return location.type == LocationType.hospital || this.consecratedLocation == location || !!this.heavenlyHostLocations.find(city => city == location);
  }

  /**
   * Captures a Hunter move declared to Dracula
   * @param hunter The Hunter committing to the move
   * @param moveMethod The method of travel
   * @param destination The destination of the move
   */
  declareHunterMove(hunter: Hunter, moveMethod: string, destination: string) {
    hunter.committedMove = { moveMethod, destination };
  }

  /**
   * Handles a Hunter's defeat
   * @param hunter The Hunter defeated
   */
  defeatHunter(hunter: Hunter) {
    this.log(`${hunter.name} has been defeated`);
    this.log(hunter.setLocation(this.map.locations.find(location => location.type == LocationType.hospital)));
    this.log(hunter.setHealth(hunter.maxHealth));
    this.log(`${hunter.name} must discard all items and events`);
    if (hunter.name == HunterName.mina) {
      this.log(hunter.setBites(1));
    } else {
      this.log(hunter.setBites(0));
    }
  }

  /**
   * Discards Dracula's current Ally
   */
  discardDraculaAlly() {
    this.log(`${this.draculaAlly.name} discarded`);
    this.eventDiscard.push(this.draculaAlly);
    this.updateAllyEffects();
  }

  /**
   * discards the selected Encounter
   * @param encounterName The name of the Encounter being resolved
   */
  discardEncounter(encounterName: string) {
    if (!encounterName || encounterName == 'Encounter') {
      return;
    }
    let currentEncounter: Encounter;
    if (this.selectedTrailEncounter > -1) {
      currentEncounter = this.trail[this.selectedTrailEncounter].encounter;
      delete this.trail[this.selectedTrailEncounter].encounter;
    }
    if (this.selectedCatacombEncounterA > -1) {
      currentEncounter = this.catacombs[this.selectedCatacombEncounterA].encounter;
      delete this.catacombs[this.selectedCatacombEncounterA].encounter;
    }
    if (this.selectedCatacombEncounterB > -1) {
      currentEncounter = this.catacombs[this.selectedCatacombEncounterB].encounter;
      delete this.catacombs[this.selectedCatacombEncounterB].encounter;
    }
    this.encounterPool.push(currentEncounter);
    this.log(this.shuffleEncounters());
    this.log(`${encounterName} discarded`);
  }

  /**
   * Discards a Hunter Event when it has been drawn due to rest or other effects
   * @param eventName The Event to discard
   */
  discardEventFromRest(eventName: string) {
    let eventIndex = 0;
    for (eventIndex; eventIndex < this.eventDeck.length; eventIndex++) {
      if (this.eventDeck[eventIndex].name == eventName) {
        break;
      }
    }
    const eventCardDrawn = this.eventDeck.splice(eventIndex, 1)[0];
    this.eventDiscard.push(eventCardDrawn);
    this.log(`${eventCardDrawn.name} discarded`);
  }

  /**
   * Removes an Event of the given name from the given Hunter
   * @param eventName The name of the Event
   * @param hunter The Hunter from whom to remove the Event
   */
  discardHunterEvent(eventName: string, hunter: Hunter) {
    let eventIndex = 0;
    for (eventIndex; eventIndex < hunter.events.length; eventIndex++) {
      if (hunter.events[eventIndex].name == eventName) {
        break;
      }
    }
    this.eventDiscard.push(hunter.events.splice(eventIndex, 1)[0]);
    this.log(`${hunter.name} discarded event ${eventName}`);
  }

  /**
   * Removes an Item of the given name from the given Hunter
   * @param itemName The name of the Item
   * @param hunter The Hunter from whom to remove the Item
   */
  discardHunterItem(itemName: string, hunter: Hunter) {
    let itemIndex = 0;
    for (itemIndex; itemIndex < hunter.items.length; itemIndex++) {
      if (hunter.items[itemIndex].name == itemName) {
        break;
      }
    }
    this.itemDiscard.push(hunter.items.splice(itemIndex, 1)[0]);
    this.log(`${hunter.name} discarded item ${itemName}`);
    this.dracula.updateItemTrackingFromDiscard(hunter, itemName);
  }

  /**
   * Checks if Dracula wants to play Control Storms on a Hunter and handles it if so
   * @param hunters The Hunters in this group
   */
  draculaChooseControlStormsDestination(hunters: Hunter[]): boolean {
    const port = this.dracula.chooseControlStormsDestination(hunters);
    if (port) {
      this.log(`Dracula played Control Storms to move ${hunters.length == 1 ? hunters[0].name : 'the group'} to ${port.name}`);
    } else {
      return false;
    }
  }

  /**
   * Determines if Dracula will play False Tip-off
   * @param hunter The Hunter attempting to catch a train
   */
  draculaPlaysFalseTipoff(hunters: Hunter[]): boolean {
    if (this.dracula.willPlayFalseTipoff(hunters)) {
      this.log('Dracula played False Tip-off');
      return true;
    }
    return false;
  }

  /**
   * Dracula works out what he will do this turn, including playing Events and discarding Catacombs cards
   */
  draculaDecideCourseOfAction() {
    this.log(this.dracula.chooseNextMove());
    let logMessage = this.dracula.chooseStartOfTurnEvents();
    if (logMessage) {
      this.log(logMessage);
      return true;
    }
  }

  /**
   * Finds all Locations that can be reached from the starting point by Fast Horse
   * @param origin The starting Location
   */
  getLocationsByFastHorse(origin: Location): Location[] {
    return this.map.locationsConnectedByFastHorse(origin);
  }

  /**
   * Used when the Hunters draw an Event card and it is for Dracula
   */
  giveEventToDracula() {
    let draculaEventIndex = 0;
    for (draculaEventIndex; draculaEventIndex < this.eventDeck.length; draculaEventIndex++) {
      if (this.eventDeck[draculaEventIndex].draculaCard) {
        break;
      }
    }
    const eventCardDrawn = this.eventDeck.splice(draculaEventIndex, 1)[0];
    if (eventCardDrawn.type == EventType.Keep) {
      this.dracula.eventHand.push(eventCardDrawn);
      this.log('Keep event card given to Dracula');
      this.logVerbose(`Dracula drew ${eventCardDrawn.name}`);
      this.log(this.dracula.discardDownEvents());
    } else {
      this.log(`Dracula drew ${eventCardDrawn.name}`);
      if (eventCardDrawn.type == EventType.Ally) {
        if (!this.draculaAlly) {
          this.draculaAlly = eventCardDrawn;
        } else {
          if (this.dracula.replaceExistingAlly(eventCardDrawn)) {
            this.log(`Dracula chose to discard ${this.draculaAlly.name} in favour of ${eventCardDrawn.name}`);
            this.eventDiscard.push(this.draculaAlly);
            this.draculaAlly = eventCardDrawn;
          } else {
            this.eventDiscard.push(eventCardDrawn);
            this.log(`Dracula chose to keep ${this.draculaAlly.name}`);
          }
        }
        this.updateAllyEffects();
      } else {
        this.eventDiscard.push(eventCardDrawn);
        this.eventPendingResolution = eventCardDrawn.name;
        this.dracula.eventAwaitingApproval = eventCardDrawn.name;
      }
    }
  }

  /**
   * Takes an Event of the given name from the Event deck and gives it to the given Hunter
   * @param eventName The name of the Event
   * @param hunter The Hunter to whom to give the Event
   */
  giveEventToHunter(eventName: string, hunter: Hunter) {
    let eventIndex = 0;
    for (eventIndex; eventIndex < this.eventDeck.length; eventIndex++) {
      if (this.eventDeck[eventIndex].name == eventName) {
        break;
      }
    }
    const cardDrawn = this.eventDeck.splice(eventIndex, 1)[0];
    hunter.events.push(cardDrawn);
    if (cardDrawn.type !== EventType.Keep) {
      this.playHunterEvent(eventName, hunter);
    } else {
      this.log(`${hunter.name} took event ${eventName}`);
    }
  }

  /**
   * Takes an Item of the given name from the Item deck and gives it to the given Hunter
   * @param itemName The name of the Item
   * @param hunter The Hunter to whom to give the Item
   */
  giveItemToHunter(itemName: string, hunter: Hunter) {
    let itemIndex = 0;
    for (itemIndex; itemIndex < this.itemDeck.length; itemIndex++) {
      if (this.itemDeck[itemIndex].name == itemName) {
        break;
      }
    }
    hunter.items.push(this.itemDeck.splice(itemIndex, 1)[0]);
    this.log(`${hunter.name} took item ${itemName}`);
  }

  /**
   * Handles an individual combat effect
   * @param effect The effect to handle
   */
  handleCombatEffect(effect: CombatOutcome, hunter?: Hunter) {
    switch (effect) {
      case CombatOutcome.DraculaLose1Blood:
        this.log('Dracula loses 1 blood');
        break;
      case CombatOutcome.DraculaLose2Blood:
        this.log('Dracula loses 2 blood');
        break;
      case CombatOutcome.DraculaLose3Blood:
        this.log('Dracula loses 3 blood');
        break;
      case CombatOutcome.DraculaLose4Blood:
        this.log('Dracula loses 3 blood');
        break;
      case CombatOutcome.HunterRollBonus:
        this.log('+1 to Hunter rolls in the next round of combat');
        break;
      case CombatOutcome.Repel:
        this.log('Dracula is Repelled');
        this.dracula.repelled = true;
        break;
      case CombatOutcome.DraculaDeath:
        this.log('Dracula is critically wounded');
        break;
      case CombatOutcome.MinionDeath:
        this.log('Dracula\'s agent is killed');
        break;
      case CombatOutcome.HunterLose1Health:
        this.log(`${hunter.name} loses 1 health`);
        break;
      case CombatOutcome.HunterLose2Health:
        this.log(`${hunter.name} loses 2 health`);
        break;
      case CombatOutcome.HunterLose3Health:
        this.log(`${hunter.name} loses 3 health`);
        break;
      case CombatOutcome.DraculaInitiativeBonus:
        this.log('Dracula gets +1 to combat rolls next round');
        break;
      case CombatOutcome.HunterItemDestroyed:
        this.log(`${hunter.name}'s ${hunter.lastUsedCombatItem} is destroyed`);
        break;
      case CombatOutcome.HunterEventDiscarded:
        this.log(`${hunter.name} must discard one event`);
        break;
      case CombatOutcome.HunterLosesAllItems:
        this.log(`${hunter.name} loses all items`);
        break;
      case CombatOutcome.Bite:
        this.log(`${hunter.name} is bitten`);
        break;
      case CombatOutcome.EscapeAsBat:
        if (this.opponent == EncounterName.Dracula) {
          this.resolveEscapeAsBat();
        }
        break;
      case CombatOutcome.Continue:
        this.roundsContinued++;
        if (this.roundsContinued > 2) {
          this.log('Combat ends');
          this.godalming.inCombat = false;
          this.seward.inCombat = false;
          this.vanHelsing.inCombat = false;
          this.mina.inCombat = false;
          this.opponent = null;
          if (this.dracula.willPlayRelentlessMinion()) {
            this.log('Dracula played Relentless Minion');
            this.log('Resolve another combat with the same minion');
          }
        } else {
          this.log('Combat continues another round');
        }
        break;
      case CombatOutcome.End:
        this.log('Combat ends');
        this.godalming.inCombat = false;
        this.seward.inCombat = false;
        this.vanHelsing.inCombat = false;
        this.mina.inCombat = false;
        this.opponent = null;
        if (this.dracula.willPlayRelentlessMinion()) {
          this.log('Dracula played Relentless Minion');
          this.log('Resolve another combat with the same minion');
        }
        break;
      case CombatOutcome.Invalid:
        this.log(`This is not a valid combat card combination: ${hunter.lastUsedCombatItem} and ${this.dracula.lastUsedAttack}`);
        break;
    }
  }

  /**
   * Determines if a Hunter is present in the given location
   * @param location The Location to query
   */
  hunterIsIn(location: Location) {
    return !![this.godalming, this.seward, this.vanHelsing, this.mina].find(hunter => hunter.currentLocation == location);
  }

  /**
   * Returns array of Hunters in the same group as the given Hunter
   * @param hunter The Hunter in the group (or alone)
   */
  huntersInGroup(hunter: Hunter): Hunter[] {
    if (hunter.groupNumber == 0) {
      return [hunter];
    } else {
      const huntersInGroup = [];
      if (this.godalming.groupNumber == hunter.groupNumber) {
        huntersInGroup.push(this.godalming);
      }
      if (this.seward.groupNumber == hunter.groupNumber) {
        huntersInGroup.push(this.seward);
      }
      if (this.vanHelsing.groupNumber == hunter.groupNumber) {
        huntersInGroup.push(this.vanHelsing);
      }
      if (this.mina.groupNumber == hunter.groupNumber) {
        huntersInGroup.push(this.mina);
      }
      return huntersInGroup;
    }
  }

  /**
   * Checks if any Hunter has a Good Luck event card in hand
   */
  huntersHaveGoodLuck(): boolean {
    return !!this.godalming.events.concat(this.seward.events).concat(this.vanHelsing.events).concat(this.mina.events).find(event => event.name == EventName.GoodLuck);
  }

  /**
   * Sets up the initial state of the game
   */
  initialiseGameState() {
    this.logText = 'INITIALISING GAME STATE';
    this.logVerboseText = 'INITIALISING GAME STATE';
    this.log(this.map.verifyMapData());
    this.log(this.shuffleEncounters());
    this.log(this.dracula.drawUpEncounters());
    this.log(this.shuffleEvents());
    this.timePhase = -1;
    this.vampireTrack = 0;
    this.resolveTrack = 0;
    this.trail = [];
    this.log('GAME STATE INITIALISED');
  }

  /**
   * Adds a message to the console text box in a new line
   * @param message the message to display
   */
  log(message: string) {
    this.logText += message ? `\n${message}` : '';
    this.logVerboseText += message ? `\n${message}` : '';
  }

  /**
   * Adds a message to the verbose log, which gives a full account of the game
   * @param message the message to display
   */
  logVerbose(message: string) {
    this.logVerboseText += message ? `\n${message}` : '';
  }

  /**
   * Resolve Newspaper Reports from resolve
   */
  newspaperReportsResolve() {
    let i = this.trail.length - 1;
    for (i; i > 0; i--) {
      if (!this.trail[i].revealed) {
        this.trail[i].revealed = true;
        break;
      }
    }
  }

  /**
   * Performs Dracula's action phase
   */
  performDraculaActionPhase() {
    const hunterHere = [this.godalming, this.seward, this.vanHelsing, this.mina].find(hunter => hunter.currentLocation == this.dracula.currentLocation);
    if (this.dracula.currentLocation.type !== LocationType.sea && hunterHere) {
      this.log('Dracula attacks! Resolve an encounter with Dracula');
    } else {
      let canPlaceEncounter = true;
      if (this.dracula.currentLocation.type == LocationType.castle) {
        canPlaceEncounter = false;
      }
      if (this.dracula.currentLocation.type == LocationType.sea) {
        canPlaceEncounter = false;
      }
      if (this.dracula.nextMove.power) {
        if (this.dracula.nextMove.power.name == PowerName.DarkCall) {
          canPlaceEncounter = false;
        }
        if (this.dracula.nextMove.power.name == PowerName.DoubleBack) {
          canPlaceEncounter = false;
        }
        if (this.dracula.nextMove.power.name == PowerName.Feed) {
          canPlaceEncounter = false;
        }
      }
      if (canPlaceEncounter) {
        this.trail[0].encounter = this.dracula.chooseEncounterForTrail();
        this.log('Dracula placed an encounter');
        this.logVerbose(`Dracula placed Encounter ${this.trail[0].encounter.name}`);
      }
    }

    if (this.dracula.droppedOffEncounters) {
      this.log(this.dracula.decideFateOfDroppedOffEncounters());
    }

    // Refill encounter hand
    this.log(this.dracula.drawUpEncounters());
  }

  /**
   * This performs Dracula's movement phase, which can be a basic movement or a power
   */
  performDraculaMovementPhase() {
    if (!this.dracula.nextMove) {
      this.log('Dracula has no valid moves');
      this.log(this.dracula.die());
      // TODO: I think this should actually clear down to his current location, which might not be the first card in the trail
      this.log(this.dracula.clearTrail(1));
      this.dracula.revealed = true;
      this.trail[0].revealed = true; // ^
      this.log(this.dracula.chooseNextMove());
    }

    let doubleBackTrailIndex: number;
    let doubleBackCatacombIndex: number;
    let doubleBackedCard: TrailCard;
    if (this.dracula.nextMove.power) {
      switch (this.dracula.nextMove.power.name) {
        case PowerName.DarkCall:
          this.log('Dracula played power Dark Call');
          this.log(this.dracula.executeDarkCall());
          this.log(this.shuffleEncounters());
          break;
        case PowerName.DoubleBack:
        case PowerName.WolfFormAndDoubleBack:
          this.log(`Dracula played power ${this.dracula.nextMove.power.name}`);
          for (let i = 0; i < this.trail.length; i++) {
            if (this.trail[i].location) {
              if (this.trail[i].location == this.dracula.nextMove.location) {
                doubleBackTrailIndex = i;
              }
            }
          }
          for (let i = 0; i < this.catacombs.length; i++) {
            if (this.catacombs[i].location == this.dracula.nextMove.location) {
              doubleBackCatacombIndex = i;
            }
          }
          if (doubleBackTrailIndex) {
            this.log(`Dracula Doubled Back to the location in position ${doubleBackTrailIndex + 1} of the trail`);
            doubleBackedCard = this.trail.splice(doubleBackTrailIndex, 1)[0];
            if (doubleBackTrailIndex == this.dracula.evasionSlot) {
              this.dracula.evasionSlot--;
            }
          }
          if (doubleBackCatacombIndex) {
            this.log(`Dracula Doubled Back to the location in position ${doubleBackCatacombIndex + 1} of the trail`);
            const doubleBackedCard = this.catacombs.splice(doubleBackCatacombIndex, 1)[0];
            this.pushToTrail(doubleBackedCard);
            this.log(this.dracula.decideWhichEncounterToKeep(this.trail[0]));
          }
          break;
        case PowerName.Feed:
          this.log('Dracula played power Feed');
          break;
        case PowerName.Hide:
          this.dracula.hideLocation = this.dracula.currentLocation;
          if (this.dracula.currentLocation == this.godalming.currentLocation ||
            this.dracula.currentLocation == this.seward.currentLocation ||
            this.dracula.currentLocation == this.vanHelsing.currentLocation ||
            this.dracula.currentLocation == this.mina.currentLocation) {
            this.log('Dracula played power Hide');
            this.dracula.revealed = true;
          } else {
            this.log('Dracula moved to a hidden location');
            this.logVerbose('Dracula actually played power Hide');
            this.dracula.revealed = false;
            this.dracula.updatePossibleTrailsWithUnknown(TravelMethod.road, LocationType.smallCity);
          }
          break;
        case PowerName.WolfForm:
          this.log('Dracula played power Wolf Form');
          break;
        case PowerName.WolfFormAndHide:
          this.log('Dracula played power Wolf Form');
          this.logVerbose('Dracula played Wolf Form and Hide');
          break;
      }
      this.dracula.evasionSlot++;
      if (this.dracula.nextMove.power.cost !== 0) {
        // pay blood for power
        this.log(this.dracula.setBlood(this.dracula.blood - this.dracula.nextMove.power.cost));
      }
    }
    let nextLocation: Location;
    if (this.dracula.nextMove.location) {
      nextLocation = this.dracula.nextMove.location;
      // TODO: need special case to handle double back and/or wolf form
      this.dracula.updatePossibleTrailsWithUnknown(this.dracula.nextMove.travelMethod, this.dracula.nextMove.location.type);
      // check if new location causes Dracula to be revealed
      if (nextLocation.type == LocationType.castle || (nextLocation.type !== LocationType.sea && (nextLocation == this.godalming.currentLocation || nextLocation == this.seward.currentLocation ||
        nextLocation == this.vanHelsing.currentLocation || nextLocation == this.mina.currentLocation))) {
        this.dracula.revealed = true;
        this.dracula.cullPossibleTrailsAfterLocationRevealed(this.dracula.nextMove.location, 0);
      } else {
        this.dracula.revealed = false;
        if (this.trail.length > 5 && this.trail[5].revealed) {
          this.dracula.cleanUpDuplicatePossibleTrails();
        }
      }

      // move to new location
      this.log(this.dracula.setLocation(nextLocation));

      // pay blood for sea travel
      if (nextLocation.type == LocationType.sea && (!this.dracula.seaBloodPaid || this.hunterAlly.name == EventName.RufusSmith)) {
        this.log(this.dracula.setBlood(this.dracula.blood - 1));
        this.dracula.seaBloodPaid = true;
      } else {
        this.dracula.seaBloodPaid = false;
      }
    }
    // add card to trail
    if (doubleBackedCard) {
      doubleBackedCard.power = this.dracula.nextMove.power;
      this.pushToTrail(doubleBackedCard);
      this.dracula.revealed = doubleBackedCard.revealed;
    } else {
      this.pushToTrail({ revealed: this.dracula.revealed, location: nextLocation, power: this.dracula.nextMove.power });
    }
    if (this.trail.length == 7) {
      this.log('A card has dropped off the end of the trail');
      const droppedOffCard = this.trail.pop();
      if (droppedOffCard.location) {
        if (droppedOffCard.location == this.dracula.hideLocation) {
          this.log('Dracula hid at this location');
          let hideIndex = 0;
          for (hideIndex; hideIndex < this.trail.length; hideIndex++) {
            if (this.trail[hideIndex].power) {
              if (this.trail[hideIndex].power.name == PowerName.Hide) {
                break;
              }
            }
          }
          this.log(`The Hide power card was removed from position ${hideIndex + 1} in the trail`);
          if (this.trail[hideIndex].encounter) {
            this.log('The encounter on the Hide card was discarded')
            this.encounterPool.push(this.trail[hideIndex].encounter);
            this.log(this.shuffleEncounters());
          }
          this.dracula.hideLocation = null;
          this.trail.splice(hideIndex, 1);
        }
      }
      if (droppedOffCard.power) {
        if (droppedOffCard.power.name == PowerName.Hide) {
          this.dracula.hideLocation = null;
        }
      }
      this.log(this.dracula.decideFateOfDroppedOffCard(droppedOffCard));
      if (this.dracula.currentLocation.type == LocationType.castle) {
        this.setDraculaBlood(this.dracula.blood + 2);
      }
    }
  }

  /**
   * Performs the Timekeeping phase of Dracula's turn, including selecting his next move
   * This needs to be done at this point as it affects what he does with the catacombs
   */
  performDraculaTimeKeepingPhase() {
    this.log('Performing Timekeeping phase');
    if (this.draculaAlly) {
      if (this.draculaAlly.name == EventName.QuinceyPMorris) {
        this.log(this.dracula.chooseVictimForQuincey());
      }
    }

    // evaluate catacombs
    this.log(this.dracula.evaluateCatacombs());

    // perform timekeeping
    if (this.dracula.currentLocation.type !== LocationType.sea) {
      this.log('Time advancing...');
      this.timePhase += 1;

      // handle new day
      if (this.timePhase == 6) {
        this.log('A new day dawns');
        this.setVampireTrack(this.vampireTrack + 1);
        this.resolveTrack += 1;
        this.timePhase = 0;
      }
    }
  }

  /**
   * Plays an Event of the given name from the given Hunter
   * @param eventName The name of the Event
   * @param hunter The Hunter playing the Event
   */
  playHunterEvent(eventName: string, hunter: Hunter) {
    let eventIndex = 0;
    for (eventIndex; eventIndex < hunter.events.length; eventIndex++) {
      if (hunter.events[eventIndex].name == eventName) {
        break;
      }
    }
    const eventCardPlayed = hunter.events[eventIndex];

    // If this is an Ally, just play it and return
    if (eventCardPlayed.type == EventType.Ally) {
      if (this.hunterAlly) {
        this.log(`Hunters discarded Ally ${this.hunterAlly.name}`);
        this.eventDiscard.push(this.hunterAlly);
      }
      this.hunterAlly = eventCardPlayed;
      hunter.events.splice(eventIndex, 1);
      return;
    }

    // If a cancellation tug-of-war hasn't been started, this is the start of one
    if (!this.eventPendingResolution) {
      this.eventPendingResolution = eventName;
      this.hunterWhoPlayedEvent = hunter;
      this.discardHunterEvent(eventName, hunter);
    } else {
      // Otherwise the only valid card for a Hunter to play is Good Luck, to cancel Dracula's Event
      if (eventName !== EventName.GoodLuck) {
        this.log('Resolve the current pending event first');
        return;
      } else {
        this.discardHunterEvent(eventName, hunter);
      }
    }

    // If Dracula doesn't cancel this, it's either the original event that he didn't cancel
    // or a cancellation of his cancellation that he didn't cancel, so the original event resolves
    const cancelCardPlayedByDracula = this.dracula.cardPlayedToCancel(eventName);
    if (cancelCardPlayedByDracula) {
      // If he did cancel it, then set a Dracula event card for the Hunters to consider cancelling and return
      this.dracula.eventAwaitingApproval = cancelCardPlayedByDracula.name;
      this.log(`Dracula played ${cancelCardPlayedByDracula.name}`);
      return;
    } else {
      const originalEventCard = this.eventDiscard.find(event => event.name == this.eventPendingResolution);
      if (originalEventCard.draculaCard) {
        // If Dracula played the original Event card, and the Hunters have played an Event card which
        // Dracula has not cancelled, then the Hunters' card was Good Luck, so the original Event is
        // cancelled with no effect
        this.eventPendingResolution = null;
        this.dracula.eventAwaitingApproval = null;
        return;
      } else {
        // Otherwise the Hunters initiated this and their Event is resolved
        resolveEvent(this.eventPendingResolution, this);
        this.eventPendingResolution = null;
        return;
      }
    }
  }

  /**
   * Adds a card to the head of the trail
   * @param newTrailCard The card to add to the head of the trail
   */
  pushToTrail(newTrailCard: TrailCard) {
    this.trail.unshift(newTrailCard);
    this.log('Dracula added a card to the trail');
    if (this.hunterAlly) {
      if (this.hunterAlly.name == EventName.JonathanHarker && this.trail.length > 5) {
        this.trail[5].revealed = true;
        this.log('Jonathan Harker revealed the last card in Dracula\'s trail');
      }
    }
  }

  /**
   * Removes an Encounter tile of the given name from the given Hunter and returns it
   * @param hunter The Hunter removing the tile
   * @param encounterName The name of the Encounter being removed
   */
  removeEncounterFromHunter(hunter: Hunter, encounterName: string): Encounter {
    let encounterIndex = 0;
    for (encounterIndex; encounterIndex < hunter.encounterTiles.length; encounterIndex++) {
      if (hunter.encounterTiles[encounterIndex].name == encounterName) {
        break;
      }
    }
    this.log(`${encounterName} tile removed from ${hunter.name}`);
    return hunter.encounterTiles.splice(encounterIndex, 1)[0];
  }

  /**
   * Resolves an Event played by Dracula that the Hunters have not chosen to cancel
   */
  resolveApprovedEvent() {
    const originalEventPlayed = this.eventDiscard.find(event => event.name == this.eventPendingResolution);
    if (this.dracula.eventAwaitingApproval == this.eventPendingResolution) {
      // Dracula played a card and it was not contested
      resolveEvent(this.eventPendingResolution, this);
      this.eventPendingResolution = null;
      this.dracula.eventAwaitingApproval = null;
    } else if (originalEventPlayed.draculaCard) {
      resolveEvent(this.eventPendingResolution, this);
      this.eventPendingResolution = null;
      this.dracula.eventAwaitingApproval = null;
    } else {
      // Hunters played the original card, there was a tug-of-war, Dracula prevailed, so the original Event is cancelled
      this.eventPendingResolution = null;
      this.dracula.eventAwaitingApproval = null;
    }
  }

  /**
   * Chooses which combat card Dracula plays in a current round of combat
   * @param hunters The Hunters involved in the combat
   * @param items The names of the combat cards chosen by the Hunters
   */
  resolveCombatRound(hunters: Hunter[], items: string[]) {
    for (let i = 0; i < hunters.length; i++) {
      this.log(`${hunters[i].name} used ${items[i]}`);
      hunters[i].lastUsedCombatItem = items[i];
      this.dracula.updateItemTrackingFromCombat(hunters, items);
    }
    this.log(this.dracula.chooseCombatCardAndHunter(hunters));
  }

  /**
   * Resolves the selected Encounter
   * @param encounterName The name of the Encounter being resolved
   * @param hunter The Hunter involved in the Encounter
   */
  resolveEncounter(encounterName: string, hunter: Hunter) {
    if (!encounterName || encounterName == 'Encounter') {
      return;
    }
    let currentEncounter: Encounter;
    if (encounterName !== EncounterName.Dracula) {
      if (this.selectedTrailEncounter > -1) {
        currentEncounter = this.trail[this.selectedTrailEncounter].encounter;
        delete this.trail[this.selectedTrailEncounter].encounter;
      }
      if (this.selectedCatacombEncounterA > -1) {
        currentEncounter = this.catacombs[this.selectedCatacombEncounterA].encounter;
        delete this.catacombs[this.selectedCatacombEncounterA].encounter;
      }
      if (this.selectedCatacombEncounterB > -1) {
        currentEncounter = this.catacombs[this.selectedCatacombEncounterB].encounter;
        delete this.catacombs[this.selectedCatacombEncounterB].encounter;
      }
      if (this.selectedAmbushEncounter) {
        currentEncounter = this.dracula.ambushEncounter;
        this.dracula.ambushEncounter = null;
      }
    }

    switch (encounterName) {
      case EncounterName.Dracula:
        if (this.dracula.willPlayWildHorses(this.huntersInGroup(hunter))) {
          return;
        }
        this.setUpCombat(EncounterName.Dracula, hunter);
        this.log(this.dracula.willPlayRage(this.huntersInGroup(hunter)));
        break;
      case EncounterName.VampireLair:
        this.setUpCombat(EncounterName.VampireLair, hunter);
        this.log(this.dracula.willPlayRage(this.huntersInGroup(hunter)));
        break;
      case EncounterName.Ambush:
        this.dracula.encounterHandSize += 1;
        this.log(this.dracula.drawUpEncounters());
        this.dracula.encounterHandSize -= 1;
        this.log(this.dracula.discardDownEncounters());
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.Assassin:
      case EncounterName.MinionWithKnife:
      case EncounterName.MinionWithKnifeAndPistol:
      case EncounterName.MinionWithKnifeAndRifle:
        this.setUpCombat(encounterName, hunter);
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        break;
      case EncounterName.Bats:
        this.huntersInGroup(hunter).forEach(companion => {
          companion.encounterTiles.push(currentEncounter)
          this.log(`Bats has ended ${companion.name}'s turn`);
        });
        break;
      case EncounterName.DesecratedSoil:
        this.log('Draw an event card, if it is for Dracula, give it to him, otherwise discard it');
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.Fog:
        this.huntersInGroup(hunter).forEach(companion => {
          companion.encounterTiles.push(currentEncounter);
          this.log(`Fog has ended ${companion.name}'s turn`);
        });
        break;
      case EncounterName.Hoax:
        this.huntersInGroup(hunter).forEach(companion => {
          if (companion.currentLocation.domain == LocationDomain.west) {
            this.log(`${companion.name} must discard all events`);
          } else {
            this.log(`${companion.name} must discard one event`);
          }
        });
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.Lightning:
        if (hunter.groupNumber == 0) {
          this.log(`${hunter.name} must show Dracula a Crucifix or Heavenly Host or lost 2 health and discard an item`);
        } else {
          this.log('The Hunter group must show Dracula a Crucifix or Heavenly Host or each lose 2 health and discard an item');
        }
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.Peasants:
        this.huntersInGroup(hunter).forEach(companion => {
          if (companion.currentLocation.domain == LocationDomain.west) {
            this.log(`${companion.name} must discard one item and draw a new one`);
          } else {
            this.log(`${companion.name} must discard all items and draw new ones`);
          }
        });
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.Plague:
        this.huntersInGroup(hunter).forEach(companion => {
          this.log(`${companion.name} loses 2 health`);
        });
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.Rats:
        if (hunter.groupNumber == 0) {
          this.log(`${hunter.name} must show Dracula a Dogs item or roll four dice, losing one health for each 4-6 rolled`);
        } else {
          this.log('The Hunter group must show Dracula a Dogs item or each roll four dice, losing one health for each 4-6 rolled')
        }
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.Saboteur:
        if (hunter.groupNumber == 0) {
          this.log(`${hunter.name} must show Dracula a Dogs item or discard one item or event and end the turn`);
        } else {
          this.log('The Hunter group must show Dracula a Dogs item or each discard one item or event and end the turn');
        }
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.Spy:
        if (hunter.groupNumber == 0) {
          this.log(`${hunter.name} must show Dracula all items and events and declare next move`);
        } else {
          this.log('The Hunter group must show Dracula all items and events and declare their next moves');
        }
        this.huntersInGroup(hunter).forEach(companion => {
          companion.knownItems = [];
          companion.knownEvents = [];
          companion.possibleItems = [];
          companion.items.forEach(item => companion.knownItems.push(item.name));
          companion.events.forEach(event => companion.knownEvents.push(event.name));
          companion.mustDeclareNextMove = true;
        });
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.Thief:
        if (hunter.groupNumber == 0) {
          this.log(`${hunter.name} must show Dracula a Dogs item or discard one random item or event of Dracula's choice`);
        } else {
          this.log('The Hunter group must show Dracula a Dogs item or each discard one random item or event of Dracula\'s choice');
        }
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.NewVampire:
        if (this.timePhase < 3) {
          if (hunter.groupNumber == 0) {
            this.log(`${hunter.name} found a vampire during the day and killed it`);
          } else {
            this.log('The Hunter group found a vampire during the day and killed it');
          }
        } else {
          if (this.dracula.willPlaySeduction(this.huntersInGroup(hunter))) {
            this.log('Dracula played Seduction');
          } else {
            if (hunter.groupNumber == 0) {
              this.log(`${hunter.name} has encountered a vampire at night and must roll a die`);
              this.log(`On a roll of 1-3, ${hunter.name} is bitten, unless they show Dracula a Heavenly Host or Crucifix item`);
              this.log(`On a roll of 4-6, the vampire escapes unless ${hunter.name} discards a Knife or a Stake item`);
              this.log(`If the vampire escapes, leave it here and ${hunter.name}'s turn ends, otherwise discard it`);
            } else {
              this.log('The Hunter group has encountered a vampire at night and must roll a die');
              this.log('On a roll of 1-3, each Hunter is bitten, unless someone in the group shows Dracula a Heavenly Host or Crucifix item');
              this.log('On a roll of 4-6, the vampire escapes unless one Hunter discards a Knife or a Stake item');
              this.log('If the vampire escapes, leave it here and the group\'s turn ends, otherwise discard it');
            }
          }
        }
        break;
      case EncounterName.Wolves:
        if (hunter.groupNumber == 0) {
          this.log(`${hunter.name} must show Dracula a Pistol and/or a Rifle item, or lose a health for each item type not shown`);
        } else {
          this.log('The Hunter group must show Dracula a Pistol and/or a Rifle item, or each lose a health for each item type not shown');
        }
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
    }
  }

  /**
   * Resolve Dracula's Escape as Bat ability
   */
  resolveEscapeAsBat() {
    let possibleDestinations = this.dracula.currentLocation.roadConnections.filter(road => this.consecratedLocation !== road);
    for (let i = 0; i < 2; i++) {
      this.dracula.currentLocation.roadConnections.forEach(road2 => possibleDestinations.push(...road2.roadConnections
        .filter(road => !this.hunterIsIn(road) && this.consecratedLocation !== road && !this.trail.find(trail => trail.location == road) && !this.catacombs.find(catacombs => catacombs.location == road))));
      possibleDestinations = _.uniq(possibleDestinations);
    }
    if (possibleDestinations.length == 0) {
      this.log('Dracula has nowhere to go');
    } else {
      const destination = this.dracula.chooseBatDestination(possibleDestinations);
      let trailIndex = 0;
      for (trailIndex; trailIndex < this.trail.length; trailIndex++) {
        if (this.trail[trailIndex].location == this.dracula.currentLocation) {
          break;
        }
      }
      if (trailIndex > this.trail.length) {
        this.log('Dracula\'s current location card is not in the trail, adding it');
        this.trail[0].location = destination;
        this.trail[0].revealed = true;
        this.dracula.revealed = true;
      } else {
        this.trail[trailIndex].location = destination;
        this.trail[trailIndex].revealed = false;
        this.dracula.revealed = false;
        this.log('Dracula escaped in the form of a Bat');
      }
      this.logVerbose(`Dracula escaped to ${this.dracula.currentLocation.name}`);
    }
  }

  /**
   * Resolves Hired Scouts
   * @param locationNames The names of the Locations to query
   */
  resolveHiredScouts(locationNames: string[]) {
    this.log(`Hired Scouts sent to ${locationNames[0]} and ${locationNames[1]}`);
    this.hiredScoutsInEffect = false;
    this.eventPendingResolution = null;
    let trailIndex = 0;
    for (trailIndex; trailIndex < this.trail.length; trailIndex++) {
      if (this.trail[trailIndex].location) {
        if (this.trail[trailIndex].location.name == locationNames[0] || this.trail[trailIndex].location.name == locationNames[1]) {
          this.trailCardsToBeRevealed.push(trailIndex);
          if (this.trail[trailIndex].encounter) {
            this.trail[trailIndex].encounter.revealed = true;
          }
        }
      }
    }
    let catacombIndex = 0;
    for (catacombIndex; catacombIndex < this.catacombs.length; catacombIndex++) {
      if (this.catacombs[catacombIndex].location) {
        if (this.catacombs[catacombIndex].location.name == locationNames[0] || this.catacombs[catacombIndex].location.name == locationNames[1]) {
          this.catacombCardsToBeRevealed.push(catacombIndex);
          if (this.catacombs[catacombIndex].encounter) {
            this.catacombs[catacombIndex].encounter.revealed = true;
          }
          if (this.catacombs[catacombIndex].catacombEncounter) {
            this.catacombs[catacombIndex].catacombEncounter.revealed = true;
          }
        }
      }
    }
  }

  /**
   * Takes an Event of the given name from the Item discard and gives it to the given Hunter
   * @param eventName The name of the Event
   * @param hunter The Hunter to whom to give the Item
   */
  retrieveEventForHunter(eventName: string, hunter: Hunter) {
    if (!eventName) {
      return;
    }
    let eventIndex = 0;
    for (eventIndex; eventIndex < this.eventDiscard.length; eventIndex++) {
      if (this.eventDeck[eventIndex].name == eventName) {
        break;
      }
    }
    hunter.events.push(this.eventDeck.splice(eventIndex, 1)[0]);
    this.log(`${hunter.name} took event ${eventName} from the discard pile`);
  }

  /**
   * Takes an Item of the given name from the Item discard and gives it to the given Hunter
   * @param itemName The name of the Item
   * @param hunter The Hunter to whom to give the Item
   */
  retrieveItemForHunter(itemName: string, hunter: Hunter) {
    if (!itemName) {
      return;
    }
    let itemIndex = 0;
    for (itemIndex; itemIndex < this.itemDiscard.length; itemIndex++) {
      if (this.itemDeck[itemIndex].name == itemName) {
        break;
      }
    }
    hunter.items.push(this.itemDeck.splice(itemIndex, 1)[0]);
    this.log(`${hunter.name} took item ${itemName} from the discard pile`);
  }

  /**
   * Reveals cards in Dracula's catacombs by effect of an Event
   */
  revealCatacombCards() {
    if (this.catacombCardsToBeRevealed.length == 0) {
      return;
    }
    if (this.dracula.willPlaySensationalistPress()) {
      this.log('Dracula played Sensationalist Press to prevent a location from being revealed');
      return;
    }
    this.catacombCardsToBeRevealed.forEach(index => {
      this.catacombs[index].revealed = true;
      this.log(`${this.catacombs[index].location.name} is revealed`)
    });
    this.catacombCardsToBeRevealed = [];
  }

  /**
   * Reveals cards in Dracula's trail by effect of an Event
   */
  revealTrailCards() {
    if (this.trailCardsToBeRevealed.length == 0) {
      return;
    }
    if (this.dracula.willPlaySensationalistPress()) {
      this.log('Dracula played Sensationalist Press to prevent a location from being revealed');
      return;
    }
    this.trailCardsToBeRevealed.forEach(index => {
      this.trail[index].revealed = true;
      if (this.trail[index].location) {
        this.log(`${this.trail[index].location.name} is revealed`);
      } else if (this.trail[index].power) {
        this.log(`${this.trail[index].power.name} is revealed`);
      }
    });
    this.trailCardsToBeRevealed = [];
  }

  /**
   * Searches at a Hunter's current location for Dracula, his trail and his catacombs
   * @param hunter the Hunter searching
   */
  searchWithHunter(hunter: Hunter) {
    if (hunter.currentLocation.type == LocationType.sea) {
      return;
    }
    let foundSomething = false;
    const encountersToResolve: Encounter[] = [];
    if (hunter.currentLocation == this.dracula.currentLocation) {
      foundSomething = true;
      this.dracula.revealed = true;
      this.log(`${hunter.name} has found Dracula at ${hunter.currentLocation.name}`);
    }
    this.trail.forEach(trailCard => {
      if (hunter.currentLocation == trailCard.location) {
        foundSomething = true;
        trailCard.revealed = true;
        this.log(`${hunter.name} has found Dracula's trail at ${hunter.currentLocation.name}`);
        if (hunter.currentLocation == this.dracula.hideLocation) {
          this.log('Dracula hid at this location');
          let hideIndex = 0;
          for (hideIndex; hideIndex < this.trail.length; hideIndex++) {
            if (this.trail[hideIndex].power) {
              if (this.trail[hideIndex].power.name == PowerName.Hide) {
                break;
              }
            }
          }
          this.trail[hideIndex].revealed = true;
          if (this.trail[hideIndex].encounter) {
            this.trail[hideIndex].encounter.revealed = true;
            this.log(`${hunter.name} has encountered ${this.trail[hideIndex].encounter.name} at ${hunter.currentLocation.name}`);
            this.trail[hideIndex].encounter.revealed = true;
            encountersToResolve.push(this.trail[hideIndex].encounter);
          }
        }
        if (trailCard.encounter) {
          trailCard.encounter.revealed = true;
          this.log(`${hunter.name} has encountered ${trailCard.encounter.name} at ${hunter.currentLocation.name}`);
          trailCard.encounter.revealed = true;
          encountersToResolve.push(trailCard.encounter);
        }
      }
    });
    for (let i = 0; i < this.catacombs.length; i++) {
      const catacomb = this.catacombs[i];
      if (hunter.currentLocation == catacomb.location) {
        foundSomething = true;
        catacomb.revealed = true;
        this.log(`${hunter.name} has found Dracula's catacomb at ${hunter.currentLocation.name}`);
        if (catacomb.encounter) {
          catacomb.encounter.revealed = true;
          this.log(`${hunter.name} has encountered ${catacomb.encounter.name} at ${hunter.currentLocation.name}`);
          encountersToResolve.push(catacomb.encounter);
        }
        if (catacomb.catacombEncounter) {
          catacomb.catacombEncounter.revealed = true;
          this.log(`${hunter.name} has encountered ${catacomb.catacombEncounter.name} at ${hunter.currentLocation.name}`);
          encountersToResolve.push(catacomb.catacombEncounter);
        }
      }
      break;
    }
    if (!foundSomething) {
      this.log(`${hunter.name} found nothing at ${hunter.currentLocation.name}`);
    }
    if (encountersToResolve.length > 0) {
      this.log(this.dracula.chooseEncounterResolutionOrder(encountersToResolve));
    }
  }

  /**
   * Moves the Consecrated Ground marker to the Location with the given name
   * @param locationName The name of the Location to which to move the marker
   */
  setConsecratedGround(locationName: string) {
    this.consecratedLocation = this.map.locations.find(location => location.name == locationName);
    if (this.consecratedLocation) {
      this.log(`Consecrated Ground marker moved to ${this.consecratedLocation.name}`);
    } else {
      this.log('Consecrated Ground marker removed');
    }
  }

  /**
   * Sets Dracula's blood
   * @param blood The value to which to set Dracula's blood
   */
  setDraculaBlood(blood: number) {
    this.log(this.dracula.setBlood(blood));
  }

  /**
   * Sets the Locations where Heavenly Host markers are located
   * @param location1 The name of the first Location
   * @param location2 The name of the second Location
   */
  setHeavenlyHostLocations(location1: string, location2: string) {
    this.heavenlyHostLocations = [];
    const hostLocation1 = this.map.locations.find(location => location.name == location1);
    const hostLocation2 = this.map.locations.find(location => location.name == location2);
    if (hostLocation1) {
      this.heavenlyHostLocations.push(hostLocation1);
    }
    if (hostLocation2) {
      this.heavenlyHostLocations.push(hostLocation2);
    }
  }

  /**
   * Sets a Hunter's bites
   * @param hunter The Hunter to update
   * @param bites The value to which to set the Hunter's bites
   */
  setHunterBites(hunter: Hunter, bites: number) {
    if ((hunter.name == HunterName.vanHelsing && bites == 3) || (hunter.name !== HunterName.vanHelsing && bites == 2)) {
      this.defeatHunter(hunter);
    } else {
      this.log(hunter.setBites(bites));
    }
  }

  /**
   * Sets a Hunter's health
   * @param hunter The Hunter to update
   * @param health The value to which to set the Hunter's health
   */
  setHunterHealth(hunter: Hunter, health: number) {
    if (health == 0) {
      this.defeatHunter(hunter);
    } else {
      this.log(hunter.setHealth(health));
    }
  }

  /**
   * Sets a Hunter's currentLocation
   * @param hunter The Hunter to move
   * @param locationName The name of the Location to which to move the Hunter
   */
  setHunterLocation(hunter: Hunter, locationName: string) {
    this.huntersInGroup(hunter).forEach(companion => {
      const previousLocation = companion.currentLocation;
      this.log(companion.setLocation(this.map.getLocationByName(locationName)));
      if (this.dracula.willPlayCustomsSearch(hunter, previousLocation)) {
        this.log(`Dracula played Customs Search on ${companion.name}`);
        this.log(`${companion.name} must discard all items and their turn ends`)
      }
    });
  }

  /**
   * Sets the Resolve track value
   * @param count The value to which to set the Resolve track
   */
  setResolveTrack(count: number) {
    this.resolveTrack = Math.max(0, Math.min(6, count));
    this.log(`Resolve track is now on ${this.resolveTrack}`);
  }

  /**
   * Sets the Location for Stormy Seas
   * @param stormLocation The Location where Stormy Seas will take effect
   */
  setStormLocation(stormLocation: string) {
    this.log(`Stormy Seas in ${stormLocation}`);
    this.stormLocation = this.map.locations.find(location => location.name == stormLocation);
    this.stormRounds = 3;
    this.eventPendingResolution = null;
  }

  /**
   * Sets up combat cards for the given opponent
   * @param opponentName The name of the opponent fighting the Hunter
   * @param hunter The Hunter fighting the opponent
   */
  setUpCombat(opponentName: string, hunter: Hunter) {
    if (opponentName == 'None') {
      this.opponent = null;
      this.huntersInGroup(hunter).forEach(companion => {
        companion.lastUsedCombatItem = '';
        companion.inCombat = false;
      });
    } else {
      this.log(`Entering combat with ${opponentName}`);
      this.opponent = opponentName;
      switch (opponentName) {
        case EncounterName.Assassin:
          this.dracula.availableAttacks = [
            Attack.DodgeMinion,
            Attack.Punch,
            Attack.Knife,
            Attack.Pistol,
            Attack.Rifle
          ];
          this.dracula.lastUsedAttack = Attack.DodgeMinion;
          break;
        case EncounterName.MinionWithKnife:
          this.dracula.availableAttacks = [
            Attack.DodgeMinion,
            Attack.Punch,
            Attack.Knife,
          ];
          this.dracula.lastUsedAttack = Attack.DodgeMinion;
          break;
        case EncounterName.MinionWithKnifeAndPistol:
          this.dracula.availableAttacks = [
            Attack.DodgeMinion,
            Attack.Punch,
            Attack.Knife,
            Attack.Pistol,
          ];
          this.dracula.lastUsedAttack = Attack.DodgeMinion;
          break;
        case EncounterName.MinionWithKnifeAndRifle:
          this.dracula.availableAttacks = [
            Attack.DodgeMinion,
            Attack.Punch,
            Attack.Knife,
            Attack.Rifle
          ];
          this.dracula.lastUsedAttack = Attack.DodgeMinion;
          break;
        case EncounterName.Dracula:
        case EncounterName.NewVampire:
          this.dracula.availableAttacks = this.timePhase < 3 ? [
            Attack.Claws,
            Attack.DodgeDracula,
            Attack.EscapeMan
          ] : [
              Attack.Claws,
              Attack.DodgeDracula,
              Attack.EscapeMan,
              Attack.EscapeBat,
              Attack.EscapeMist,
              Attack.Fangs,
              Attack.Mesmerize,
              Attack.Strength
            ];
          this.dracula.lastUsedAttack = Attack.DodgeDracula;
          break;
      }
      this.dracula.repelled = false;
      this.roundsContinued = 0;
      this.rageRounds = 0;
      this.huntersInGroup(hunter).forEach(companion => {
        companion.lastUsedCombatItem = '';
        companion.inCombat = true;
      });
    }
  }

  /**
   * Sets the Vampire track value
   * @param count The value to which to set the Vampire track
   */
  setVampireTrack(count: number) {
    this.vampireTrack = Math.max(0, Math.min(6, count));
    this.log(`Vampire track is now on ${this.vampireTrack}`);
    if (this.vampireTrack >= 6) {
      this.log('Dracula has spread his Vampires across Europe. The Hunters lose!');
    }
  }

  /**
   * Shows Dracula an Event in a Hunter's hand
   * @param hunter The Hunter showing the Event
   * @param eventName The name of the Event shown
   */
  showEventToDracula(hunter: Hunter, eventName: string) {
    this.dracula.updateEventTrackingFromShown(hunter, eventName);
  }


  /**
   * Shows Dracula an Item in a Hunter's hand
   * @param hunter The Hunter showing the Item
   * @param itemName The name of the Item shown
   */
  showItemToDracula(hunter: Hunter, itemName: string) {
    this.dracula.updateItemTrackingFromShown(hunter, itemName);
  }

  /**
   * Shuffles the Encounters in the deck
   */
  shuffleEncounters(): string {
    const shuffledEncounters = [];
    while (this.encounterPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.encounterPool.length);
      this.encounterPool[randomIndex].revealed = false;
      shuffledEncounters.push(this.encounterPool.splice(randomIndex, 1)[0]);
    }
    this.encounterPool = shuffledEncounters;
    return `Shuffled ${this.encounterPool.length} encounters in encounter pool`;
  }

  /**
   * Shuffles the Events in the deck
   */
  shuffleEvents(): string {
    const shuffledEvents = [];
    while (this.eventDeck.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.eventDeck.length);
      shuffledEvents.push(this.eventDeck.splice(randomIndex, 1)[0]);
    }
    this.eventDeck = shuffledEvents;
    return `Shuffled ${this.eventDeck.length} events in event deck`;
  }

  /**
   * Makes Dracula's first turn (selects his start location)
   */
  startGame() {
    const startLocation = this.dracula.chooseStartLocation();
    this.log(this.dracula.setLocation(startLocation));
    this.dracula.initialisePossibleTrails();
    this.pushToTrail({ location: startLocation, revealed: false });
    this.log('It is now Godalming\'s turn');
  }

  /**
   * Takes an Item out of a Hunter's hand to trade it to another Hunter
   * @param itemName The name of the Item to remove
   * @param hunter The Hunter giving the Item away
   */
  tradeItemFromHunter(itemName: string, hunter: Hunter) {
    let itemIndex = 0;
    for (itemIndex; itemIndex < hunter.items.length; itemIndex++) {
      if (hunter.items[itemIndex].name == itemName) {
        break;
      }
    }
    this.itemInTrade = hunter.items.splice(itemIndex, 1)[0];
    this.fromHunter = hunter;
    this.log(`${hunter.name} gave away item ${itemName}`);
  }

  /**
   * Gives an Item previous traded away from a Hunter to another Hunter
   * @param hunter The Hunter receiving the Item
   */
  tradeItemToHunter(hunter: Hunter) {
    hunter.items.push(this.itemInTrade);
    this.log(`${hunter.name} received item ${this.itemInTrade.name}`);
    this.itemInTrade = null;
    this.dracula.updateItemTrackingFromTrade(this.fromHunter, hunter);
  }

  /**
   * Determines if a given Location is in the trail
   * @param location The Location to look for
   */
  trailContains(location: Location): boolean {
    this.trail.forEach(card => {
      if (card.location == location) {
        return true;
      }
    });
    return false;
  }

  /**
   * Updates the effects from Dracula's Ally
   */
  updateAllyEffects() {
    this.dracula.encounterHandSize = 5;
    this.dracula.eventHandSize = 4;
    switch (this.draculaAlly.name) {
      case EventName.DraculasBrides:
        this.dracula.encounterHandSize = 7;
        this.log('Dracula\'s encounter hand size is 7')
        this.log(this.dracula.drawUpEncounters());
        break;
      case EventName.ImmanuelHildesheim:
        this.dracula.eventHandSize = 6;
        this.log('Dracula\'s event hand size is 6')
        break;
      case EventName.QuinceyPMorris:
        this.log('Dracula can target one Hunter each turn for 1 Health loss');
        break;
    }
    this.log(this.dracula.discardDownEncounters());
    this.log(this.dracula.discardDownEvents());
  }

  /**
   * Updates Dracula's revealed status based on the status of the card in the first trail slot
   */
  updateDraculaRevealed() {
    if (this.trail[0]) {
      if (this.trail[0].revealed && !this.dracula.revealed) {
        this.dracula.revealed = true;
        this.log(`Dracula is revealed at ${this.dracula.currentLocation.name}`);
      }
    }
  }

  /**
   * Uses an Item from a Hunter
   * @param hunter The Hunter with the Item
   * @param itemName The Item name
   */
  useItem(hunter: Hunter, itemName: string) {
    switch (itemName) {
      case ItemName.Dogs:
        this.log(`${hunter.name} has placed Dogs face up`);
        this.dracula.updateItemTrackingFromShown(hunter, itemName);
        break;
      case ItemName.FastHorse:
        hunter.usingFastHorse = true;
        this.discardHunterItem(itemName, hunter);
        this.log(`${hunter.name} is using a Fast Horse`);
        break;
      case ItemName.Garlic:
        this.rageRounds = 3;
        this.discardHunterItem(itemName, hunter);
        this.log(`${hunter.name} is using Garlic`);
        break;
      case ItemName.HeavenlyHost:
        this.log(`${hunter.name} is using Heavenly Host`);
        this.log('Move one of the Heavenly Host makers');
        this.discardHunterItem(itemName, hunter);
        break;
      case ItemName.HolyWater:
        this.log(`${hunter.name} is using Holy Water`);
        this.log('Roll the die to determine outcome and apply results');
        this.discardHunterItem(itemName, hunter);
        break;
      case ItemName.LocalRumors:
        if (this.selectedTrailEncounter > -1 && this.trail.length > this.selectedTrailEncounter) {
          if (this.trail[this.selectedTrailEncounter].encounter) {
            this.trail[this.selectedTrailEncounter].encounter.revealed = true;
            this.discardHunterItem(itemName, hunter);
            this.log(`${hunter.name} is using Local Rumors`);
          } else {
            this.log('Select an Encounter to reveal to use this item');
          }
        } else if (this.selectedCatacombEncounterA > -1 && this.catacombs.length > this.selectedCatacombEncounterA) {
          if (this.catacombs[this.selectedCatacombEncounterA].encounter) {
            this.catacombs[this.selectedCatacombEncounterA].encounter.revealed = true;
            this.discardHunterItem(itemName, hunter);
            this.log(`${hunter.name} is using Local Rumors`);
          } else {
            this.log('Select an Encounter to reveal to use this item');
          }
        } else if (this.selectedCatacombEncounterB > -1 && this.catacombs.length > this.selectedCatacombEncounterA) {
          if (this.catacombs[this.selectedCatacombEncounterB].catacombEncounter) {
            this.catacombs[this.selectedCatacombEncounterB].catacombEncounter.revealed = true;
            this.discardHunterItem(itemName, hunter);
            this.log(`${hunter.name} is using Local Rumors`);
          } else {
            this.log('Select an Encounter to reveal to use this item');
          }
        } else {
          this.log('Select an Encounter to reveal to use this item');
        }
        break;
      default:
        this.log(`Not applicable for ${hunter.name} to use ${itemName} at this time`);
        break;
    }
  }
}
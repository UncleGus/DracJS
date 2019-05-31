import * as _ from 'lodash';
import { GameMap, LocationType, Location, LocationName, LocationDomain } from "./map";
import { Dracula, TrailCard, PowerName, Attack } from "./dracula";
import { Hunter, HunterName } from "./hunter";
import { Encounter, initialiseEncounterPool, EncounterName } from "./encounter";
import { Item, initialiseItemDeck } from "./item";
import { Event, initialiseEventDeck, EventType, EventName } from "./event";
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
  roadBlock: Location[];

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
    this.dracula = new Dracula();
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
   * Adds a message to the console text box in a new line
   * @param message the message to display
   */
  log(message: string) {
    this.logText += message ? `\n${message}` : '';
  }

  /**
   * Sets up the initial state of the game
   */
  initialiseGameState() {
    this.logText = 'INITIALISING GAME STATE';
    this.log(this.map.verifyMapData());
    this.log(this.shuffleEncounters());
    this.log(this.dracula.drawUpEncounters(this.encounterPool));
    this.log(this.shuffleEvents());
    this.timePhase = -1;
    this.vampireTrack = 0;
    this.resolveTrack = 0;
    this.trail = [];
    this.log('GAME STATE INITIALISED');
  }

  /**
   * Makes Dracula's first turn (selects his start location)
   */
  startGame() {
    const startLocation = this.dracula.chooseStartLocation(this);
    this.log(this.dracula.setLocation(startLocation));
    this.pushToTrail({ location: startLocation, revealed: false });
    this.log('It is now Dracula\'s turn');
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
   * Sets a Hunter's currentLocation
   * @param hunter The Hunter to move
   * @param locationName The name of the Location to which to move the Hunter
   */
  setHunterLocation(hunter: Hunter, locationName: string) {
    this.huntersInGroup(hunter).forEach(companion => {
      const previousLocation = companion.currentLocation;
      this.log(companion.setLocation(this.map.getLocationByName(locationName)));
      if (this.dracula.willPlayCustomsSearch(hunter, previousLocation, this)) {
        this.log(`Dracula played Customs Search on ${companion.name}`);
        this.log(`${companion.name} must discard all items and their turn ends`)
      }
    });
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
   * Sets Dracula's blood
   * @param blood The value to which to set Dracula's blood
   */
  setDraculaBlood(blood: number) {
    this.log(this.dracula.setBlood(blood));
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
   * Sets the Resolve track value
   * @param count The value to which to set the Resolve track
   */
  setResolveTrack(count: number) {
    this.resolveTrack = Math.max(0, Math.min(6, count));
    this.log(`Resolve track is now on ${this.resolveTrack}`);
  }

  /**
   * Performs the Timekeeping phase of Dracula's turn, including selecting his next move
   * This needs to be done at this point as it affects what he does with the catacombs
   */
  performTimeKeepingPhase() {
    this.log('Performing Timekeeping phase');
    if (this.draculaAlly) {
      if (this.draculaAlly.name == EventName.QuinceyPMorris) {
        this.log(this.dracula.chooseVictimForQuincey(this));
      }
    }
    this.log(this.dracula.chooseNextMove(this));

    // evaluate catacombs
    this.log(this.dracula.evaluateCatacombs(this));

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
   * This performs Dracula's movement phase, which can be a basic movement or a power
   */
  performDraculaMovementPhase() {
    if (!this.dracula.nextMove) {
      this.log('Dracula has no valid moves');
      this.log(this.dracula.die());
      this.log(this.dracula.clearTrail(this, 1));
      this.dracula.revealed = true;
      this.trail[0].revealed = true;
      this.log(this.dracula.chooseNextMove(this));
    }

    let doubleBackTrailIndex: number;
    let doubleBackCatacombIndex: number;
    let doubleBackedCard: TrailCard;
    if (this.dracula.nextMove.power) {
      switch (this.dracula.nextMove.power.name) {
        case PowerName.DarkCall:
          this.log('Dracula played power Dark Call');
          this.log(this.dracula.executeDarkCall(this));
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
          }
          if (doubleBackCatacombIndex) {
            this.log(`Dracula Doubled Back to the location in position ${doubleBackCatacombIndex + 1} of the trail`);
            const doubleBackedCard = this.catacombs.splice(doubleBackCatacombIndex, 1)[0];
            this.pushToTrail(doubleBackedCard);
            this.log(this.dracula.decideWhichEncounterToKeep(this.trail[0], this));
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
            this.dracula.revealed = false;
          }
          break;
        case PowerName.WolfForm:
          this.log('Dracula played power Wolf Form');
          break;
        case PowerName.WolfFormAndHide:
          this.log('Dracula played power Wolf Form');
          break;
      }
      if (this.dracula.nextMove.power.cost !== 0) {
        // pay blood for power
        this.log(this.dracula.setBlood(this.dracula.blood - this.dracula.nextMove.power.cost));
      }
    }
    let nextLocation: Location;
    if (this.dracula.nextMove.location) {
      nextLocation = this.dracula.nextMove.location;
      // check if new location causes Dracula to be revealed
      if (nextLocation.type == LocationType.castle || (nextLocation.type !== LocationType.sea && (nextLocation == this.godalming.currentLocation || nextLocation == this.seward.currentLocation ||
        nextLocation == this.vanHelsing.currentLocation || nextLocation == this.mina.currentLocation))) {
        this.dracula.revealed = true;
      } else {
        this.dracula.revealed = false;
      }

      // move to new location
      this.log(this.dracula.setLocation(nextLocation));

      // pay blood for sea travel
      if (nextLocation.type == LocationType.sea && !this.dracula.seaBloodPaid) {
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
      this.log(this.dracula.decideFateOfDroppedOffCard(droppedOffCard, this));
      if (this.dracula.currentLocation.type == LocationType.castle) {
        this.setDraculaBlood(this.dracula.blood + 2);
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
      }
    }

    if (this.dracula.droppedOffEncounter) {
      this.log(this.dracula.decideFateOfDroppedOffEncounter(this));
    }

    // Refill encounter hand
    this.log(this.dracula.drawUpEncounters(this.encounterPool));
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
      this.log(this.dracula.discardDownEvents(this.eventDiscard));
    } else {
      this.log(`Dracula drew ${eventCardDrawn.name}`);
      if (eventCardDrawn.type == EventType.Ally) {
        if (!this.draculaAlly) {
          this.draculaAlly = eventCardDrawn;
        } else {
          if (this.dracula.replaceExistingAlly(eventCardDrawn, this)) {
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
        this.dracula.eventAwaitingApproval = eventCardDrawn.name;
      }
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
    hunter.events.push(this.eventDeck.splice(eventIndex, 1)[0]);
    this.log(`${hunter.name} took event ${eventName}`);
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
   * Plays an Event of the given name from the given Hunter
   * @param eventName The name of the Event
   * @param hunter The Hunter playing the Event
   */
  playHunterEvent(eventName: string, hunter: Hunter, locationNames: string[] = [], allySelected?: boolean, roadblockSelected?: boolean) {
    // TODO: so much
    if (this.dracula.eventAwaitingApproval && eventName !== EventName.GoodLuck) {
      return;
    }
    if (eventName == EventName.HiredScouts && locationNames.length < 2) {
      this.log('Choose two cities to investigate with Hired Scouts');
      return;
    }
    let eventIndex = 0;
    for (eventIndex; eventIndex < hunter.events.length; eventIndex++) {
      if (hunter.events[eventIndex].name == eventName) {
        break;
      }
    }
    const eventCardPlayed = hunter.events.splice(eventIndex, 1)[0];
    if (eventCardPlayed.type == EventType.Ally) {
      if (this.hunterAlly) {
        this.log(`Hunters discarded Ally ${this.hunterAlly.name}`);
        this.eventDiscard.push(this.hunterAlly);
      }
      this.hunterAlly = eventCardPlayed;
    } else {
      this.eventDiscard.push(eventCardPlayed);
    }
    // TODO: This is only necessary if Dracula needs to know the Hunters' intent
    // if (eventName == EventName.GoodLuck) {
    //   if (allySelected && this.draculaAlly) {
    //     this.log(`${hunter.name} played Good Luck to discard ${this.draculaAlly.name}`);
    //   } else if (roadblockSelected && this.roadBlock.length == 2) {
    //     this.log(`${hunter.name} played Good Luck to discard the roadblock between ${this.roadBlock[0].name} and ${this.roadBlock[0].name}`);
    //   }
    // }
    // if (locationNames.length > 0) {
    //   this.log(`${hunter.name} played event ${eventName} on ${locationNames[0]}${locationNames.length > 1 ? `and ${locationNames[1]}` : ''}`);
    // }
    if (this.dracula.willPlayFalseTipOffToCancel(eventCardPlayed, this)) {
      this.log(`Dracula played False Tip-off to cancel ${eventCardPlayed.name}`);
    } else if (this.dracula.willPlayDevilishPowerToCancel(eventCardPlayed, this)) {
      this.log(`Dracula played Devilish Power to cancel ${eventCardPlayed.name}`);
    }
    switch (eventCardPlayed.name) {
      case EventName.HiredScouts:
        locationNames.forEach(name => {
          const trailCard = this.trail.find(card => card.location == this.map.getLocationByName(name));
          if (trailCard) {
            this.log(`${name} is in Dracula's trail`);
            trailCard.revealed = true;
            if (trailCard.encounter) {
              trailCard.encounter.revealed = true;
            }
            if (this.dracula.currentLocation == trailCard.location) {
              this.dracula.revealed = true;
            }
          } else {
            this.log(`${name} is not in Dracula's trail`);
          }
        });
        locationNames.forEach(name => {
          const catacombCard = this.catacombs.find(card => card.location == this.map.getLocationByName(name));
          if (catacombCard) {
            this.log(`${name} is in Dracula's trail`);
            catacombCard.revealed = true;
            if (catacombCard.encounter) {
              catacombCard.encounter.revealed = true;
            }
            if (catacombCard.catacombEncounter) {
              catacombCard.catacombEncounter.revealed = true;
            }
          } else {
            this.log(`${name} is not in Dracula's catacombs`);
          }
        });
        break;
      case EventName.MoneyTrail:
        this.trail.forEach(card => {
          if (card.location) {
            if (card.location.type == LocationType.sea) {
              card.revealed = true;
              this.log(`${card.location.name} revealed by Money Trail`);
            }
          }
        });
        break;
      case EventName.MysticResearch:
        this.dracula.eventHand.forEach(card => {
          this.log(`Dracula has ${card.name}`);
        });
        break;
      case EventName.NewspaperReports:
        this.resolveNewspaperReports();
        break;
    }
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
        this.dracula.repelled = false;
        this.roundsContinued = 0;
        this.huntersInGroup(hunter).forEach(companion => {
          companion.lastUsedCombatItem = '';
          companion.inCombat = true;
        });
        this.log('Resolve a combat against Dracula');
        break;
      case EncounterName.Ambush:
        this.dracula.encounterHandSize += 1;
        this.log(this.dracula.drawUpEncounters(this.encounterPool));
        this.dracula.encounterHandSize -= 1;
        this.log(this.dracula.discardDownEncounters(this.encounterPool));
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.Assassin:
        this.dracula.availableAttacks = [
          Attack.DodgeMinion,
          Attack.Punch,
          Attack.Knife,
          Attack.Pistol,
          Attack.Rifle
        ];
        this.dracula.lastUsedAttack = Attack.DodgeMinion;
        this.dracula.repelled = false;
        this.roundsContinued = 0;
        this.huntersInGroup(hunter).forEach(companion => {
          companion.lastUsedCombatItem = '';
          companion.inCombat = true;
        });
        this.log(`Resolve a combat against ${EncounterName.MinionWithKnife} - an escape result means no further encounters are resolved`);
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
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
      case EncounterName.MinionWithKnife:
        this.dracula.availableAttacks = [
          Attack.DodgeMinion,
          Attack.Punch,
          Attack.Knife
        ];
        this.dracula.lastUsedAttack = Attack.DodgeMinion;
        this.dracula.repelled = false;
        this.roundsContinued = 0;
        this.huntersInGroup(hunter).forEach(companion => {
          companion.lastUsedCombatItem = '';
          companion.inCombat = true;
        });
        this.log(`Resolve a combat against ${EncounterName.MinionWithKnife}`);
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.MinionWithKnifeAndPistol:
        this.dracula.availableAttacks = [
          Attack.DodgeMinion,
          Attack.Punch,
          Attack.Knife,
          Attack.Pistol
        ];
        this.dracula.lastUsedAttack = Attack.DodgeMinion;
        this.dracula.repelled = false;
        this.roundsContinued = 0;
        this.huntersInGroup(hunter).forEach(companion => {
          companion.lastUsedCombatItem = '';
          companion.inCombat = true;
        });
        this.log(`Resolve a combat against ${EncounterName.MinionWithKnife}`);
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.MinionWithKnifeAndRifle:
        this.dracula.availableAttacks = [
          Attack.DodgeMinion,
          Attack.Punch,
          Attack.Knife,
          Attack.Rifle
        ];
        this.dracula.lastUsedAttack = Attack.DodgeMinion;
        this.dracula.repelled = false;
        this.roundsContinued = 0;
        this.huntersInGroup(hunter).forEach(companion => {
          companion.lastUsedCombatItem = '';
          companion.inCombat = true;
        });
        this.log(`Resolve a combat against ${EncounterName.MinionWithKnife}`);
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
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
        // TODO: integrate with Dracula's knowledge of Hunter Items
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
        // TODO: integrate with Dracula's knowledge of Hunter Items
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
        // TODO: integrate with Dracula's knowledge of Hunter's next move
        if (hunter.groupNumber == 0) {
          this.log(`${hunter.name} must show Dracula all items and events and declare next move`);
        } else {
          this.log('The Hunter group must show Dracula all items and events and declare their next moves');
        }
        this.encounterPool.push(currentEncounter);
        this.log(this.shuffleEncounters());
        this.log(`${encounterName} resolved`);
        break;
      case EncounterName.Thief:
        // TODO: integrate with Dracula's knowledge of Hunter Items
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
        // TODO: integrate with Dracula's knowledge of Hunter Items
        if (this.timePhase < 3) {
          if (hunter.groupNumber == 0) {
            this.log(`${hunter.name} found a vampire during the day and killed it`);
          } else {
            this.log('The Hunter group found a vampire during the day and killed it');
          }
        } else {
          if (hunter.groupNumber == 0) {
            this.log(`${hunter.name} has encountered a vampire at night and must roll a die`);
            this.log(`On a roll of 1-3, ${hunter.name} is bitten, unless they show Dracula a Heavenly Host or Crucifix item`);
            this.log(`On a roll of 4-6, the vampire escapes unless ${hunter.name} discards a Knife or a Stake item`);
            this.log(`If the vampire escapes, leave it here and ${hunter.name}'s turn ends, otherwise discard it`);
          } else {
            this.log('The Hunter group has encountered a vampire at night and must roll a die');
            this.log('On a roll of 1-3, each Hunter is bitten, unless they show Dracula a Heavenly Host or Crucifix item');
            this.log('On a roll of 4-6, the vampire escapes unless one Hunter discards a Knife or a Stake item');
            this.log('If the vampire escapes, leave it here and the group\'s turn ends, otherwise discard it');
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
   * Chooses which combat card Dracula plays in a current round of combat
   * @param hunters The Hunters involved in the combat
   * @param items The names of the combat cards chosen by the Hunters
   */
  resolveCombatRound(hunters: Hunter[], items: string[]) {
    for (let i = 0; i < hunters.length; i++) {
      this.log(`${hunters[i].name} used ${items[i]}`);
    }
    this.log(this.dracula.chooseCombatCardAndHunter(hunters));
    for (let i = 0; i < hunters.length; i++) {
      hunters[i].lastUsedCombatItem = items[i];
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
   * Applies the outcome of a successful attack with the given Item
   * @param itemName The name of the Item used in the successful attack
   */
  applyHunterAttackSuccess(itemName: string) {
    const outcome = getHunterSuccessCombatOutcome(itemName, this.dracula.lastUsedAttack);
    this.dracula.repelled = false;
    outcome.forEach(effect => {
      this.handleEffect(effect);
    });
  }

  /**
   * Decides which Hunter to whom to apply the successful attack
   * @param hunters The Hunters involved in the combat
   */
  applyEnemyAttackSuccess() {
    const outcome = getEnemySuccessCombatOutcome(this.dracula.lastAttackedHunter.lastUsedCombatItem, this.dracula.lastUsedAttack);
    this.dracula.repelled = false;
    outcome.forEach(effect => {
      this.handleEffect(effect, this.dracula.lastAttackedHunter);
    });
  }

  /**
   * Handles an individual combat effect
   * @param effect The effect to handle
   */
  handleEffect(effect: CombatOutcome, hunter?: Hunter) {
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
        this.resolveEscapeAsBat();
        break;
      case CombatOutcome.Continue:
        this.roundsContinued++;
        if (this.roundsContinued > 2) {
          this.log('Combat ends');
          this.godalming.inCombat = false;
          this.seward.inCombat = false;
          this.vanHelsing.inCombat = false;
          this.mina.inCombat = false;
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
        break;
      case CombatOutcome.Invalid:
        this.log(`This is not a valid combat card combination: ${hunter.lastUsedCombatItem} and ${this.dracula.lastUsedAttack}`);
        break;
    }
  }

  /**
   * Resolves the Newspaper Reports effect from Resolve or an Event
   * @param fromResolve Whether this is the Resolve power being used
   */
  resolveNewspaperReports(fromResolve = false) {
    // TODO: allow Dracula to counter this with an Event card
    if (fromResolve && this.resolveTrack < 1) {
      this.log('No Resolve to play Newspaper Reports');
      return;
    }
    let i = this.trail.length - 1;
    for (i; i > 0; i--) {
      if (!this.trail[i].revealed) {
        this.trail[i].revealed = true;
        break;
      }
    }
    if (i > 0) {
      this.log('Oldest unrevealed trail card revealed');
      if (fromResolve) {
        this.resolveTrack--;
      }
    } else {
      this.log('No valid trail cards to reveal');
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
      const destination = this.dracula.chooseBatDestination(possibleDestinations, this);
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
   * Checks if Dracula wants to play Control Storms on a Hunter and handles it if so
   * @param hunters The Hunters in this group
   */
  checkForControlStorms(hunters: Hunter[]): boolean {
    const port = this.dracula.chooseControlStormsDestination(hunters, this);
    if (port) {
      this.log(`Dracula played Control Storms to move ${hunters.length == 1 ? hunters[0].name : 'the group'} to ${port.name}`);
    } else {
      return false;
    }
  }

  /**
   * Determines if Dracula will play a start of turn Event
   */
  draculaChooseStartOfTurnEvent() {
    let logMessage = this.dracula.chooseStartOfTurnEvent(this);
    if (logMessage) {
      this.log(logMessage);
      return true;
    }
  }

  /**
   * Determines if Dracula will play a start of movement Event
   */
  draculaChooseStartOfMovementEvent() {
    // TODO: this is a placeholder
    return;
  }

  /**
   * Determines if Dracula will play a start of action Event
   */
  draculaPlaysStartOfActionEvent(): boolean {
    // TODO: this is a placeholder
    return false;
  }

  /**
   * Determines if Dracula will play False Tip-off
   * @param hunter The Hunter attempting to catch a train
   */
  draculaPlaysFalseTipoff(hunters: Hunter[]): boolean {
    if (this.dracula.willPlayFalseTipoff(hunters, this)) {
      this.log('Dracula played False Tip-off');
      return true;
    }
    return false;
  }

  /**
   * Resolves an Event played by Dracula that the Hunters have not chosen to cancel
   */
  resolveApprovedEvent() {
    switch (this.dracula.eventAwaitingApproval) {
      case EventName.DevilishPower:
        this.log(this.dracula.chooseTargetForDevilishPower(this));
        break;
      case EventName.Evasion:
        this.dracula.revealed = false;
        const evasionDestination = this.dracula.chooseEvasionDestination(this);
        this.pushToTrail({ revealed: false, location: evasionDestination, encounter: this.dracula.chooseEncounterForTrail() });
        break;
      case EventName.NightVisit:
        this.log(this.dracula.chooseHunterToNightVisit(this));
        break;
    }
    this.dracula.eventAwaitingApproval = null;
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
   * Updates the effects from Dracula's Ally
   */
  updateAllyEffects() {
    this.dracula.encounterHandSize = 5;
    this.dracula.eventHandSize = 4;
    switch (this.draculaAlly.name) {
      case EventName.DraculasBrides:
        this.dracula.encounterHandSize = 7;
        this.log(this.dracula.drawUpEncounters(this.encounterPool));
        break;
      case EventName.ImmanuelHildesheim:
        this.dracula.eventHandSize = 6;
        break;
    }
    this.log(this.dracula.discardDownEncounters(this.encounterPool));
    this.log(this.dracula.discardDownEvents(this.eventDiscard));
  }

  resolveHypnosis() {
    this.dracula.revealed = true;
    this.log(`Dracula is at ${this.dracula.currentLocation.name}`);
    this.trail.forEach(card => {
      if (card.location == this.dracula.currentLocation) {
        card.revealed = true;
      }
      if (card.encounter) {
        if (card.encounter.name == EncounterName.NewVampire) {
          card.encounter.revealed = true;
          this.log('A New Vampire is revealed in Dracula\'s trail');
        }
      }
    });
    this.catacombs.forEach(card => {
      if (card.encounter) {
        if (card.encounter.name == EncounterName.NewVampire) {
          card.encounter.revealed = true;
          this.log('A New Vampire is revealed in Dracula\'s catacombs');
        }
        if (card.catacombEncounter.name == EncounterName.NewVampire) {
          card.catacombEncounter.revealed = true;
          this.log('A New Vampire is revealed in Dracula\'s catacombs');
        }
      }
    });
    this.timePhase = (this.timePhase + 1) % 6;
    this.dracula.chooseNextMove(this);
    this.timePhase = (this.timePhase + 5) % 6;
    this.dracula.hypnosisInEffect = true;
    if (!this.dracula.nextMove) {
      this.log('Dracula has no legal next move');
    } else {
      if (this.dracula.nextMove.power) {
        this.log(`Dracula will use power ${this.dracula.nextMove.power.name}`);
      }
      if (this.dracula.nextMove.location) {
        this.log(`Dracula will move to ${this.dracula.nextMove.location.name}`)
      }
    }
  }
}
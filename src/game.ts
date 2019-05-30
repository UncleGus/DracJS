import { GameMap, LocationType, Location, LocationName, LocationDomain } from "./map";
import { Dracula, TrailCard, PowerName, Attack } from "./dracula";
import { Mina, Godalming, Seward, VanHelsing, Hunter } from "./hunter";
import { Encounter, initialiseEncounterPool, EncounterName } from "./encounter";
import { Item, initialiseItemDeck, ItemName } from "./item";
import { Event, initialiseEventDeck, EventType, EventName } from "./event";
import { getHunterSuccessCombatOutcome } from "./combat";

export class Game {
  map: GameMap;
  encounterPool: Encounter[];
  itemDeck: Item[];
  itemDiscard: Item[];
  itemInTrade: Item;
  eventDeck: Event[];
  eventDiscard: Event[];
  consecratedLocation: Location;
  hunterAlly: Event;
  draculaAlly: Event;
  dracula: Dracula;
  godalming: Godalming;
  seward: Seward;
  vanHelsing: VanHelsing;
  mina: Mina;
  logText: string;
  timePhase: number;
  vampireTrack: number;
  resolveTrack: number;
  trail: TrailCard[];
  catacombs: TrailCard[];
  selectedTrailEncounter: number;
  selectedCatacombEncounterA: number;
  selectedCatacombEncounterB: number;

  constructor() {
    // construct game components
    this.map = new GameMap();
    this.encounterPool = initialiseEncounterPool();
    this.itemDeck = initialiseItemDeck();
    this.itemDiscard = [];
    this.eventDeck = initialiseEventDeck();
    this.eventDiscard = [];
    this.catacombs = [];
    this.dracula = new Dracula();
    this.godalming = new Godalming;
    this.seward = new Seward();
    this.vanHelsing = new VanHelsing();
    this.mina = new Mina();

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
    this.log(this.pushToTrail({ location: startLocation, revealed: false }));
    this.log('It is now Dracula\'s turn');
  }

  /**
   * Searches at a Hunter's current location for Dracula, his trail and his catacombs
   * @param hunter the Hunter searching
   */
  searchWithHunter(hunter: Hunter) {
    // TODO: attack Dracula
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
    if (hunter.groupNumber == 0) {
      this.log(hunter.setLocation(this.map.getLocationByName(locationName)));
    } else {
      if (this.godalming.groupNumber == hunter.groupNumber) {
        this.log(this.godalming.setLocation(this.map.getLocationByName(locationName)));
      }
      if (this.seward.groupNumber == hunter.groupNumber) {
        this.log(this.seward.setLocation(this.map.getLocationByName(locationName)));
      }
      if (this.vanHelsing.groupNumber == hunter.groupNumber) {
        this.log(this.vanHelsing.setLocation(this.map.getLocationByName(locationName)));
      }
      if (this.mina.groupNumber == hunter.groupNumber) {
        this.log(this.mina.setLocation(this.map.getLocationByName(locationName)));
      }
    }
  }

  /**
   * Sets a Hunter's health
   * @param hunter The Hunter to update
   * @param health The value to which to set the Hunter's health
   */
  setHunterHealth(hunter: Hunter, health: number) {
    this.log(hunter.setHealth(health));
  }

  /**
   * Sets Dracula's blood
   * @param blood The value to which to set Dracula's blood
   */
  setDraculaBlood(blood: number) {
    this.log(this.dracula.setBlood(blood));
  }

  /**
   * Moves the Consecrated Ground marker to the Location with the given name
   * @param locationName The name of the Location to which to move the Consecrated Ground marker
   */
  moveConescratedGroundMarker(locationName: string) {
    this.consecratedLocation = this.map.getLocationByName(locationName);
  }

  /**
   * Performs the Timekeeping phase of Dracula's turn, including selecting his next move
   * This needs to be done at this point as it affects what he does with the catacombs
   */
  performTimeKeepingPhase() {
    this.log('Performing Timekeeping phase');
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
        this.vampireTrack += 1;
        this.resolveTrack += 1;
        this.timePhase = 0;

        if (this.vampireTrack >= 6) {
          this.log('Dracula has spread his Vampires across Europe. The Hunters lose!');
        }
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
      this.log(this.pushToTrail({ revealed: this.dracula.revealed, location: nextLocation, power: this.dracula.nextMove.power }));
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
    // TODO: attack the hunter(s) at this location or choose an encounter to place on the card
    if (this.dracula.currentLocation.type !== LocationType.sea && (this.dracula.currentLocation == this.godalming.currentLocation || this.dracula.currentLocation == this.seward.currentLocation ||
      this.dracula.currentLocation == this.vanHelsing.currentLocation || this.dracula.currentLocation == this.mina.currentLocation)) {
      this.log('Dracula attacks!');
    } else if (this.dracula.currentLocation.type !== LocationType.castle && this.dracula.currentLocation.type !== LocationType.sea &&
      (!this.dracula.nextMove.power || this.dracula.nextMove.power.name == 'Hide' || this.dracula.nextMove.power.name == 'Wolf Form' || this.dracula.nextMove.power.name == 'Wolf Form and Hide')) {
      this.trail[0].encounter = this.dracula.chooseEncounter();
      this.log('Dracula placed an encounter');
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
    this.dracula.eventHand.push(this.eventDeck.splice(draculaEventIndex, 1)[0]);
    this.log('Event card given to Dracula');
    this.log(this.dracula.discardDownEvents(this.eventDiscard));
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
  playHunterEvent(eventName: string, hunter: Hunter, locationName?: string) {
    // TODO: so much
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
    } else if (eventCardPlayed.name == EventName.ConsecratedGround) {
      this.moveConescratedGroundMarker(locationName);
    } else {
      this.eventDiscard.push(eventCardPlayed);
    }
    this.log(`${hunter.name} played event ${eventName}${locationName ? ` on ${locationName}` : ''}`);
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

    switch (encounterName) {
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
        this.huntersInGroup(hunter).forEach(companion => {
          companion.lastUsedCombatItem = '';
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
        this.huntersInGroup(hunter).forEach(companion => {
          companion.lastUsedCombatItem = '';
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
        this.huntersInGroup(hunter).forEach(companion => {
          companion.lastUsedCombatItem = '';
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
        this.huntersInGroup(hunter).forEach(companion => {
          companion.lastUsedCombatItem = '';
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
   * Removes an Encounter tile of the given name from the given Hunter
   * @param hunter The Hunter discarding the tile
   * @param encounterName The name of the Encounter being discarded
   */
  discardEncounterFromHunter(hunter: Hunter, encounterName: string) {
    let encounterIndex = 0;
    for (encounterIndex; encounterIndex < hunter.encounterTiles.length; encounterIndex++) {
      if (hunter.encounterTiles[encounterIndex].name == encounterName) {
        break;
      }
    }
    this.log(`${encounterName} tile discarded from ${hunter.name}`);
    this.encounterPool.push(hunter.encounterTiles.splice(encounterIndex, 1)[0]);
    this.log(this.shuffleEncounters());
  }

  /**
   * Chooses which combat card Dracula plays in a current round of combat
   * @param hunters The Hunters involved in the combat
   * @param items The names of the combat cards chosen by the Hunters
   */
  resolveCombatRound(hunters: Hunter[], items: string[]) {
    // TODO: add the basic combat cards to the Hunters and remove them at the end of the combat
    for (let i = 0; i < hunters.length; i++) {
      this.log(`${hunters[i].name} used ${items[i]}`);
    }
    this.log(this.dracula.chooseCombatCard(hunters));
    for (let i = 0; i < hunters.length; i++) {
      hunters[i].lastUsedCombatItem = items[i];
    }
  }

  /**
   * Adds a card to the head of the trail
   * @param newTrailCard The card to add to the head of the trail
   */
  pushToTrail(newTrailCard: TrailCard): string {
    this.trail.unshift(newTrailCard);
    return 'Dracula added a card to the trail';
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
  }
}
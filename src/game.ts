import { GameMap, LocationType, Location } from "./map";
import { Dracula, TrailCard, PowerName } from "./dracula";
import { Mina, Godalming, Seward, VanHelsing, Hunter } from "./hunter";
import { Encounter, initialiseEncounterPool } from "./encounter";

export class Game {
  map: GameMap;
  encounterPool: Encounter[];
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

  constructor() {
    // construct game components
    this.map = new GameMap();
    this.encounterPool = initialiseEncounterPool();
    this.catacombs = [];
    this.dracula = new Dracula();
    this.godalming = new Godalming;
    this.seward = new Seward();
    this.vanHelsing = new VanHelsing();
    this.mina = new Mina();
    
    // set initial locations to avoid null references
    this.dracula.setLocation(this.map.locations[0]);
    this.godalming.setLocation(this.map.locations[0]);
    this.seward.setLocation(this.map.locations[0]);
    this.vanHelsing.setLocation(this.map.locations[0]);
    this.mina.setLocation(this.map.locations[0]);
  }

  /**
   * Adds a message to the console text boc in a new line
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
    // TODO: resolve encounters, attack Dracula
    // TODO: resolve catacombs as well
    let foundSomething = false;
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
              if (this.trail[hideIndex].power.name == PowerName.hide) {
                break;
              }
            }
          }
          this.trail[hideIndex].revealed = true;
          if (this.trail[hideIndex].encounter) {
            this.trail[hideIndex].encounter.revealed = true;
            this.log(`${hunter.name} has encountered ${this.trail[hideIndex].encounter.name} at ${hunter.currentLocation.name}`);
            this.encounterPool.push(this.trail[hideIndex].encounter);
            delete this.trail[hideIndex].encounter;
            this.log(this.shuffleEncounters());
          }
        }
        if (trailCard.encounter) {
          trailCard.encounter.revealed = true;
          this.log(`${hunter.name} has encountered ${trailCard.encounter.name} at ${hunter.currentLocation.name}`);
          this.encounterPool.push(trailCard.encounter);
          delete trailCard.encounter;
          this.log(this.shuffleEncounters());
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
          this.encounterPool.push(catacomb.encounter);
          delete catacomb.encounter;
          this.log(this.shuffleEncounters());
        }
        if (catacomb.catacombEncounter) {
          catacomb.catacombEncounter.revealed = true;
          this.log(`${hunter.name} has encountered ${catacomb.catacombEncounter.name} at ${hunter.currentLocation.name}`);
          this.encounterPool.push(catacomb.catacombEncounter);
          delete catacomb.catacombEncounter;
          this.log(this.shuffleEncounters());
        }
      }
      break;
    }
    if (!foundSomething) {
      this.log(`${hunter.name} found nothing at ${hunter.currentLocation.name}`);
    }
  }

  /**
   * Sets a Hunter's currentLocation
   * @param hunter The Hunter to move
   * @param location The Location to which to move the Hunter
   */
  setHunterLocation(hunter: Hunter, location: Location) {
    this.log(hunter.setLocation(location));
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
        case PowerName.darkCall:
          this.log('Dracula played power Dark Call');
          this.log(this.dracula.executeDarkCall(this));
          this.log(this.shuffleEncounters());
          break;
        case PowerName.doubleBack:
        case PowerName.wolfFormAndDoubleBack:
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
        case PowerName.feed:
          this.log('Dracula played power Feed');
          break;
        case PowerName.hide:
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
        case PowerName.wolfForm:
          this.log('Dracula played power Wolf Form');
          break;
        case PowerName.wolfFormAndHide:
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
        this.log(this.dracula.setBlood(this.dracula.blood -1));
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
      this.log(this.pushToTrail({ revealed: this.dracula.revealed, location: nextLocation, power: this.dracula.nextMove.power}));
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
              if (this.trail[hideIndex].power.name == PowerName.hide) {
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
        if (droppedOffCard.power.name == PowerName.hide) {
          this.dracula.hideLocation = null;
        }
      }
      this.log(this.dracula.decideFateOfDroppedOffCard(droppedOffCard, this));
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
   * Shuffles the encounters in the deck
   */
  shuffleEncounters(): string {
    const shuffledEncounters = [];
    while (this.encounterPool.length > 0) {
      const randomIndex = Math.floor(Math.random()*this.encounterPool.length);
      this.encounterPool[randomIndex].revealed = false;
      shuffledEncounters.push(this.encounterPool.splice(randomIndex, 1)[0]);
    }
    this.encounterPool = shuffledEncounters;
    return `Shuffled ${this.encounterPool.length} encounters in encounter pool`;
  }

  /**
   * Adds a card to the head of the trail
   * @param newTrailCard The card to add to the head of the trail
   */
  pushToTrail(newTrailCard: TrailCard): string {
    this.trail.unshift(newTrailCard);
    return 'Dracula added a card to the trail';
  }
}

import { GameMap, LocationType, Location } from "./map";
import { Dracula, TrailCard } from "./dracula";
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
    
    // set initial loations to avoid null references
    this.dracula.setLocation(this.map.locations[0]);
    this.godalming.setLocation(this.map.locations[0]);
    this.seward.setLocation(this.map.locations[0]);
    this.vanHelsing.setLocation(this.map.locations[0]);
    this.mina.setLocation(this.map.locations[0]);
  }

  log(message: string) {
    this.logText += `\n${message}`;
  }
  
  initialiseGameState() {
    this.logText = 'INITIALISING GAME STATE';
    this.log(this.map.verifyMapData());
    this.log(this.shuffleEncounters());
    this.log(this.dracula.drawUpEncounters(this.encounterPool));
    this.timePhase = -1;
    this.vampireTrack = 0;
    this.resolveTrack = 0;
    this.log('GAME STATE INITIALISED');
  }

  startGame() {
    const startLocation = this.dracula.chooseStartLocation(this);
    this.log(this.dracula.setLocation(startLocation));
    this.log(this.dracula.pushToTrail({ location: startLocation, revealed: false, encounters: [] }));
    this.log('It is now Dracula\'s turn');
  }

  searchWithHunter(hunter: Hunter) {
    // TODO: resolve encounters, attack Dracula
    // TODO: search for catacombs as well
    // TODO: handle finding Hide location (two encounters)
    let foundSomething = false;
    this.dracula.trail.forEach(trailCard => {
      if (hunter.currentLocation == trailCard.location) {
        foundSomething = true;
        trailCard.revealed = true;
        this.log(`${hunter.name} has found Dracula's trail at ${hunter.currentLocation.name}`);
        if (trailCard.encounters) {
          trailCard.encounters[0].revealed = true;
          this.log(`${hunter.name} has encountered ${trailCard.encounters[0].name} at ${hunter.currentLocation.name}`);
        }
      }
    });
    if (hunter.currentLocation == this.dracula.currentLocation) {
      foundSomething = true;
      this.dracula.revealed = true;
      this.log(`${hunter.name} has found Dracula at ${hunter.currentLocation.name}`);
    }
    if (!foundSomething) {
      this.log(`${hunter.name} found nothing at ${hunter.currentLocation.name}`);
    }
  }

  setHunterLocation(hunter: Hunter, location: Location) {
    this.log(hunter.setLocation(location));
  }

  setHunterHealth(hunter: Hunter, health: number) {
    this.log(hunter.setHealth(health));
  }

  setDraculaBlood(blood: number) {
    this.log(this.dracula.setBlood(blood));
  }

  performTimeKeepingPhase() {
    // TODO: decide what to do with catacomb cards
    
    // perform timekeeping
    this.log('Performing Timekeeping phase');
    if (this.dracula.currentLocation.type !== LocationType.sea) {
      this.log('Time advancing...');
      this.timePhase += 1;
      
      // handle new day
      if (this.timePhase == 6) {
        this.log('A new day dawns');
        this.vampireTrack += 1;
        this.resolveTrack += 1;
        this.timePhase = 0;

        // TODO: handle Dracula win condition
      }
    }
  }

  performDraculaMovementPhase() {
    // TODO: choose next location or power
    // TODO: handle no valid move case
    const nextLocation = this.dracula.chooseNextLocation(this);
    
    // check if new location causes Dracula to be revealed (special case for Hide power)
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

    // add card to trail
    this.log(this.dracula.pushToTrail({ revealed: this.dracula.revealed, location: nextLocation, encounters: [] }));
    
    if (this.dracula.trail.length == 7) {
      this.log('A card has dropped off the end of the trail');
      this.log(this.dracula.decideFateOfDroppedOffCard(this));
    }
  }

  performDraculaActionPhase() {
    // TODO: attack the hunter(s) at this location or choose an encounter to place on the card
    if (this.dracula.currentLocation.type !== LocationType.sea && (this.dracula.currentLocation == this.godalming.currentLocation || this.dracula.currentLocation == this.seward.currentLocation ||
      this.dracula.currentLocation == this.vanHelsing.currentLocation || this.dracula.currentLocation == this.mina.currentLocation)) {
      this.log('Dracula attacks!');
    } else if (this.dracula.currentLocation.type !== LocationType.castle && this.dracula.currentLocation.type !== LocationType.sea) {
      this.dracula.trail[0].encounters.push(this.dracula.chooseEncounter());
      this.log('Dracula placed an encounter');
    }
    
    // TODO: decide whether to mature the dropped off encounter
    if (this.dracula.droppedOffEncounter) {
      this.log('Dracula returned the dropped off encounter to the encounter pool');
      this.encounterPool.push(this.dracula.droppedOffEncounter);
      this.log(this.shuffleEncounters());
      this.dracula.droppedOffEncounter = null;
    }
    
    // Refill encounter hand
    this.log(this.dracula.drawUpEncounters(this.encounterPool));
  }

  private shuffleEncounters(): string {
    const shuffledEncounters = [];
    while (this.encounterPool.length > 0) {
      const randomIndex = Math.floor(Math.random()*this.encounterPool.length);
      shuffledEncounters.push(this.encounterPool.splice(randomIndex, 1)[0]);
    }
    this.encounterPool = shuffledEncounters;
    return `Shuffled ${this.encounterPool.length} encounters in encounter pool`;
  }
}

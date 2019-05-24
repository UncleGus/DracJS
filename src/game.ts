import { GameMap, LocationType, Location } from "./map";
import { Dracula } from "./dracula";
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

  constructor() {
    // construct game components
    this.map = new GameMap();
    this.encounterPool = initialiseEncounterPool();
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
    this.log(this.dracula.pushToTrail({ location: startLocation, revealed: false, encounter: null }));
    this.log('It is now Dracula\'s turn');
  }

  searchWithHunter(hunter: Hunter) {
    let foundSomething = false;
    this.dracula.trail.forEach(trailCard => {
      if (hunter.currentLocation == trailCard.location) {
        foundSomething = true;
        trailCard.revealed = true;
        this.log(`${hunter.name} has found Dracula's trail at ${hunter.currentLocation.name}`);
        if (trailCard.encounter) {
          trailCard.encounter.revealed = true;
          this.log(`${hunter.name} has encountered ${trailCard.encounter.name} at ${hunter.currentLocation.name}`);
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
    this.log('Performing Timekeeping phase');
    if (this.dracula.currentLocation.type !== LocationType.sea) {
      this.log('Time advancing...');
      this.timePhase += 1;
      if (this.timePhase == 6) {
        this.log('A new day dawns');
        this.vampireTrack += 1;
        this.resolveTrack += 1;
        this.timePhase = 0;
      }
    }
  }

  performDraculaMovementPhase() {
    const nextLocation = this.dracula.chooseNextLocation(this);
    if (this.dracula.currentLocation.type == LocationType.castle) {
      this.dracula.revealed = true;
    }
    this.log(this.dracula.setLocation(nextLocation));
    if (this.dracula.currentLocation.type !== LocationType.sea) {
      if (this.dracula.currentLocation == this.godalming.currentLocation || this.dracula.currentLocation == this.seward.currentLocation ||
        this.dracula.currentLocation == this.vanHelsing.currentLocation || this.dracula.currentLocation == this.mina.currentLocation) {
          this.log(this.dracula.pushToTrail({ revealed: true, location: nextLocation, encounter: undefined }));
          this.log('Dracula attacks!');
          this.dracula.revealed = true;
      } else {
        if (this.dracula.currentLocation.type !== LocationType.castle) {
          this.log(this.dracula.pushToTrail({ revealed: false, location: nextLocation, encounter: this.dracula.chooseEncounter() }));
        } else {
          this.log(this.dracula.pushToTrail({ revealed: true, location: nextLocation, encounter: undefined }));
        }
      }
    } else {
      this.log(this.dracula.pushToTrail({ revealed: false, location: nextLocation, encounter: undefined }));
    }
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

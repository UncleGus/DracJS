import { GameMap } from "./map";
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

  initialiseGameState(): string {
    let logMessage = 'INITIALISING GAME STATE\n';
    logMessage += this.map.verifyMapData() + '\n';
    logMessage += this.shuffleEncounters() + '\n';
    logMessage += this.dracula.drawUpEncounters(this.encounterPool) + '\n';
    logMessage += 'GAME STATE INITIALISED\n';
    return logMessage;
  }

  shuffleEncounters(): string {
    const shuffledEncounters = [];
    while (this.encounterPool.length > 0) {
      const randomIndex = Math.floor(Math.random()*this.encounterPool.length);
      shuffledEncounters.push(this.encounterPool.splice(randomIndex, 1)[0]);
    }
    this.encounterPool = shuffledEncounters;
    return `Shuffled ${this.encounterPool.length} encounters in encounter pool`;
  }

  startGame(): string {
    let logMessage = '';
    const startLocation = this.dracula.chooseStartLocation(this);
    logMessage += this.dracula.setLocation(startLocation) +'\n';
    logMessage += this.dracula.pushToTrail({ location: startLocation, revealed: false, encounter: null }) +'\n';
    const nextLocation = this.dracula.chooseNextLocation(this);
    logMessage += this.dracula.setLocation(nextLocation) +'\n';
    const encounter = this.dracula.chooseEncounter();
    logMessage += this.dracula.pushToTrail({ location: nextLocation, revealed: false, encounter }) +'\n';
    logMessage += this.dracula.drawUpEncounters(this.encounterPool);
    return logMessage;
  }

  searchWithHunter(hunter: Hunter): string {
    if (hunter.currentLocation == this.dracula.currentLocation) {
      this.dracula.revealed = true;
      return `${hunter.name} has found Dracula at ${hunter.currentLocation.name}`;
    }
    return `Dracula is not at ${hunter.currentLocation.name}`;
  }
}
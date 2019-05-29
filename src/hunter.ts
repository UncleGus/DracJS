import { Location } from "./map";
import { Item } from "./item";
import { Event } from "./event";
import { Encounter } from "./encounter";

export class Hunter {
  name: string;
  maxHealth: number;
  health: number;
  currentLocation: Location;
  items: Item[];
  events: Event[];
  encounterTiles: Encounter[];
  groupNumber: number;

  constructor(newName: string) {
    this.name = newName;
    this.items = [];
    this.events = [];
    this.encounterTiles = [];
    this.groupNumber = 0;
  }

  /**
   * Sets a Hunter's health
   * @param newHealth The value to which to set the Hunter's health
   */
  setHealth(newHealth: number): string {
    this.health = Math.min(this.maxHealth, Math.max(0, newHealth));
    return `${this.name} is now on ${this.health} health`;
  }

  /**
   * Sets a Hunter's Location
   * @param newLocation The Location to which to move the Hunter
   */
  setLocation(newLocation: Location): string {
    this.currentLocation = newLocation;
    return `${this.name} moved to ${this.currentLocation.name}`;
  }
}

export class Godalming extends Hunter {
  constructor() {
    super('Lord Godalming');
    this.health = this.maxHealth = 12;
  }
}

export class Seward extends Hunter {
  constructor() {
    super('Dr. Seward');
    this.health = this.maxHealth = 10;
  }
}

export class VanHelsing extends Hunter {
  constructor() {
    super('Van Helsing');
    this.health = this.maxHealth = 8;
  }
}

export class Mina extends Hunter {
  constructor() {
    super('Mina Harker');
    this.health = this.maxHealth = 8;
  }
}

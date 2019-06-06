import { Location } from "./map";
import { Item } from "./item";
import { Event } from "./event";
import { Encounter } from "./encounter";

export class Hunter {
  name: string;
  maxHealth: number;
  health: number;
  bites: number;
  currentLocation: Location;
  items: Item[];
  events: Event[];
  encounterTiles: Encounter[];
  groupNumber: number;
  lastUsedCombatItem: string;
  inCombat: boolean;
  usingFastHorse: boolean;
  knownItems: string[];
  knownEvents: string[];
  possibleItems: { item: string, chance: number }[];
  mustDeclareNextMove: boolean;
  committedMove: { moveMethod: string, destination: string };

  constructor(newName: string, maxHealth: number, bites: number = 0) {
    this.name = newName;
    this.health = this.maxHealth = maxHealth;
    this.bites = bites;
    this.items = [];
    this.events = [];
    this.encounterTiles = [];
    this.groupNumber = 0;
    this.bites = bites;
    this.knownItems = [];
    this.knownEvents = [];
    this.possibleItems = [];
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
   * Sets a Hunter's bites
   * @param newBites The value to which to set the Hunter's bites
   */
  setBites(newBites: number): string {
    this.bites = Math.max(0, newBites);
    return `${this.name} now has ${this.bites} bites`;
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

export enum HunterName {
  godalming = 'Lord Godalming',
  seward = 'Dr. Seward',
  vanHelsing = 'Van Helsing',
  mina = 'Mina Harker'
}
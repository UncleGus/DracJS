import { GameMap, LocationType } from "./map";
import { Dracula } from "./dracula";
import { Mina, Godalming, Seward, VanHelsing } from "./hunter";
import { Encounter, initialiseEncounterPool, shuffleEncounters } from "./encounter";

export class Game {
  map: GameMap;
  encounterPool: Encounter[];
  dracula: Dracula;
  godalming: Godalming;
  seward: Seward;
  vanHelsing: VanHelsing;
  mina: Mina;
  logBox: HTMLInputElement;
  draculaBlood: HTMLInputElement;
  draculaLocation: HTMLInputElement;
  godalmingHealth: HTMLInputElement;
  sewardHealth: HTMLInputElement;
  vanHelsingHealth: HTMLInputElement;
  minaHealth: HTMLInputElement;
  godalmingLocation: HTMLInputElement;
  sewardLocation: HTMLInputElement;
  vanHelsingLocation: HTMLInputElement;
  minaLocation: HTMLInputElement;
  trail: HTMLInputElement[];
  encounter: HTMLInputElement[];
  encounterCount: HTMLInputElement;

  constructor() {
    // construct game components
    this.map = new GameMap();
    this.encounterPool = shuffleEncounters(initialiseEncounterPool());
    this.dracula = new Dracula();
    this.godalming = new Godalming;
    this.seward = new Seward();
    this.vanHelsing = new VanHelsing();
    this.mina = new Mina();
    
    // set initial loations
    this.dracula.setLocation(this.map.getLocationByName('Castle Dracula'));
    this.godalming.setLocation(this.map.locations[0]);
    this.seward.setLocation(this.map.locations[0]);
    this.vanHelsing.setLocation(this.map.locations[0]);
    this.mina.setLocation(this.map.locations[0]);

    // get webpage components
    this.logBox = document.getElementById('logBox') as HTMLInputElement;
    this.draculaBlood = document.getElementById('draculaBlood') as HTMLInputElement;
    this.draculaLocation = document.getElementById('draculaLocation') as HTMLInputElement;
    this.encounterCount = document.getElementById('encounterCount') as HTMLInputElement;
    this.godalmingHealth = document.getElementById('godalmingHealth') as HTMLInputElement;
    this.sewardHealth = document.getElementById('sewardHealth') as HTMLInputElement;
    this.vanHelsingHealth = document.getElementById('vanHelsingHealth') as HTMLInputElement;
    this.minaHealth = document.getElementById('minaHealth') as HTMLInputElement;
    this.godalmingLocation = document.getElementById('godalmingLocation') as HTMLInputElement;
    this.sewardLocation = document.getElementById('sewardLocation') as HTMLInputElement;
    this.vanHelsingLocation = document.getElementById('vanHelsingLocation') as HTMLInputElement;
    this.minaLocation = document.getElementById('minaLocation') as HTMLInputElement;
    this.trail = [
      document.getElementById('trail1') as HTMLInputElement,
      document.getElementById('trail2') as HTMLInputElement,
      document.getElementById('trail3') as HTMLInputElement,
      document.getElementById('trail4') as HTMLInputElement,
      document.getElementById('trail5') as HTMLInputElement,
      document.getElementById('trail6') as HTMLInputElement
    ];
    this.encounter = [
      document.getElementById('encounter1') as HTMLInputElement,
      document.getElementById('encounter2') as HTMLInputElement,
      document.getElementById('encounter3') as HTMLInputElement,
      document.getElementById('encounter4') as HTMLInputElement,
      document.getElementById('encounter5') as HTMLInputElement,
      document.getElementById('encounter6') as HTMLInputElement
    ];
    
    // wire up webpage components
    this.draculaBlood.addEventListener('change', () => {
      this.log(this.dracula.setBlood(parseInt(this.draculaBlood.value)));
      this.updateAllFields();
    });
    (document.getElementById('draculaDie') as HTMLInputElement).addEventListener('click', () => {
      this.log(this.dracula.die());
      this.updateAllFields();
    });
    (document.getElementById('draculaChooseLocation') as HTMLInputElement).addEventListener('click', () => {
      this.log(this.dracula.setLocation(this.dracula.chooseStartLocation(this)));
      this.updateAllFields();
    });
    Array.from(document.getElementsByClassName('locationSelector')).forEach(selector => {
      this.map.locations.forEach(location => {
        (selector as HTMLSelectElement).options.add(new Option(location.name));
      });
    });
    this.godalmingHealth.addEventListener('change', () => {
      this.log(this.godalming.setHealth(parseInt(this.godalmingHealth.value)));
      this.updateAllFields();
    });
    this.sewardHealth.addEventListener('change', () => {
      this.log(this.seward.setHealth(parseInt(this.sewardHealth.value)));
      this.updateAllFields();
    });
    this.vanHelsingHealth.addEventListener('change', () => {
      this.log(this.vanHelsing.setHealth(parseInt(this.vanHelsingHealth.value)));
      this.updateAllFields();
    });
    this.minaHealth.addEventListener('change', () => {
      this.log(this.mina.setHealth(parseInt(this.minaHealth.value)));
      this.updateAllFields();
    });
    this.godalmingLocation.addEventListener('change', () => {
      this.log(this.godalming.setLocation(this.map.getLocationByName(this.godalmingLocation.value)));
      this.updateAllFields();
    });
    this.sewardLocation.addEventListener('change', () => {
      this.log(this.seward.setLocation(this.map.getLocationByName(this.sewardLocation.value)));
      this.updateAllFields();
    });
    this.vanHelsingLocation.addEventListener('change', () => {
      this.log(this.vanHelsing.setLocation(this.map.getLocationByName(this.vanHelsingLocation.value)));
      this.updateAllFields();
    });
    this.minaLocation.addEventListener('change', () => {
      this.log(this.mina.setLocation(this.map.getLocationByName(this.minaLocation.value)));
      this.updateAllFields();
    });

    // arrange game components
    this.log(this.map.verifyMapData());
    this.log(this.dracula.drawUpEncounters(this.encounterPool));
    this.updateAllFields();
  }

  log(message: string) {
    console.log(message);
    this.logBox.value += `${message}\n`;
    this.logBox.scrollTop = this.logBox.scrollHeight;
  }

  updateAllFields() {
    this.draculaBlood.value = this.dracula.blood.toString();
    this.draculaLocation.value = this.dracula.revealed ? this.dracula.currentLocation.name : 'Hidden';
    this.godalmingHealth.value = this.godalming.health.toString();
    this.sewardHealth.value = this.seward.health.toString();
    this.vanHelsingHealth.value = this.vanHelsing.health.toString();
    this.minaHealth.value = this.mina.health.toString();
    this.encounterCount.value = this.dracula.encounterHand.length.toString();

    for (let i = 0; i < 6; i++) {
      if (this.dracula.trail[i]) {
        if (this.dracula.trail[i].revealed) {
          this.trail[i].value = this.dracula.trail[i].location.name;
        } else {
          this.trail[i].value = this.dracula.trail[i].location.type == LocationType.sea ? 'Sea' : 'Land';
        }
        if (this.dracula.trail[i].encounter) {
          this.encounter[i].value = 'Encounter';
        }
      }
    }
  }
}
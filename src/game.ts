import { GameMap } from "./map";
import { Dracula } from "./dracula";
import { Mina, Godalming, Seward, VanHelsing } from "./hunter";

export class Game {
  map: GameMap;
  dracula: Dracula;
  godalming: Godalming;
  seward: Seward;
  vanHelsing: VanHelsing;
  mina: Mina;
  draculaBlood: HTMLInputElement;
  draculaLocation: HTMLInputElement;
  godalmingHealth: HTMLInputElement;
  sewardHealth: HTMLInputElement;
  vanHelsingHealth: HTMLInputElement;
  minaHealth: HTMLInputElement;

  constructor() {
    this.map = new GameMap();
    this.dracula = new Dracula(this.map);
    this.godalming = new Godalming;
    this.seward = new Seward();
    this.vanHelsing = new VanHelsing();
    this.mina = new Mina();
    this.draculaBlood = document.getElementById('draculaBlood') as HTMLInputElement;
    this.draculaLocation = document.getElementById('draculaLocation') as HTMLInputElement;
    this.godalmingHealth = document.getElementById('godalmingHealth') as HTMLInputElement;
    this.sewardHealth = document.getElementById('sewardHealth') as HTMLInputElement;
    this.vanHelsingHealth = document.getElementById('vanHelsingHealth') as HTMLInputElement;
    this.minaHealth = document.getElementById('minaHealth') as HTMLInputElement;
    
    this.map.verifyMapData();
    this.updateAllFields();
    
    this.draculaBlood.addEventListener('change', () => this.dracula.blood = parseInt(this.draculaBlood.value));
    (document.getElementById('draculaDie') as HTMLInputElement).addEventListener('click', () => {
      this.dracula.die();
      this.updateAllFields();
    });
    (document.getElementById('draculaChooseLocation') as HTMLInputElement).addEventListener('click', () => {
      this.dracula.chooseStartLocation(this.map);
      this.updateAllFields();
    });
    Array.from(document.getElementsByClassName('locationSelector')).forEach(selector => {
      this.map.locations.forEach(location => {
        (selector as HTMLSelectElement).options.add(new Option(location.name));
      });
    });
  }

  updateAllFields() {
    this.draculaBlood.value = this.dracula.blood.toString();
    this.draculaLocation.value = this.dracula.currentLocation.name;
    this.godalmingHealth.value = this.godalming.health.toString();
    this.sewardHealth.value = this.seward.health.toString();
    this.vanHelsingHealth.value = this.vanHelsing.health.toString();
    this.minaHealth.value = this.mina.health.toString();
 }
}
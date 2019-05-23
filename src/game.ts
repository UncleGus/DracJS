import { GameMap } from "./map";

export class Game { 
  map: GameMap;

  constructor() {
    this.map = new GameMap();
    const newButton = document.createElement('button');
    newButton.appendChild(document.createTextNode('Another button'));
    newButton.addEventListener('click', () => {this.map.verifyMapData();});
    document.getElementById('theDiv').appendChild(newButton);
    const button = document.querySelector('#theButton');
    button.addEventListener('click', () => {this.map.verifyMapData();});
  }
}
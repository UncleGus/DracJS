import { GameMap, Location } from "./map";

export class Game { 

  constructor() {
    const map = new GameMap();
    
    document.getElementById('verifyMapData').addEventListener('click', () => {map.verifyMapData();});

    const originSelector = document.getElementById('originLocation') as HTMLSelectElement;
    const destinationSelector = document.getElementById('destinationLocation') as HTMLSelectElement;
    map.locations.map(location => {
      originSelector.options.add( new Option(location.name));
      destinationSelector.options.add( new Option(location.name));
    });

    const button = document.createElement('button');
    button.appendChild(document.createTextNode('Select'));
    button.addEventListener('click', () => {
      this.outputDistance(map, map.getLocationByName(originSelector.value), map.getLocationByName(destinationSelector.value), this.getTravelMethods());
    });
    document.getElementById('selectLocation').appendChild(button);
  }

  outputDistance(gameMap: GameMap, originLocation: Location, destinationLocation: Location, methods: string[]) {
    const distance = gameMap.distanceBetweenLocations(originLocation, destinationLocation, methods);
    console.log(`The distance from ${originLocation.name} to ${destinationLocation.name} is ${distance}`);;
  }

  getTravelMethods() {
    let methods: string[] = [];
    if ((document.getElementById('road') as HTMLInputElement).checked) {
      methods.push('road');
    }
    if ((document.getElementById('train') as HTMLInputElement).checked) {
      methods.push('train');
    }
    if ((document.getElementById('boat') as HTMLInputElement).checked) {
      methods.push('sea');
    }
    if (methods.length === 0) {
      return undefined;
    }
    return methods;
  }
}
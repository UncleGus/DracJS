// import * as fs from 'fs';
// import * as path from 'path';
import * as _ from 'lodash';

export class GameMap {
  locations: location[];

  // constructor(mapFileName?: string) {
  //   if (mapFileName) {
  //     this.loadMapData(mapFileName);
  //   } else {
  constructor() {
    this.locations = [
      new smallCityWest('Galway')
        .byRoad('Dublin')
        .bySea('Atlantic Ocean')
        .done(),
      new smallCityWest('Dublin')
        .byRoad('Galway')
        .bySea('Irish Sea')
        .done(),
      new largeCityWest('Liverpool')
        .byRoad('Manchester')
        .byRoad('Swansea')
        .byTrain('Manchester')
        .bySea('Irish Sea')
        .done(),
      new largeCityWest('Edinburgh')
        .byRoad('Manchester')
        .byTrain('Manchester')
        .bySea('North Sea')
        .done(),
      new largeCityWest('Manchester')
        .byRoad('Edinburgh')
        .byRoad('Liverpool')
        .byRoad('London')
        .byTrain('Edinburgh')
        .byTrain('Liverpool')
        .byTrain('London')
        .done(),
      new smallCityWest('Swansea')
        .byRoad('Liverpool')
        .byRoad('London')
        .byTrain('London')
        .bySea('Irish Sea')
        .done(),
      new smallCityWest('Plymouth')
        .byRoad('London')
        .bySea('English Channel')
        .done(),
      new largeCityWest('Nantes')
        .byRoad('Le Havre')
        .byRoad('Paris')
        .byRoad('Clermont Ferrand')
        .byRoad('Bordeaux')
        .bySea('Bay of Biscay')
        .done(),
      new smallCityWest('Le Havre')
        .byRoad('Nantes')
        .byRoad('Paris')
        .byRoad('Brussels')
        .byTrain('Paris')
        .bySea('English Channel')
        .done(),
      new largeCityWest('London')
        .byRoad('Manchester')
        .byRoad('Swansea')
        .byRoad('Plymouth')
        .byTrain('Manchester')
        .byTrain('Swansea')
        .bySea('English Channel')
        .done(),
      new largeCityWest('Paris')
        .byRoad('Nantes')
        .byRoad('Le Havre')
        .byRoad('Brussels')
        .byRoad('Strasbourg')
        .byRoad('Geneva')
        .byRoad('Clermont Ferrand')
        .byTrain('Le Havre')
        .byTrain('Brussels')
        .byTrain('Marseilles')
        .byTrain('Bordeaux')
        .done(),
      new largeCityWest('Brussels')
        .byRoad('Le Havre')
        .byRoad('Amsterdam')
        .byRoad('Cologne')
        .byRoad('Strasbourg')
        .byRoad('Paris')
        .byTrain('Cologne')
        .byTrain('Paris')
        .done(),
      new largeCityWest('Amsterdam')
        .byRoad('Brussels')
        .byRoad('Cologne')
        .bySea('North Sea')
        .done(),
      new smallCityWest('Strasbourg')
        .byRoad('Paris')
        .byRoad('Brussels')
        .byRoad('Cologne')
        .byRoad('Frankfurt')
        .byRoad('Nuremburg')
        .byRoad('Munich')
        .byRoad('Zurich')
        .byRoad('Geneva')
        .byTrain('Frankfurt')
        .byTrain('Zurich')
        .done(),
      new largeCityWest('Cologne')
        .byRoad('Brussels')
        .byRoad('Amsterdam')
        .byRoad('Hamburg')
        .byRoad('Leipzig')
        .byRoad('Frankfurt')
        .byRoad('Strasbourg')
        .byTrain('Brussels')
        .byTrain('Frankfurt')
        .done(),
      new largeCityWest('Hamburg')
        .byRoad('Cologne')
        .byRoad('Berlin')
        .byRoad('Leipzig')
        .byTrain('Berlin')
        .bySea('North Sea')
        .done(),
      new smallCityWest('Frankfurt')
        .byRoad('Strasbourg')
        .byRoad('Cologne')
        .byRoad('Leipzig')
        .byRoad('Nuremburg')
        .byTrain('Strasbourg')
        .byTrain('Cologne')
        .byTrain('Leipzig')
        .done(),
      new smallCityWest('Nuremburg')
        .byRoad('Strasbourg')
        .byRoad('Frankfurt')
        .byRoad('Leipzig')
        .byRoad('Prague')
        .byRoad('Munich')
        .byTrain('Leipzig')
        .byTrain('Munich')
        .done(),
      new largeCityWest('Leipzig')
        .byRoad('Cologne')
        .byRoad('Hamburg')
        .byRoad('Berlin')
        .byRoad('Nuremburg')
        .byRoad('Frankfurt')
        .byTrain('Frankfurt')
        .byTrain('Berlin')
        .byTrain('Nuremburg')
        .done(),
      new largeCityWest('Berlin')
        .byRoad('Hamburg')
        .byRoad('Prague')
        .byRoad('Leipzig')
        .byTrain('Hamburg')
        .byTrain('Prague')
        .byTrain('Leipzig')
        .done(),
      new largeCityEast('Prague')
        .byRoad('Berlin')
        .byRoad('Vienna')
        .byRoad('Nuremburg')
        .byTrain('Berlin')
        .byTrain('Vienna')
        .done(),
      {
        name: 'Castle Dracula',
        domain: locationDomain.east,
        roadConnections: ['Klausenburg', 'Galatz'],
        seaConnections: [],
        trainConnections: [],
        type: locationType.castle
      },
      new smallCityWest('Santander')
        .byRoad('Lisbon')
        .byRoad('Madrid')
        .byRoad('Saragossa')
        .byTrain('Madrid')
        .bySea('Bay of Biscay')
        .done(),
      new smallCityWest('Saragossa')
        .byRoad('Madrid')
        .byRoad('Santander')
        .byRoad('Bordeaux')
        .byRoad('Toulouse')
        .byRoad('Barcelona')
        .byRoad('Alicante')
        .byTrain('Madrid')
        .byTrain('Bordeaux')
        .byTrain('Barcelona')
        .done(),
      new largeCityWest('Bordeaux')
        .byRoad('Saragossa')
        .byRoad('Nantes')
        .byRoad('Clermont Ferrand')
        .byRoad('Toulouse')
        .byTrain('Paris')
        .byTrain('Saragossa')
        .bySea('Bay of Biscay')
        .done(),
      new smallCityWest('Toulouse')
        .byRoad('Saragossa')
        .byRoad('Bordeaux')
        .byRoad('Clermont Ferrand')
        .byRoad('Marseilles')
        .byRoad('Barcelona')
        .done(),
      new largeCityWest('Barcelona')
        .byRoad('Saragossa')
        .byRoad('Toulouse')
        .byTrain('Saragossa')
        .byTrain('Alicante')
        .bySea('Mediterranean Sea')
        .done(),
      new smallCityWest('Clermont Ferrand')
        .byRoad('Bordeaux')
        .byRoad('Nantes')
        .byRoad('Paris')
        .byRoad('Geneva')
        .byRoad('Marseilles')
        .byRoad('Toulouse')
        .done(),
      new largeCityWest('Marseilles')
        .byRoad('Toulouse')
        .byRoad('Clermont Ferrand')
        .byRoad('Geneva')
        .byRoad('Zurich')
        .byRoad('Milan')
        .byRoad('Genoa')
        .byTrain('Paris')
        .bySea('Mediterranean Sea')
        .done(),
      new smallCityWest('Geneva')
        .byRoad('Marseilles')
        .byRoad('Clermont Ferrand')
        .byRoad('Paris')
        .byRoad('Strasbourg')
        .byRoad('Zurich')
        .byTrain('Milan')
        .done(),
      new largeCityEast('Genoa')
        .byRoad('Marseilles')
        .byRoad('Milan')
        .byRoad('Venice')
        .byRoad('Florence')
        .byTrain('Milan')
        .bySea('Tyrrhenian Sea')
        .done(),
      new largeCityEast('Milan')
        .byRoad('Marseilles')
        .byRoad('Zurich')
        .byRoad('Munich')
        .byRoad('Venice')
        .byRoad('Genoa')
        .byTrain('Geneva')
        .byTrain('Zurich')
        .byTrain('Florence')
        .byTrain('Genoa')
        .done(),
      new smallCityWest('Zurich')
        .byRoad('Marseilles')
        .byRoad('Geneva')
        .byRoad('Strasbourg')
        .byRoad('Munich')
        .byRoad('Milan')
        .byTrain('Strasbourg')
        .byTrain('Milan')
        .done(),
      new smallCityEast('Florence')
        .byRoad('Genoa')
        .byRoad('Venice')
        .byRoad('Rome')
        .byTrain('Milan')
        .byTrain('Rome')
        .done(),
      new smallCityEast('Venice')
        .byRoad('Florence')
        .byRoad('Genoa')
        .byRoad('Milan')
        .byRoad('Munich')
        .byTrain('Vienna')
        .bySea('Adriatic Sea')
        .done(),
      new largeCityWest('Munich')
        .byRoad('Milan')
        .byRoad('Zurich')
        .byRoad('Strasbourg')
        .byRoad('Nuremburg')
        .byRoad('Vienna')
        .byRoad('Zagreb')
        .byRoad('Venice')
        .byTrain('Nuremburg')
        .done(),
      new smallCityEast('Zagreb')
        .byRoad('Munich')
        .byRoad('Vienna')
        .byRoad('Budapest')
        .byRoad('Szeged')
        .byRoad('St. Joseph and St. Mary')
        .byRoad('Sarajevo')
        .done(),
      new largeCityEast('Vienna')
        .byRoad('Munich')
        .byRoad('Prague')
        .byRoad('Budapest')
        .byRoad('Zagreb')
        .byTrain('Venice')
        .byTrain('Prague')
        .byTrain('Budapest')
        .done(),
      {
        name: 'St. Joseph and St. Mary',
        domain: locationDomain.east,
        roadConnections: ['Zagreb', 'Szeged', 'Belgrade', 'Sarajevo'],
        seaConnections: [],
        trainConnections: [],
        type: locationType.hospital
      },
      new smallCityEast('Sarajevo')
        .byRoad('Zagreb')
        .byRoad('St. Joseph and St. Mary')
        .byRoad('Belgrade')
        .byRoad('Sofia')
        .byRoad('Valona')
        .done(),
      new smallCityEast('Szeged')
        .byRoad('Zagreb')
        .byRoad('Budapest')
        .byRoad('Klausenburg')
        .byRoad('Belgrade')
        .byRoad('St. Joseph and St. Mary')
        .byTrain('Budapest')
        .byTrain('Bucharest')
        .byTrain('Belgrade')
        .done(),
      new smallCityEast('Budapest')
        .byRoad('Vienna')
        .byRoad('Klausenburg')
        .byRoad('Szeged')
        .byRoad('Zagreb')
        .byTrain('Vienna')
        .byTrain('Szeged')
        .done(),
      new smallCityEast('Belgrade')
        .byRoad('St. Joseph and St. Mary')
        .byRoad('Szeged')
        .byRoad('Klausenburg')
        .byRoad('Bucharest')
        .byRoad('Sofia')
        .byRoad('Sarajevo')
        .byTrain('Szeged')
        .byTrain('Sofia')
        .done(),
      new smallCityEast('Klausenburg')
        .byRoad('Budapest')
        .byRoad('Castle Dracula')
        .byRoad('Galatz')
        .byRoad('Bucharest')
        .byRoad('Belgrade')
        .byRoad('Szeged')
        .done(),
      new smallCityEast('Sofia')
        .byRoad('Sarajevo')
        .byRoad('Belgrade')
        .byRoad('Bucharest')
        .byRoad('Varna')
        .byRoad('Salonica')
        .byRoad('Valona')
        .byTrain('Belgrade')
        .byTrain('Salonica')
        .byTrain('Varna')
        .done(),
      new largeCityEast('Bucharest')
        .byRoad('Belgrade')
        .byRoad('Klausenburg')
        .byRoad('Galatz')
        .byRoad('Constanta')
        .byRoad('Sofia')
        .byTrain('Szeged')
        .byTrain('Galatz')
        .byTrain('Constanta')
        .done(),
      new smallCityEast('Galatz')
        .byRoad('Klausenburg')
        .byRoad('Castle Dracula')
        .byRoad('Constanta')
        .byRoad('Bucharest')
        .byTrain('Bucharest')
        .done(),
      new largeCityEast('Varna')
        .byRoad('Sofia')
        .byRoad('Constanta')
        .byTrain('Sofia')
        .bySea('Black Sea')
        .done(),
      new largeCityEast('Constanta')
        .byRoad('Galatz')
        .byRoad('Varna')
        .byRoad('Bucharest')
        .byTrain('Bucharest')
        .bySea('Black Sea')
        .done(),
      new largeCityWest('Lisbon')
        .byRoad('Santander')
        .byRoad('Madrid')
        .byRoad('Cadiz')
        .byTrain('Madrid')
        .bySea('Atlantic Ocean')
        .done(),
      new largeCityWest('Cadiz')
        .byRoad('Lisbon')
        .byRoad('Madrid')
        .byRoad('Granada')
        .bySea('Atlantic Ocean')
        .done(),
      new largeCityWest('Madrid')
        .byRoad('Lisbon')
        .byRoad('Santander')
        .byRoad('Saragossa')
        .byRoad('Alicante')
        .byRoad('Granada')
        .byRoad('Cadiz')
        .byTrain('Lisbon')
        .byTrain('Santander')
        .byTrain('Saragossa')
        .byTrain('Alicante')
        .done(),
      new smallCityWest('Granada')
        .byRoad('Cadiz')
        .byRoad('Madrid')
        .byRoad('Alicante')
        .done(),
      new smallCityWest('Alicante')
        .byRoad('Granada')
        .byRoad('Madrid')
        .byRoad('Saragossa')
        .byTrain('Madrid')
        .byTrain('Barcelona')
        .bySea('Mediterranean Sea')
        .done(),
      new smallCityEast('Cagliari')
        .bySea('Mediterranean Sea')
        .bySea('Tyrrhenian Sea')
        .done(),
      new largeCityEast('Rome')
        .byRoad('Florence')
        .byRoad('Bari')
        .byRoad('Naples')
        .byTrain('Florence')
        .byTrain('Naples')
        .bySea('Tyrrhenian Sea')
        .done(),
      new largeCityEast('Naples')
        .byRoad('Rome')
        .byRoad('Bari')
        .byTrain('Rome')
        .byTrain('Bari')
        .bySea('Tyrrhenian Sea')
        .done(),
      new smallCityEast('Bari')
        .byRoad('Naples')
        .byRoad('Rome')
        .byTrain('Naples')
        .bySea('Adriatic Sea')
        .done(),
      new smallCityEast('Valona')
        .byRoad('Sarajevo')
        .byRoad('Sofia')
        .byRoad('Salonica')
        .byRoad('Athens')
        .bySea('Ionian Sea')
        .done(),
      new smallCityEast('Salonica')
        .byRoad('Valona')
        .byRoad('Sofia')
        .byTrain('Sofia')
        .bySea('Ionian Sea')
        .done(),
      new largeCityEast('Athens')
        .byRoad('Valona')
        .bySea('Ionian Sea')
        .done(),
      {
        ...sea,
        name: 'Atlantic Ocean',
        seaConnections: ['North Sea', 'Irish Sea', 'English Channel', 'Bay of Biscay', 'Mediterranean Sea', 'Galway', 'Lisbon', 'Cadiz']
      },
      {
        ...sea,
        name: 'Irish Sea',
        seaConnections: ['Atlantic Ocean', 'Dublin', 'Liverpool', 'Swansea']
      },
      {
        ...sea,
        name: 'English Channel',
        seaConnections: ['Atlantic Ocean', 'North Sea', 'Plymouth', 'London', 'Le Havre']
      },
      {
        ...sea,
        name: 'North Sea',
        seaConnections: ['Atlantic Ocean', 'English Channel', 'Edinburgh', 'Amsterdam', 'Hamburg']
      },
      {
        ...sea,
        name: 'Bay of Biscay',
        seaConnections: ['Atlantic Ocean', 'Nantes', 'Bordeaux', 'Santander']
      },
      {
        ...sea,
        name: 'Mediterranean Sea',
        seaConnections: ['Atlantic Ocean', 'Tyrrhenian Sea', 'Alicante', 'Barcelona', 'Marseilles', 'Cagliari']
      },
      {
        ...sea,
        name: 'Tyrrhenian Sea',
        seaConnections: ['Mediterranean Sea', 'Ionian Sea', 'Cagliari', 'Genoa', 'Rome', 'Naples']
      },
      {
        ...sea,
        name: 'Adriatic Sea',
        seaConnections: ['Ionian Sea', 'Bari', 'Venice']
      },
      {
        ...sea,
        name: 'Ionian Sea',
        seaConnections: ['Adriatic Sea', 'Black Sea', 'Valona', 'Athens', 'Salonica', 'Tyrrhenian Sea']
      },
      {
        ...sea,
        name: 'Black Sea',
        seaConnections: ['Ionian Sea', 'Varna', 'Constanta']
      },
    ];
  }

  // saveMapData(mapFileName: string) {
  //   fs.writeFileSync(mapFileName, JSON.stringify(this.locations), { encoding: 'utf-8' });
  // }

  // loadMapData(mapFileName: string) {
  //   this.locations = JSON.parse(fs.readFileSync(path.join(mapFileName), { encoding: 'utf-8'}));
  // }

  verifyMapData() {
    console.log('Verifying map data');
    let hospitalCount = 0;
    let castleCount = 0;
    let problems = [];
    this.locations.forEach(location => {
      if (location.type === locationType.hospital) {
        hospitalCount +=1;
      }
      if (location.type === locationType.castle) {
        castleCount +=1;
      }
      if (!location.name) {
        problems.push('Location exists with no name');
        return;
      }
      if (!location.type) {
        problems.push(`${location.name} has no type`);
        return;
      }
      if (!location.domain) {
        problems.push(`${location.name} has no domain`);
        return;
      }
      if (location.domain === locationDomain.sea && location.type !== locationType.sea ||
        location.domain !== locationDomain.sea  && location.type === locationType.sea) {
        problems.push(`${location.name} has type ${location.type} and domain ${location.domain}`);
        return;
      }
      if (!location.roadConnections) {
        problems.push(`${location.name} is missing road connection definition`);
        return;
      }
      if (!location.trainConnections) {
        problems.push(`${location.name} is missing train connection definition`);
        return;
      }
      if (!location.seaConnections) {
        problems.push(`${location.name} is missing sea connection definition`);
        return;
      }
      if (location.roadConnections.length + location.trainConnections.length + location.seaConnections.length === 0) {
        problems.push(`${location.name} has no connections`);
        return;
      }
      location.roadConnections.forEach(road => {
        const destination = this.getLocationByName(road);
        if (!destination) {
          problems.push(`${location.name} has a road going to missing location ${road}`);
        } else {
          if (destination.type === locationType.sea) {
            problems.push(`${location.name} has a road going to sea location ${road}`);
          }
          if (!destination.roadConnections.find(loc => loc === location.name)) {
            problems.push(`${location.name} has a road to ${road} with no road back`);
          }
          if (location.type === locationType.sea) {
            problems.push(`Sea location ${location.name} has a road to ${destination.name}`);
          }
        }
      });

      location.trainConnections.forEach(train => {
        const destination = this.getLocationByName(train);
        if (!destination) {
          problems.push(`${location.name} has a train going to missing location ${train}`);
        } else {
          if (destination.type === locationType.sea) {
            problems.push(`${location.name} has a train going to sea location ${train}`);
          }
          if (!destination.trainConnections.find(loc => loc === location.name)) {
            problems.push(`${location.name} has a train to ${train} with no train back`);
          }
          if (location.type === locationType.sea) {
            problems.push(`Sea location ${location.name} has a train to location ${destination.name}`);
          }
        }
      });

      location.seaConnections.forEach(sea => {
        const destination = this.getLocationByName(sea);
        if (!destination) {
          problems.push(`${location.name} has a sea connection going to missing location ${sea}`);
        } else {
          if (!destination.seaConnections.find(loc => loc === location.name)) {
            problems.push(`${location.name} has a sea connection to ${sea} with no sea connection back`);
          }
          if (location.type !== locationType.sea && destination.type !== locationType.sea) {
            problems.push(`Land location ${location.name} has a sea connection to land location ${destination.name}`);
          }
        }
      });
    });
    let proceed = true;
    for (let i = 0; i < this.locations.length - 1; i++) {
      if (!proceed) break;
      for (let j = i + 1; j < this.locations.length; j++) {
        if (!proceed) break;
        if (this.distanceBetweenLocations(this.locations[i], this.locations[j]) == -1) {
          problems.push(`Disconnected locations. No way to get from ${this.locations[i].name} to ${this.locations[j].name}`);
          proceed = false;
          break;
        }
      }
    }
    if (hospitalCount !== 1) {
      problems.push(`Map data invalid. Expected exactly 1 hospital location, found ${hospitalCount}.`);
    }
    if (castleCount !== 1) {
      problems.push(`Map data invalid. Expected exactly 1 castle location, found ${castleCount}.`);
    }
    problems.forEach(problem => console.log(problem));
    if (problems.length > 0) {
      throw new Error(`Map data invalid. ${problems.length} problems`);
    }
    console.log('All map data valid');
  }

  getLocationByName(name: string) {
    return this.locations.find(location => location.name === name);
  }

  distanceBetweenLocations(origin: location, destination: location,
    methods: string[] = ['road', 'train', 'sea'],
    examinedLocations: location[] = [], locationsAtCurrentDistance: location[] = [], distance: number = 0): number {

    if (origin) {
      return this.distanceBetweenLocations(null, destination, methods, [], [origin], 0);
    }
    
    if (locationsAtCurrentDistance.find(location => location == destination)) {
      return distance;
    }
    examinedLocations = _.union(examinedLocations, locationsAtCurrentDistance);
    let nextLayerOfConnectedLocations: location[] = [];
    locationsAtCurrentDistance.forEach(location => {
      if (methods.find(method => method == 'road')) {
        const roadConnections = location.roadConnections.map(road => this.getLocationByName(road));
        nextLayerOfConnectedLocations = _.union(nextLayerOfConnectedLocations, roadConnections);
      }
      if (methods.find(method => method == 'train')) {
        const trainConnections = location.trainConnections.map(train => this.getLocationByName(train));
        nextLayerOfConnectedLocations = _.union(nextLayerOfConnectedLocations, trainConnections);
      }
      if (methods.find(method => method == 'sea')) {
        const seaConnections = location.seaConnections.map(sea => this.getLocationByName(sea));
        nextLayerOfConnectedLocations = _.union(nextLayerOfConnectedLocations, seaConnections);
      }
    });
    const newLocationsToExamine = _.difference(nextLayerOfConnectedLocations, examinedLocations);
    if (newLocationsToExamine.length == 0) {
      return -1;
    }
    return this.distanceBetweenLocations(null, destination, methods, examinedLocations, newLocationsToExamine, distance + 1);
  }
}

export interface location {
  name: string;
  type: locationType;
  domain: locationDomain;
  roadConnections: string[];
  trainConnections: string[];
  seaConnections: string[];
}

export enum locationType {
  largeCity = 'Large City',
  smallCity = 'Small City',
  hospital = 'Hospital',
  castle = 'Castle',
  sea = 'Sea'
}

export enum locationDomain {
  west = 'West',
  east = 'East',
  sea = 'Sea'
}

class genericLocationBuilder {
  location: location;

  constructor(name: string) {
    this.location = {
      name,
      type: null,
      domain: null,
      roadConnections: [],
      trainConnections: [],
      seaConnections: []
    };
  }

  byRoad(roadConnection: string): any {
    this.location.roadConnections.push(roadConnection);
    return this;
  }

  bySea(seaConnection: string): any {
    this.location.seaConnections.push(seaConnection)
    return this;
  }

  byTrain(trainConnection: string): any {
    this.location.trainConnections.push(trainConnection)
    return this;
  }

  done(): location {
    return this.location;
  }
}

class smallCityWest extends genericLocationBuilder{
  location: location;
  constructor(name: string) {
    super(name);
    this.location.type = locationType.smallCity;
    this.location.domain = locationDomain.west;
  }
}

class largeCityWest extends genericLocationBuilder{
  location: location;
  constructor(name: string) {
    super(name);
    this.location.type = locationType.largeCity;
    this.location.domain = locationDomain.west;
  }
}

class smallCityEast extends genericLocationBuilder{
  location: location;
  constructor(name: string) {
    super(name);
    this.location.type = locationType.smallCity;
    this.location.domain = locationDomain.east;
  }
}

class largeCityEast extends genericLocationBuilder{
  location: location;
  constructor(name: string) {
    super(name);
    this.location.type = locationType.largeCity;
    this.location.domain = locationDomain.east;
  }
}

const sea: location = {
  name: null,
  domain: locationDomain.sea,
  roadConnections: [],
  trainConnections: [],
  seaConnections: [],
  type: locationType.sea
}
import * as _ from 'lodash';

export class GameMap {
  locations: Location[];

  constructor() {
    this.locations = [
      new SmallCityWest('Galway')
        .byRoad('Dublin')
        .bySea('Atlantic Ocean')
        .done(),
      new SmallCityWest('Dublin')
        .byRoad('Galway')
        .bySea('Irish Sea')
        .done(),
      new LargeCityWest('Liverpool')
        .byRoad('Manchester')
        .byRoad('Swansea')
        .byTrain('Manchester')
        .bySea('Irish Sea')
        .done(),
      new LargeCityWest('Edinburgh')
        .byRoad('Manchester')
        .byTrain('Manchester')
        .bySea('North Sea')
        .done(),
      new LargeCityWest('Manchester')
        .byRoad('Edinburgh')
        .byRoad('Liverpool')
        .byRoad('London')
        .byTrain('Edinburgh')
        .byTrain('Liverpool')
        .byTrain('London')
        .done(),
      new SmallCityWest('Swansea')
        .byRoad('Liverpool')
        .byRoad('London')
        .byTrain('London')
        .bySea('Irish Sea')
        .done(),
      new SmallCityWest('Plymouth')
        .byRoad('London')
        .bySea('English Channel')
        .done(),
      new LargeCityWest('Nantes')
        .byRoad('Le Havre')
        .byRoad('Paris')
        .byRoad('Clermont Ferrand')
        .byRoad('Bordeaux')
        .bySea('Bay of Biscay')
        .done(),
      new SmallCityWest('Le Havre')
        .byRoad('Nantes')
        .byRoad('Paris')
        .byRoad('Brussels')
        .byTrain('Paris')
        .bySea('English Channel')
        .done(),
      new LargeCityWest('London')
        .byRoad('Manchester')
        .byRoad('Swansea')
        .byRoad('Plymouth')
        .byTrain('Manchester')
        .byTrain('Swansea')
        .bySea('English Channel')
        .done(),
      new LargeCityWest('Paris')
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
      new LargeCityWest('Brussels')
        .byRoad('Le Havre')
        .byRoad('Amsterdam')
        .byRoad('Cologne')
        .byRoad('Strasbourg')
        .byRoad('Paris')
        .byTrain('Cologne')
        .byTrain('Paris')
        .done(),
      new LargeCityWest('Amsterdam')
        .byRoad('Brussels')
        .byRoad('Cologne')
        .bySea('North Sea')
        .done(),
      new SmallCityWest('Strasbourg')
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
      new LargeCityWest('Cologne')
        .byRoad('Brussels')
        .byRoad('Amsterdam')
        .byRoad('Hamburg')
        .byRoad('Leipzig')
        .byRoad('Frankfurt')
        .byRoad('Strasbourg')
        .byTrain('Brussels')
        .byTrain('Frankfurt')
        .done(),
      new LargeCityWest('Hamburg')
        .byRoad('Cologne')
        .byRoad('Berlin')
        .byRoad('Leipzig')
        .byTrain('Berlin')
        .bySea('North Sea')
        .done(),
      new SmallCityWest('Frankfurt')
        .byRoad('Strasbourg')
        .byRoad('Cologne')
        .byRoad('Leipzig')
        .byRoad('Nuremburg')
        .byTrain('Strasbourg')
        .byTrain('Cologne')
        .byTrain('Leipzig')
        .done(),
      new SmallCityWest('Nuremburg')
        .byRoad('Strasbourg')
        .byRoad('Frankfurt')
        .byRoad('Leipzig')
        .byRoad('Prague')
        .byRoad('Munich')
        .byTrain('Leipzig')
        .byTrain('Munich')
        .done(),
      new LargeCityWest('Leipzig')
        .byRoad('Cologne')
        .byRoad('Hamburg')
        .byRoad('Berlin')
        .byRoad('Nuremburg')
        .byRoad('Frankfurt')
        .byTrain('Frankfurt')
        .byTrain('Berlin')
        .byTrain('Nuremburg')
        .done(),
      new LargeCityWest('Berlin')
        .byRoad('Hamburg')
        .byRoad('Prague')
        .byRoad('Leipzig')
        .byTrain('Hamburg')
        .byTrain('Prague')
        .byTrain('Leipzig')
        .done(),
      new LargeCityEast('Prague')
        .byRoad('Berlin')
        .byRoad('Vienna')
        .byRoad('Nuremburg')
        .byTrain('Berlin')
        .byTrain('Vienna')
        .done(),
      {
        name: 'Castle Dracula',
        domain: LocationDomain.east,
        roadConnections: ['Klausenburg', 'Galatz'],
        seaConnections: [],
        trainConnections: [],
        type: LocationType.castle
      },
      new SmallCityWest('Santander')
        .byRoad('Lisbon')
        .byRoad('Madrid')
        .byRoad('Saragossa')
        .byTrain('Madrid')
        .bySea('Bay of Biscay')
        .done(),
      new SmallCityWest('Saragossa')
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
      new LargeCityWest('Bordeaux')
        .byRoad('Saragossa')
        .byRoad('Nantes')
        .byRoad('Clermont Ferrand')
        .byRoad('Toulouse')
        .byTrain('Paris')
        .byTrain('Saragossa')
        .bySea('Bay of Biscay')
        .done(),
      new SmallCityWest('Toulouse')
        .byRoad('Saragossa')
        .byRoad('Bordeaux')
        .byRoad('Clermont Ferrand')
        .byRoad('Marseilles')
        .byRoad('Barcelona')
        .done(),
      new LargeCityWest('Barcelona')
        .byRoad('Saragossa')
        .byRoad('Toulouse')
        .byTrain('Saragossa')
        .byTrain('Alicante')
        .bySea('Mediterranean Sea')
        .done(),
      new SmallCityWest('Clermont Ferrand')
        .byRoad('Bordeaux')
        .byRoad('Nantes')
        .byRoad('Paris')
        .byRoad('Geneva')
        .byRoad('Marseilles')
        .byRoad('Toulouse')
        .done(),
      new LargeCityWest('Marseilles')
        .byRoad('Toulouse')
        .byRoad('Clermont Ferrand')
        .byRoad('Geneva')
        .byRoad('Zurich')
        .byRoad('Milan')
        .byRoad('Genoa')
        .byTrain('Paris')
        .bySea('Mediterranean Sea')
        .done(),
      new SmallCityWest('Geneva')
        .byRoad('Marseilles')
        .byRoad('Clermont Ferrand')
        .byRoad('Paris')
        .byRoad('Strasbourg')
        .byRoad('Zurich')
        .byTrain('Milan')
        .done(),
      new LargeCityEast('Genoa')
        .byRoad('Marseilles')
        .byRoad('Milan')
        .byRoad('Venice')
        .byRoad('Florence')
        .byTrain('Milan')
        .bySea('Tyrrhenian Sea')
        .done(),
      new LargeCityEast('Milan')
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
      new SmallCityWest('Zurich')
        .byRoad('Marseilles')
        .byRoad('Geneva')
        .byRoad('Strasbourg')
        .byRoad('Munich')
        .byRoad('Milan')
        .byTrain('Strasbourg')
        .byTrain('Milan')
        .done(),
      new SmallCityEast('Florence')
        .byRoad('Genoa')
        .byRoad('Venice')
        .byRoad('Rome')
        .byTrain('Milan')
        .byTrain('Rome')
        .done(),
      new SmallCityEast('Venice')
        .byRoad('Florence')
        .byRoad('Genoa')
        .byRoad('Milan')
        .byRoad('Munich')
        .byTrain('Vienna')
        .bySea('Adriatic Sea')
        .done(),
      new LargeCityWest('Munich')
        .byRoad('Milan')
        .byRoad('Zurich')
        .byRoad('Strasbourg')
        .byRoad('Nuremburg')
        .byRoad('Vienna')
        .byRoad('Zagreb')
        .byRoad('Venice')
        .byTrain('Nuremburg')
        .done(),
      new SmallCityEast('Zagreb')
        .byRoad('Munich')
        .byRoad('Vienna')
        .byRoad('Budapest')
        .byRoad('Szeged')
        .byRoad('St. Joseph and St. Mary')
        .byRoad('Sarajevo')
        .done(),
      new LargeCityEast('Vienna')
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
        domain: LocationDomain.east,
        roadConnections: ['Zagreb', 'Szeged', 'Belgrade', 'Sarajevo'],
        seaConnections: [],
        trainConnections: [],
        type: LocationType.hospital
      },
      new SmallCityEast('Sarajevo')
        .byRoad('Zagreb')
        .byRoad('St. Joseph and St. Mary')
        .byRoad('Belgrade')
        .byRoad('Sofia')
        .byRoad('Valona')
        .done(),
      new SmallCityEast('Szeged')
        .byRoad('Zagreb')
        .byRoad('Budapest')
        .byRoad('Klausenburg')
        .byRoad('Belgrade')
        .byRoad('St. Joseph and St. Mary')
        .byTrain('Budapest')
        .byTrain('Bucharest')
        .byTrain('Belgrade')
        .done(),
      new SmallCityEast('Budapest')
        .byRoad('Vienna')
        .byRoad('Klausenburg')
        .byRoad('Szeged')
        .byRoad('Zagreb')
        .byTrain('Vienna')
        .byTrain('Szeged')
        .done(),
      new SmallCityEast('Belgrade')
        .byRoad('St. Joseph and St. Mary')
        .byRoad('Szeged')
        .byRoad('Klausenburg')
        .byRoad('Bucharest')
        .byRoad('Sofia')
        .byRoad('Sarajevo')
        .byTrain('Szeged')
        .byTrain('Sofia')
        .done(),
      new SmallCityEast('Klausenburg')
        .byRoad('Budapest')
        .byRoad('Castle Dracula')
        .byRoad('Galatz')
        .byRoad('Bucharest')
        .byRoad('Belgrade')
        .byRoad('Szeged')
        .done(),
      new SmallCityEast('Sofia')
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
      new LargeCityEast('Bucharest')
        .byRoad('Belgrade')
        .byRoad('Klausenburg')
        .byRoad('Galatz')
        .byRoad('Constanta')
        .byRoad('Sofia')
        .byTrain('Szeged')
        .byTrain('Galatz')
        .byTrain('Constanta')
        .done(),
      new SmallCityEast('Galatz')
        .byRoad('Klausenburg')
        .byRoad('Castle Dracula')
        .byRoad('Constanta')
        .byRoad('Bucharest')
        .byTrain('Bucharest')
        .done(),
      new LargeCityEast('Varna')
        .byRoad('Sofia')
        .byRoad('Constanta')
        .byTrain('Sofia')
        .bySea('Black Sea')
        .done(),
      new LargeCityEast('Constanta')
        .byRoad('Galatz')
        .byRoad('Varna')
        .byRoad('Bucharest')
        .byTrain('Bucharest')
        .bySea('Black Sea')
        .done(),
      new LargeCityWest('Lisbon')
        .byRoad('Santander')
        .byRoad('Madrid')
        .byRoad('Cadiz')
        .byTrain('Madrid')
        .bySea('Atlantic Ocean')
        .done(),
      new LargeCityWest('Cadiz')
        .byRoad('Lisbon')
        .byRoad('Madrid')
        .byRoad('Granada')
        .bySea('Atlantic Ocean')
        .done(),
      new LargeCityWest('Madrid')
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
      new SmallCityWest('Granada')
        .byRoad('Cadiz')
        .byRoad('Madrid')
        .byRoad('Alicante')
        .done(),
      new SmallCityWest('Alicante')
        .byRoad('Granada')
        .byRoad('Madrid')
        .byRoad('Saragossa')
        .byTrain('Madrid')
        .byTrain('Barcelona')
        .bySea('Mediterranean Sea')
        .done(),
      new SmallCityEast('Cagliari')
        .bySea('Mediterranean Sea')
        .bySea('Tyrrhenian Sea')
        .done(),
      new LargeCityEast('Rome')
        .byRoad('Florence')
        .byRoad('Bari')
        .byRoad('Naples')
        .byTrain('Florence')
        .byTrain('Naples')
        .bySea('Tyrrhenian Sea')
        .done(),
      new LargeCityEast('Naples')
        .byRoad('Rome')
        .byRoad('Bari')
        .byTrain('Rome')
        .byTrain('Bari')
        .bySea('Tyrrhenian Sea')
        .done(),
      new SmallCityEast('Bari')
        .byRoad('Naples')
        .byRoad('Rome')
        .byTrain('Naples')
        .bySea('Adriatic Sea')
        .done(),
      new SmallCityEast('Valona')
        .byRoad('Sarajevo')
        .byRoad('Sofia')
        .byRoad('Salonica')
        .byRoad('Athens')
        .bySea('Ionian Sea')
        .done(),
      new SmallCityEast('Salonica')
        .byRoad('Valona')
        .byRoad('Sofia')
        .byTrain('Sofia')
        .bySea('Ionian Sea')
        .done(),
      new LargeCityEast('Athens')
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

  verifyMapData() {
    console.log('Verifying map data');
    let hospitalCount = 0;
    let castleCount = 0;
    let problems = [];
    this.locations.forEach(location => {
      if (location.type === LocationType.hospital) {
        hospitalCount +=1;
      }
      if (location.type === LocationType.castle) {
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
      if (location.domain === LocationDomain.sea && location.type !== LocationType.sea ||
        location.domain !== LocationDomain.sea  && location.type === LocationType.sea) {
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
          if (destination.type === LocationType.sea) {
            problems.push(`${location.name} has a road going to sea location ${road}`);
          }
          if (!destination.roadConnections.find(loc => loc === location.name)) {
            problems.push(`${location.name} has a road to ${road} with no road back`);
          }
          if (location.type === LocationType.sea) {
            problems.push(`Sea location ${location.name} has a road to ${destination.name}`);
          }
        }
      });

      location.trainConnections.forEach(train => {
        const destination = this.getLocationByName(train);
        if (!destination) {
          problems.push(`${location.name} has a train going to missing location ${train}`);
        } else {
          if (destination.type === LocationType.sea) {
            problems.push(`${location.name} has a train going to sea location ${train}`);
          }
          if (!destination.trainConnections.find(loc => loc === location.name)) {
            problems.push(`${location.name} has a train to ${train} with no train back`);
          }
          if (location.type === LocationType.sea) {
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
          if (location.type !== LocationType.sea && destination.type !== LocationType.sea) {
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
      problems.push(`Expected exactly 1 hospital location, found ${hospitalCount}.`);
    }
    if (castleCount !== 1) {
      problems.push(`Expected exactly 1 castle location, found ${castleCount}.`);
    }
    problems.forEach(problem => console.log(problem));
    if (problems.length > 0) {
      return `Map data invalid. ${problems.length} problems:\n${problems.join('\n')}`;
    }
    return 'All map data valid';
  }

  getLocationByName(name: string) {
    return this.locations.find(location => location.name === name);
  }

  distanceBetweenLocations(origin: Location, destination: Location,
    methods: string[] = ['road', 'train', 'sea'],
    examinedLocations: Location[] = [], locationsAtCurrentDistance: Location[] = [], distance: number = 0): number {

    if (origin) {
      return this.distanceBetweenLocations(null, destination, methods, [], [origin], 0);
    }
    
    if (locationsAtCurrentDistance.find(location => location == destination)) {
      return distance;
    }
    examinedLocations = _.union(examinedLocations, locationsAtCurrentDistance);
    let nextLayerOfConnectedLocations: Location[] = [];
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

export interface Location {
  name: string;
  type: LocationType;
  domain: LocationDomain;
  roadConnections: string[];
  trainConnections: string[];
  seaConnections: string[];
}

export enum LocationType {
  largeCity = 'Large City',
  smallCity = 'Small City',
  hospital = 'Hospital',
  castle = 'Castle',
  sea = 'Sea'
}

export enum LocationDomain {
  west = 'West',
  east = 'East',
  sea = 'Sea'
}

class GenericLocationBuilder {
  location: Location;

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

  done(): Location {
    return this.location;
  }
}

class SmallCityWest extends GenericLocationBuilder{
  location: Location;
  constructor(name: string) {
    super(name);
    this.location.type = LocationType.smallCity;
    this.location.domain = LocationDomain.west;
  }
}

class LargeCityWest extends GenericLocationBuilder{
  location: Location;
  constructor(name: string) {
    super(name);
    this.location.type = LocationType.largeCity;
    this.location.domain = LocationDomain.west;
  }
}

class SmallCityEast extends GenericLocationBuilder{
  location: Location;
  constructor(name: string) {
    super(name);
    this.location.type = LocationType.smallCity;
    this.location.domain = LocationDomain.east;
  }
}

class LargeCityEast extends GenericLocationBuilder{
  location: Location;
  constructor(name: string) {
    super(name);
    this.location.type = LocationType.largeCity;
    this.location.domain = LocationDomain.east;
  }
}

const sea: Location = {
  name: null,
  domain: LocationDomain.sea,
  roadConnections: [],
  trainConnections: [],
  seaConnections: [],
  type: LocationType.sea
}
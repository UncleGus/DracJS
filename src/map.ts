import * as _ from 'lodash';

export class GameMap {
  locations: Location[];

  constructor() {
    this.locations = [
      new SmallCityWest(LocationName.Galway)
        .byRoad(LocationName.Dublin)
        .bySea(LocationName.AtlanticOcean)
        .done(),
      new SmallCityWest(LocationName.Dublin)
        .byRoad(LocationName.Galway)
        .bySea(LocationName.IrishSea)
        .done(),
      new LargeCityWest(LocationName.Liverpool)
        .byRoad(LocationName.Manchester)
        .byRoad(LocationName.Swansea)
        .byTrain(LocationName.Manchester)
        .bySea(LocationName.IrishSea)
        .done(),
      new LargeCityWest(LocationName.Edinburgh)
        .byRoad(LocationName.Manchester)
        .byTrain(LocationName.Manchester)
        .bySea(LocationName.NorthSea)
        .done(),
      new LargeCityWest(LocationName.Manchester)
        .byRoad(LocationName.Edinburgh)
        .byRoad(LocationName.Liverpool)
        .byRoad(LocationName.London)
        .byTrain(LocationName.Edinburgh)
        .byTrain(LocationName.Liverpool)
        .byTrain(LocationName.London)
        .done(),
      new SmallCityWest(LocationName.Swansea)
        .byRoad(LocationName.Liverpool)
        .byRoad(LocationName.London)
        .byTrain(LocationName.London)
        .bySea(LocationName.IrishSea)
        .done(),
      new SmallCityWest(LocationName.Plymouth)
        .byRoad(LocationName.London)
        .bySea(LocationName.EnglishChannel)
        .done(),
      new LargeCityWest(LocationName.Nantes)
        .byRoad(LocationName.LeHavre)
        .byRoad(LocationName.Paris)
        .byRoad(LocationName.ClermontFerrand)
        .byRoad(LocationName.Bordeaux)
        .bySea(LocationName.BayOfBiscay)
        .done(),
      new SmallCityWest(LocationName.LeHavre)
        .byRoad(LocationName.Nantes)
        .byRoad(LocationName.Paris)
        .byRoad(LocationName.Brussels)
        .byTrain(LocationName.Paris)
        .bySea(LocationName.EnglishChannel)
        .done(),
      new LargeCityWest(LocationName.London)
        .byRoad(LocationName.Manchester)
        .byRoad(LocationName.Swansea)
        .byRoad(LocationName.Plymouth)
        .byTrain(LocationName.Manchester)
        .byTrain(LocationName.Swansea)
        .bySea(LocationName.EnglishChannel)
        .done(),
      new LargeCityWest(LocationName.Paris)
        .byRoad(LocationName.Nantes)
        .byRoad(LocationName.LeHavre)
        .byRoad(LocationName.Brussels)
        .byRoad(LocationName.Strasbourg)
        .byRoad(LocationName.Geneva)
        .byRoad(LocationName.ClermontFerrand)
        .byTrain(LocationName.LeHavre)
        .byTrain(LocationName.Brussels)
        .byTrain(LocationName.Marseilles)
        .byTrain(LocationName.Bordeaux)
        .done(),
      new LargeCityWest(LocationName.Brussels)
        .byRoad(LocationName.LeHavre)
        .byRoad(LocationName.Amsterdam)
        .byRoad(LocationName.Cologne)
        .byRoad(LocationName.Strasbourg)
        .byRoad(LocationName.Paris)
        .byTrain(LocationName.Cologne)
        .byTrain(LocationName.Paris)
        .done(),
      new LargeCityWest(LocationName.Amsterdam)
        .byRoad(LocationName.Brussels)
        .byRoad(LocationName.Cologne)
        .bySea(LocationName.NorthSea)
        .done(),
      new SmallCityWest(LocationName.Strasbourg)
        .byRoad(LocationName.Paris)
        .byRoad(LocationName.Brussels)
        .byRoad(LocationName.Cologne)
        .byRoad(LocationName.Frankfurt)
        .byRoad(LocationName.Nuremburg)
        .byRoad(LocationName.Munich)
        .byRoad(LocationName.Zurich)
        .byRoad(LocationName.Geneva)
        .byTrain(LocationName.Frankfurt)
        .byTrain(LocationName.Zurich)
        .done(),
      new LargeCityWest(LocationName.Cologne)
        .byRoad(LocationName.Brussels)
        .byRoad(LocationName.Amsterdam)
        .byRoad(LocationName.Hamburg)
        .byRoad(LocationName.Leipzig)
        .byRoad(LocationName.Frankfurt)
        .byRoad(LocationName.Strasbourg)
        .byTrain(LocationName.Brussels)
        .byTrain(LocationName.Frankfurt)
        .done(),
      new LargeCityWest(LocationName.Hamburg)
        .byRoad(LocationName.Cologne)
        .byRoad(LocationName.Berlin)
        .byRoad(LocationName.Leipzig)
        .byTrain(LocationName.Berlin)
        .bySea(LocationName.NorthSea)
        .done(),
      new SmallCityWest(LocationName.Frankfurt)
        .byRoad(LocationName.Strasbourg)
        .byRoad(LocationName.Cologne)
        .byRoad(LocationName.Leipzig)
        .byRoad(LocationName.Nuremburg)
        .byTrain(LocationName.Strasbourg)
        .byTrain(LocationName.Cologne)
        .byTrain(LocationName.Leipzig)
        .done(),
      new SmallCityWest(LocationName.Nuremburg)
        .byRoad(LocationName.Strasbourg)
        .byRoad(LocationName.Frankfurt)
        .byRoad(LocationName.Leipzig)
        .byRoad(LocationName.Prague)
        .byRoad(LocationName.Munich)
        .byTrain(LocationName.Leipzig)
        .byTrain(LocationName.Munich)
        .done(),
      new LargeCityWest(LocationName.Leipzig)
        .byRoad(LocationName.Cologne)
        .byRoad(LocationName.Hamburg)
        .byRoad(LocationName.Berlin)
        .byRoad(LocationName.Nuremburg)
        .byRoad(LocationName.Frankfurt)
        .byTrain(LocationName.Frankfurt)
        .byTrain(LocationName.Berlin)
        .byTrain(LocationName.Nuremburg)
        .done(),
      new LargeCityWest(LocationName.Berlin)
        .byRoad(LocationName.Hamburg)
        .byRoad(LocationName.Prague)
        .byRoad(LocationName.Leipzig)
        .byTrain(LocationName.Hamburg)
        .byTrain(LocationName.Prague)
        .byTrain(LocationName.Leipzig)
        .done(),
      new LargeCityEast(LocationName.Prague)
        .byRoad(LocationName.Berlin)
        .byRoad(LocationName.Vienna)
        .byRoad(LocationName.Nuremburg)
        .byTrain(LocationName.Berlin)
        .byTrain(LocationName.Vienna)
        .done(),
      {
        name: LocationName.CastleDracula,
        domain: LocationDomain.east,
        roadConnections: [LocationName.Klausenburg, LocationName.Galatz],
        seaConnections: [],
        trainConnections: [],
        type: LocationType.castle
      },
      new SmallCityWest(LocationName.Santander)
        .byRoad(LocationName.Lisbon)
        .byRoad(LocationName.Madrid)
        .byRoad(LocationName.Saragossa)
        .byTrain(LocationName.Madrid)
        .bySea(LocationName.BayOfBiscay)
        .done(),
      new SmallCityWest(LocationName.Saragossa)
        .byRoad(LocationName.Madrid)
        .byRoad(LocationName.Santander)
        .byRoad(LocationName.Bordeaux)
        .byRoad(LocationName.Toulouse)
        .byRoad(LocationName.Barcelona)
        .byRoad(LocationName.Alicante)
        .byTrain(LocationName.Madrid)
        .byTrain(LocationName.Bordeaux)
        .byTrain(LocationName.Barcelona)
        .done(),
      new LargeCityWest(LocationName.Bordeaux)
        .byRoad(LocationName.Saragossa)
        .byRoad(LocationName.Nantes)
        .byRoad(LocationName.ClermontFerrand)
        .byRoad(LocationName.Toulouse)
        .byTrain(LocationName.Paris)
        .byTrain(LocationName.Saragossa)
        .bySea(LocationName.BayOfBiscay)
        .done(),
      new SmallCityWest(LocationName.Toulouse)
        .byRoad(LocationName.Saragossa)
        .byRoad(LocationName.Bordeaux)
        .byRoad(LocationName.ClermontFerrand)
        .byRoad(LocationName.Marseilles)
        .byRoad(LocationName.Barcelona)
        .done(),
      new LargeCityWest(LocationName.Barcelona)
        .byRoad(LocationName.Saragossa)
        .byRoad(LocationName.Toulouse)
        .byTrain(LocationName.Saragossa)
        .byTrain(LocationName.Alicante)
        .bySea(LocationName.MediterraneanSea)
        .done(),
      new SmallCityWest(LocationName.ClermontFerrand)
        .byRoad(LocationName.Bordeaux)
        .byRoad(LocationName.Nantes)
        .byRoad(LocationName.Paris)
        .byRoad(LocationName.Geneva)
        .byRoad(LocationName.Marseilles)
        .byRoad(LocationName.Toulouse)
        .done(),
      new LargeCityWest(LocationName.Marseilles)
        .byRoad(LocationName.Toulouse)
        .byRoad(LocationName.ClermontFerrand)
        .byRoad(LocationName.Geneva)
        .byRoad(LocationName.Zurich)
        .byRoad(LocationName.Milan)
        .byRoad(LocationName.Genoa)
        .byTrain(LocationName.Paris)
        .bySea(LocationName.MediterraneanSea)
        .done(),
      new SmallCityWest(LocationName.Geneva)
        .byRoad(LocationName.Marseilles)
        .byRoad(LocationName.ClermontFerrand)
        .byRoad(LocationName.Paris)
        .byRoad(LocationName.Strasbourg)
        .byRoad(LocationName.Zurich)
        .byTrain(LocationName.Milan)
        .done(),
      new LargeCityEast(LocationName.Genoa)
        .byRoad(LocationName.Marseilles)
        .byRoad(LocationName.Milan)
        .byRoad(LocationName.Venice)
        .byRoad(LocationName.Florence)
        .byTrain(LocationName.Milan)
        .bySea(LocationName.TyrrhenianSea)
        .done(),
      new LargeCityEast(LocationName.Milan)
        .byRoad(LocationName.Marseilles)
        .byRoad(LocationName.Zurich)
        .byRoad(LocationName.Munich)
        .byRoad(LocationName.Venice)
        .byRoad(LocationName.Genoa)
        .byTrain(LocationName.Geneva)
        .byTrain(LocationName.Zurich)
        .byTrain(LocationName.Florence)
        .byTrain(LocationName.Genoa)
        .done(),
      new SmallCityWest(LocationName.Zurich)
        .byRoad(LocationName.Marseilles)
        .byRoad(LocationName.Geneva)
        .byRoad(LocationName.Strasbourg)
        .byRoad(LocationName.Munich)
        .byRoad(LocationName.Milan)
        .byTrain(LocationName.Strasbourg)
        .byTrain(LocationName.Milan)
        .done(),
      new SmallCityEast(LocationName.Florence)
        .byRoad(LocationName.Genoa)
        .byRoad(LocationName.Venice)
        .byRoad(LocationName.Rome)
        .byTrain(LocationName.Milan)
        .byTrain(LocationName.Rome)
        .done(),
      new SmallCityEast(LocationName.Venice)
        .byRoad(LocationName.Florence)
        .byRoad(LocationName.Genoa)
        .byRoad(LocationName.Milan)
        .byRoad(LocationName.Munich)
        .byTrain(LocationName.Vienna)
        .bySea(LocationName.AdriaticSea)
        .done(),
      new LargeCityWest(LocationName.Munich)
        .byRoad(LocationName.Milan)
        .byRoad(LocationName.Zurich)
        .byRoad(LocationName.Strasbourg)
        .byRoad(LocationName.Nuremburg)
        .byRoad(LocationName.Vienna)
        .byRoad(LocationName.Zagreb)
        .byRoad(LocationName.Venice)
        .byTrain(LocationName.Nuremburg)
        .done(),
      new SmallCityEast(LocationName.Zagreb)
        .byRoad(LocationName.Munich)
        .byRoad(LocationName.Vienna)
        .byRoad(LocationName.Budapest)
        .byRoad(LocationName.Szeged)
        .byRoad(LocationName.StJosephAndStMary)
        .byRoad(LocationName.Sarajevo)
        .done(),
      new LargeCityEast(LocationName.Vienna)
        .byRoad(LocationName.Munich)
        .byRoad(LocationName.Prague)
        .byRoad(LocationName.Budapest)
        .byRoad(LocationName.Zagreb)
        .byTrain(LocationName.Venice)
        .byTrain(LocationName.Prague)
        .byTrain(LocationName.Budapest)
        .done(),
      {
        name: LocationName.StJosephAndStMary,
        domain: LocationDomain.east,
        roadConnections: [LocationName.Zagreb, LocationName.Szeged, LocationName.Belgrade, LocationName.Sarajevo],
        seaConnections: [],
        trainConnections: [],
        type: LocationType.hospital
      },
      new SmallCityEast(LocationName.Sarajevo)
        .byRoad(LocationName.Zagreb)
        .byRoad(LocationName.StJosephAndStMary)
        .byRoad(LocationName.Belgrade)
        .byRoad(LocationName.Sofia)
        .byRoad(LocationName.Valona)
        .done(),
      new SmallCityEast(LocationName.Szeged)
        .byRoad(LocationName.Zagreb)
        .byRoad(LocationName.Budapest)
        .byRoad(LocationName.Klausenburg)
        .byRoad(LocationName.Belgrade)
        .byRoad(LocationName.StJosephAndStMary)
        .byTrain(LocationName.Budapest)
        .byTrain(LocationName.Bucharest)
        .byTrain(LocationName.Belgrade)
        .done(),
      new SmallCityEast(LocationName.Budapest)
        .byRoad(LocationName.Vienna)
        .byRoad(LocationName.Klausenburg)
        .byRoad(LocationName.Szeged)
        .byRoad(LocationName.Zagreb)
        .byTrain(LocationName.Vienna)
        .byTrain(LocationName.Szeged)
        .done(),
      new SmallCityEast(LocationName.Belgrade)
        .byRoad(LocationName.StJosephAndStMary)
        .byRoad(LocationName.Szeged)
        .byRoad(LocationName.Klausenburg)
        .byRoad(LocationName.Bucharest)
        .byRoad(LocationName.Sofia)
        .byRoad(LocationName.Sarajevo)
        .byTrain(LocationName.Szeged)
        .byTrain(LocationName.Sofia)
        .done(),
      new SmallCityEast(LocationName.Klausenburg)
        .byRoad(LocationName.Budapest)
        .byRoad(LocationName.CastleDracula)
        .byRoad(LocationName.Galatz)
        .byRoad(LocationName.Bucharest)
        .byRoad(LocationName.Belgrade)
        .byRoad(LocationName.Szeged)
        .done(),
      new SmallCityEast(LocationName.Sofia)
        .byRoad(LocationName.Sarajevo)
        .byRoad(LocationName.Belgrade)
        .byRoad(LocationName.Bucharest)
        .byRoad(LocationName.Varna)
        .byRoad(LocationName.Salonica)
        .byRoad(LocationName.Valona)
        .byTrain(LocationName.Belgrade)
        .byTrain(LocationName.Salonica)
        .byTrain(LocationName.Varna)
        .done(),
      new LargeCityEast(LocationName.Bucharest)
        .byRoad(LocationName.Belgrade)
        .byRoad(LocationName.Klausenburg)
        .byRoad(LocationName.Galatz)
        .byRoad(LocationName.Constanta)
        .byRoad(LocationName.Sofia)
        .byTrain(LocationName.Szeged)
        .byTrain(LocationName.Galatz)
        .byTrain(LocationName.Constanta)
        .done(),
      new SmallCityEast(LocationName.Galatz)
        .byRoad(LocationName.Klausenburg)
        .byRoad(LocationName.CastleDracula)
        .byRoad(LocationName.Constanta)
        .byRoad(LocationName.Bucharest)
        .byTrain(LocationName.Bucharest)
        .done(),
      new LargeCityEast(LocationName.Varna)
        .byRoad(LocationName.Sofia)
        .byRoad(LocationName.Constanta)
        .byTrain(LocationName.Sofia)
        .bySea(LocationName.BlackSea)
        .done(),
      new LargeCityEast(LocationName.Constanta)
        .byRoad(LocationName.Galatz)
        .byRoad(LocationName.Varna)
        .byRoad(LocationName.Bucharest)
        .byTrain(LocationName.Bucharest)
        .bySea(LocationName.BlackSea)
        .done(),
      new LargeCityWest(LocationName.Lisbon)
        .byRoad(LocationName.Santander)
        .byRoad(LocationName.Madrid)
        .byRoad(LocationName.Cadiz)
        .byTrain(LocationName.Madrid)
        .bySea(LocationName.AtlanticOcean)
        .done(),
      new LargeCityWest(LocationName.Cadiz)
        .byRoad(LocationName.Lisbon)
        .byRoad(LocationName.Madrid)
        .byRoad(LocationName.Granada)
        .bySea(LocationName.AtlanticOcean)
        .done(),
      new LargeCityWest(LocationName.Madrid)
        .byRoad(LocationName.Lisbon)
        .byRoad(LocationName.Santander)
        .byRoad(LocationName.Saragossa)
        .byRoad(LocationName.Alicante)
        .byRoad(LocationName.Granada)
        .byRoad(LocationName.Cadiz)
        .byTrain(LocationName.Lisbon)
        .byTrain(LocationName.Santander)
        .byTrain(LocationName.Saragossa)
        .byTrain(LocationName.Alicante)
        .done(),
      new SmallCityWest(LocationName.Granada)
        .byRoad(LocationName.Cadiz)
        .byRoad(LocationName.Madrid)
        .byRoad(LocationName.Alicante)
        .done(),
      new SmallCityWest(LocationName.Alicante)
        .byRoad(LocationName.Granada)
        .byRoad(LocationName.Madrid)
        .byRoad(LocationName.Saragossa)
        .byTrain(LocationName.Madrid)
        .byTrain(LocationName.Barcelona)
        .bySea(LocationName.MediterraneanSea)
        .done(),
      new SmallCityEast(LocationName.Cagliari)
        .bySea(LocationName.MediterraneanSea)
        .bySea(LocationName.TyrrhenianSea)
        .done(),
      new LargeCityEast(LocationName.Rome)
        .byRoad(LocationName.Florence)
        .byRoad(LocationName.Bari)
        .byRoad(LocationName.Naples)
        .byTrain(LocationName.Florence)
        .byTrain(LocationName.Naples)
        .bySea(LocationName.TyrrhenianSea)
        .done(),
      new LargeCityEast(LocationName.Naples)
        .byRoad(LocationName.Rome)
        .byRoad(LocationName.Bari)
        .byTrain(LocationName.Rome)
        .byTrain(LocationName.Bari)
        .bySea(LocationName.TyrrhenianSea)
        .done(),
      new SmallCityEast(LocationName.Bari)
        .byRoad(LocationName.Naples)
        .byRoad(LocationName.Rome)
        .byTrain(LocationName.Naples)
        .bySea(LocationName.AdriaticSea)
        .done(),
      new SmallCityEast(LocationName.Valona)
        .byRoad(LocationName.Sarajevo)
        .byRoad(LocationName.Sofia)
        .byRoad(LocationName.Salonica)
        .byRoad(LocationName.Athens)
        .bySea(LocationName.IonianSea)
        .done(),
      new SmallCityEast(LocationName.Salonica)
        .byRoad(LocationName.Valona)
        .byRoad(LocationName.Sofia)
        .byTrain(LocationName.Sofia)
        .bySea(LocationName.IonianSea)
        .done(),
      new LargeCityEast(LocationName.Athens)
        .byRoad(LocationName.Valona)
        .bySea(LocationName.IonianSea)
        .done(),
      {
        ...sea,
        name: LocationName.AtlanticOcean,
        seaConnections: [LocationName.NorthSea, LocationName.IrishSea, LocationName.EnglishChannel, LocationName.BayOfBiscay, LocationName.MediterraneanSea, LocationName.Galway, LocationName.Lisbon, LocationName.Cadiz]
      },
      {
        ...sea,
        name: LocationName.IrishSea,
        seaConnections: [LocationName.AtlanticOcean, LocationName.Dublin, LocationName.Liverpool, LocationName.Swansea]
      },
      {
        ...sea,
        name: LocationName.EnglishChannel,
        seaConnections: [LocationName.AtlanticOcean, LocationName.NorthSea, LocationName.Plymouth, LocationName.London, LocationName.LeHavre]
      },
      {
        ...sea,
        name: LocationName.NorthSea,
        seaConnections: [LocationName.AtlanticOcean, LocationName.EnglishChannel, LocationName.Edinburgh, LocationName.Amsterdam, LocationName.Hamburg]
      },
      {
        ...sea,
        name: LocationName.BayOfBiscay,
        seaConnections: [LocationName.AtlanticOcean, LocationName.Nantes, LocationName.Bordeaux, LocationName.Santander]
      },
      {
        ...sea,
        name: LocationName.MediterraneanSea,
        seaConnections: [LocationName.AtlanticOcean, LocationName.TyrrhenianSea, LocationName.Alicante, LocationName.Barcelona, LocationName.Marseilles, LocationName.Cagliari]
      },
      {
        ...sea,
        name: LocationName.TyrrhenianSea,
        seaConnections: [LocationName.MediterraneanSea, LocationName.IonianSea, LocationName.Cagliari, LocationName.Genoa, LocationName.Rome, LocationName.Naples]
      },
      {
        ...sea,
        name: LocationName.AdriaticSea,
        seaConnections: [LocationName.IonianSea, LocationName.Bari, LocationName.Venice]
      },
      {
        ...sea,
        name: LocationName.IonianSea,
        seaConnections: [LocationName.AdriaticSea, LocationName.BlackSea, LocationName.Valona, LocationName.Athens, LocationName.Salonica, LocationName.TyrrhenianSea]
      },
      {
        ...sea,
        name: LocationName.BlackSea,
        seaConnections: [LocationName.IonianSea, LocationName.Varna, LocationName.Constanta]
      },
    ];
    this.locations.sort((first, second) => {
      if (first.name.toLowerCase() < second.name.toLowerCase()) {
        return -1;
      } else if (first.name.toLowerCase() > second.name.toLowerCase()) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  /**
   * Checks the integrity of the map data, including:
   * - all locations exist with name
   * - all locations exist with type
   * - all locations exist with domain
   * - all locations exist with road connection definitions, which may be empty
   * - all locations exist with train connection definitions, which may be empty
   * - all locations exist with sea connection definitions, which may be empty
   * - all locations exist with at least one actual connection
   * - all referenced locations exist
   * - all connections are dual-direction
   * - all locations are accessible from any other location
   * - there is exactly one hospital
   * - there is exactly one castle
   */
  verifyMapData() {
    console.log('Verifying map data');
    let hospitalCount = 0;
    let castleCount = 0;
    let problems = [];
    this.locations.forEach(location => {
      if (location.type === LocationType.hospital) {
        hospitalCount += 1;
      }
      if (location.type === LocationType.castle) {
        castleCount += 1;
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
        location.domain !== LocationDomain.sea && location.type === LocationType.sea) {
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

  /**
   * Finds the Location object based on a name string
   * @param name The name of the Location
   */
  getLocationByName(name: string) {
    return this.locations.find(location => location.name === name);
  }

  /**
   * Finds the distance in moves from one Location to another
   * @param origin The starting Location
   * @param destination The end Location
   * @param methods (optional) The methods of transport to include: 'road', 'train', 'sea'; Defaults to all
   * @param examinedLocations Only used for recursive calls
   * @param locationsAtCurrentDistance Only used for recursive calls
   * @param distance Only used for recursive calls
   */
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

  /**
   * Adds a Location name to the roadConnections
   * @param roadConnection The name of the Location to add
   */
  byRoad(roadConnection: string): any {
    this.location.roadConnections.push(roadConnection);
    return this;
  }

  /**
   * Adds a Location name to the seaConnections
   * @param seaConnection The name of the Location to add
   */
  bySea(seaConnection: string): any {
    this.location.seaConnections.push(seaConnection)
    return this;
  }

  /**
   * Adds a Location name to the trainConnections
   * @param trainConnection The name of the Location to add
   */
  byTrain(trainConnection: string): any {
    this.location.trainConnections.push(trainConnection)
    return this;
  }

  /**
   * Completes the "build" process
   */
  done(): Location {
    return this.location;
  }
}

class SmallCityWest extends GenericLocationBuilder {
  location: Location;
  constructor(name: string) {
    super(name);
    this.location.type = LocationType.smallCity;
    this.location.domain = LocationDomain.west;
  }
}

class LargeCityWest extends GenericLocationBuilder {
  location: Location;
  constructor(name: string) {
    super(name);
    this.location.type = LocationType.largeCity;
    this.location.domain = LocationDomain.west;
  }
}

class SmallCityEast extends GenericLocationBuilder {
  location: Location;
  constructor(name: string) {
    super(name);
    this.location.type = LocationType.smallCity;
    this.location.domain = LocationDomain.east;
  }
}

class LargeCityEast extends GenericLocationBuilder {
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

export enum LocationName {
  AdriaticSea = 'Adriatic Sea',
  Alicante = 'Alicante',
  Amsterdam = 'Amsterdam',
  Athens = 'Athens',
  AtlanticOcean = 'Atlantic Ocean',
  Barcelona = 'Barcelona',
  Bari = 'Bari',
  BayOfBiscay = 'Bay of Biscay',
  Belgrade = 'Belgrade',
  Berlin = 'Berlin',
  BlackSea = 'Black Sea',
  Bordeaux = 'Bordeaux',
  Brussels = 'Brussels',
  Bucharest = 'Bucharest',
  Budapest = 'Budapest',
  Cadiz = 'Cadiz',
  Cagliari = 'Cagliari',
  CastleDracula = 'Castle Dracula',
  ClermontFerrand = 'Clermont-Ferranc',
  Cologne = 'Cologne',
  Constanta = 'Constanta',
  Dublin = 'Dublin',
  Edinburgh = 'Edinburgh',
  EnglishChannel = 'English Channel',
  Florence = 'Florence',
  Frankfurt = 'Frankfurt',
  Galatz = 'Galatz',
  Galway = 'Galway',
  Geneva = 'Geneva',
  Genoa = 'Genoa',
  Granada = 'Granada',
  Hamburg = 'Hamburg',
  IonianSea = 'Ionian Sea',
  IrishSea = 'Irish Sea',
  Klausenburg = 'Klausenburg',
  LeHavre = 'Le Havre',
  Leipzig = 'Leipzig',
  Lisbon = 'Lisbon',
  Liverpool = 'Liverpool',
  London = 'London',
  Madrid = 'Madrid',
  Manchester = 'Manchester',
  Marseilles = 'Marseilles',
  MediterraneanSea = 'Mediterranean Sea',
  Milan = 'Milan',
  Munich = 'Munich',
  Nantes = 'Nantest',
  Naples = 'Naples',
  NorthSea = 'North Sea',
  Nuremburg = 'Nuremburg',
  Paris = 'Paris',
  Plymouth = 'Plymouth',
  Prague = 'Prague',
  Rome = 'Rome',
  Salonica = 'Salonica',
  Santander = 'Santander',
  Saragossa = 'Saragossa',
  Sarajevo = 'Sarajevo',
  Sofia = 'Sofia',
  StJosephAndStMary = 'Hospital of St. Joseph and St. Mary',
  Strasbourg = 'Strasbourg',
  Swansea = 'Swansea',
  Szeged = 'Szeged',
  Toulouse = 'Toulouse',
  TyrrhenianSea = 'Tyrrhenian Sea',
  Valona = 'Valona',
  Varna = 'Varna',
  Venice = 'Venice',
  Vienna = 'Vienna',
  Zagreb = 'Zagreb',
  Zurich = 'Zurich'
}
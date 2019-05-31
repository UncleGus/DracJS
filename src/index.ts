import * as _ from 'lodash';
import { Game } from "./game";
import { LocationType, Location } from "./map";
import { TrailCard } from "./dracula";
import { Encounter, EncounterName } from "./encounter";
import { EventName } from './event';
import { Hunter } from './hunter';
import { ItemName, Item } from './item';

const game = new Game();

// get webpage components
const logBox = document.getElementById('logBox') as HTMLInputElement;
const draculaBlood = document.getElementById('draculaBlood') as HTMLInputElement;
const draculaLocation = document.getElementById('draculaLocation') as HTMLInputElement;
const encounterCount = document.getElementById('encounterCount') as HTMLInputElement;
const eventCount = document.getElementById('eventCount') as HTMLInputElement;
const draculaAlly = document.getElementById('draculaAlly') as HTMLInputElement;
const hunterAlly = document.getElementById('hunterAlly') as HTMLInputElement;

const godalming = document.getElementById('godalming');
const seward = document.getElementById('seward');
const vanHelsing = document.getElementById('vanHelsing');
const mina = document.getElementById('mina');
const dracula = document.getElementById('dracula');

const moveMethod = document.getElementById('moveMethod') as HTMLSelectElement;
const destination = document.getElementById('destination') as HTMLSelectElement;
const travelButton = document.getElementById('travel');
const draculaEvent = document.getElementById('draculaEvent');
const eventDeck = document.getElementById('eventDeck') as HTMLSelectElement;
const drawEvent = document.getElementById('hunterEvent');
const discardEvent = document.getElementById('discardEvent');
const playEvent = document.getElementById('playEvent');
const itemDeck = document.getElementById('itemDeck') as HTMLSelectElement;
const drawItem = document.getElementById('drawItem');
const discardItem = document.getElementById('discardItem');
const giveItem = document.getElementById('giveItem');
const takeItem = document.getElementById('takeItem');
const fight = document.getElementById('fight');
const hunterWin = document.getElementById('hunterWin');
const enemyWin = document.getElementById('enemyWin');
const targetLocation = document.getElementById('targetLocation');
const locationSelector = document.getElementById('locationSelector') as HTMLSelectElement;
const consecratedGround = document.getElementById('consecratedGround') as HTMLInputElement;
const timePhase = document.getElementById('timePhase') as HTMLInputElement;
const vampireTrack = document.getElementById('vampireTrack') as HTMLInputElement;
const resolveTrack = document.getElementById('resolveTrack') as HTMLInputElement;
const itemDiscard = document.getElementById('itemDiscard') as HTMLSelectElement;
const eventDiscard = document.getElementById('eventDiscard') as HTMLSelectElement;
const resolveEncounter = document.getElementById('resolveEncounter');
const discardEncounter = document.getElementById('discardEncounter');
const startButton = document.getElementById('startButton');
const draculaTurnButton = document.getElementById('draculaTurn');
const newspaperReportsButton = document.getElementById('newspaperReports');
const debugGameStateButton = document.getElementById('debugGameState');

const trailLocation = [
  document.getElementById('trail1') as HTMLInputElement,
  document.getElementById('trail2') as HTMLInputElement,
  document.getElementById('trail3') as HTMLInputElement,
  document.getElementById('trail4') as HTMLInputElement,
  document.getElementById('trail5') as HTMLInputElement,
  document.getElementById('trail6') as HTMLInputElement
];
const trailEncounter = [
  document.getElementById('encounter1') as HTMLInputElement,
  document.getElementById('encounter2') as HTMLInputElement,
  document.getElementById('encounter3') as HTMLInputElement,
  document.getElementById('encounter4') as HTMLInputElement,
  document.getElementById('encounter5') as HTMLInputElement,
  document.getElementById('encounter6') as HTMLInputElement
];
const trailPower = [
  document.getElementById('power1') as HTMLInputElement,
  document.getElementById('power2') as HTMLInputElement,
  document.getElementById('power3') as HTMLInputElement,
  document.getElementById('power4') as HTMLInputElement,
  document.getElementById('power5') as HTMLInputElement,
  document.getElementById('power6') as HTMLInputElement
];
const catacombLocation = [
  document.getElementById('catacombLocation1') as HTMLInputElement,
  document.getElementById('catacombLocation2') as HTMLInputElement,
  document.getElementById('catacombLocation3') as HTMLInputElement,
];
const catacombEncounterA = [
  document.getElementById('catacombEncounter1A') as HTMLInputElement,
  document.getElementById('catacombEncounter2A') as HTMLInputElement,
  document.getElementById('catacombEncounter3A') as HTMLInputElement,
];
const catacombEncounterB = [
  document.getElementById('catacombEncounter1B') as HTMLInputElement,
  document.getElementById('catacombEncounter2B') as HTMLInputElement,
  document.getElementById('catacombEncounter3B') as HTMLInputElement,
];
const ambushEncounter = document.getElementById('ambushEncounter') as HTMLInputElement;

const hunters = [game.godalming, game.seward, game.vanHelsing, game.mina];
const hunterDetails = [godalming, seward, vanHelsing, mina];
const timePhaseDescriptions = ['Dawn', 'Noon', 'Dusk', 'Twilight', 'Midnight', 'Small Hours'];
let draculaSelected = false;
let selectedEncounterName = '';
let actingHunter = 0;

// wire up webpage components
draculaBlood.addEventListener('change', () => {
  game.setDraculaBlood(parseInt(draculaBlood.value));
  updateDraculaDetails();
  updateLog();
});

vampireTrack.addEventListener('change', () => {
  game.setVampireTrack(parseInt(vampireTrack.value));
  updateDraculaDetails();
  updateLog();
});

resolveTrack.addEventListener('change', () => {
  game.setResolveTrack(parseInt(resolveTrack.value));
  updateDraculaDetails();
  updateLog();
});

for (let i = 0; i < 4; i++) {
  hunterDetails[i].addEventListener('click', () => {
    actingHunter = i;
    updateTargetLocation();
    updateSelectedHunter();
  });
  hunterDetails[i].querySelector('#group').addEventListener('change', () => {
    hunters[i].groupNumber = (hunterDetails[i].querySelector('#group') as HTMLSelectElement).selectedIndex;
  });
  hunterDetails[i].querySelector('#health').addEventListener('change', () => {
    game.setHunterHealth(hunters[i], parseInt((hunterDetails[i].querySelector('#health') as HTMLSelectElement).value));
    updateHunterDetails();
    updateLog();
  });
  hunterDetails[i].querySelector('#bites').addEventListener('change', () => {
    game.setHunterBites(hunters[i], parseInt((hunterDetails[i].querySelector('#bites') as HTMLInputElement).value));
    updateHunterDetails();
    updateLog();
  });
}

for (let i = 0; i < 6; i++) {
  trailEncounter[i].addEventListener('click', () => {
    game.selectedTrailEncounter = i;
    game.selectedCatacombEncounterA = -1;
    game.selectedCatacombEncounterB = -1;
    draculaSelected = false;
    game.selectedAmbushEncounter = false;
    selectedEncounterName = trailEncounter[i].value;
    updateSelectedEncounter();
  });
}
for (let i = 0; i < 3; i++) {
  catacombEncounterA[i].addEventListener('click', () => {
    game.selectedTrailEncounter = -1;
    game.selectedCatacombEncounterA = i;
    game.selectedCatacombEncounterB = -1;
    draculaSelected = false;
    game.selectedAmbushEncounter = false;
    selectedEncounterName = catacombEncounterA[i].value;
    updateSelectedEncounter();
  });
  catacombEncounterB[i].addEventListener('click', () => {
    game.selectedTrailEncounter = -1;
    game.selectedCatacombEncounterA = -1;
    game.selectedCatacombEncounterB = i;
    draculaSelected = false;
    game.selectedAmbushEncounter = false;
    selectedEncounterName = catacombEncounterB[i].value;
    updateSelectedEncounter();
  });
}
dracula.addEventListener('click', () => {
  game.selectedTrailEncounter = -1;
  game.selectedCatacombEncounterA = -1;
  game.selectedCatacombEncounterB = -1;
  draculaSelected = true;
  game.selectedAmbushEncounter = false;
  selectedEncounterName = 'Dracula';
  updateSelectedEncounter();
});
ambushEncounter.addEventListener('click', () => {
  game.selectedTrailEncounter = -1;
  game.selectedCatacombEncounterA = -1;
  game.selectedCatacombEncounterB = -1;
  draculaSelected = false;
  game.selectedAmbushEncounter = true;
  selectedEncounterName = ambushEncounter.value;
  updateSelectedEncounter();
});
resolveEncounter.addEventListener('click', () => {
  game.resolveEncounter(selectedEncounterName, hunters[actingHunter]);
  updateAllFields();
});

newspaperReportsButton.addEventListener('click', () => {
  game.resolveNewspaperReports(true);
  updateAllFields();
});

fight.addEventListener('click', () => {
  const huntersInCombat: Hunter[] = [];
  const chosenItems: string[] = [];
  if (hunters[actingHunter].groupNumber == 0) {
    if ((hunterDetails[actingHunter].querySelector('#items') as HTMLSelectElement).selectedIndex > -1) {
      huntersInCombat.push(hunters[actingHunter]);
      chosenItems.push((hunterDetails[actingHunter].querySelector('#items') as HTMLSelectElement).value);
    } else {
      return;
    }
  } else {
    for (let i = 0; i < 4; i++) {
      if (hunters[i].groupNumber == hunters[actingHunter].groupNumber) {
        huntersInCombat.push(hunters[i]);
        if ((hunterDetails[i].querySelector('#items') as HTMLSelectElement).selectedIndex > -1) {
          chosenItems.push((hunterDetails[i].querySelector('#items') as HTMLSelectElement).value);
        } else {
          return;
        }
      }
    }
  }
  game.resolveCombatRound(huntersInCombat, chosenItems);
  updateLog();
});

hunterWin.addEventListener('click', () => {
  game.applyHunterAttackSuccess(hunters[actingHunter].lastUsedCombatItem);
  updateHunterDetails();
  updateLog();
});

enemyWin.addEventListener('click', () => {
  game.applyEnemyAttackSuccess()
  updateHunterDetails();
  updateDraculaDetails();
  updateTrail();
  updateLog();
});

discardEncounter.addEventListener('click', () => {
  game.discardEncounter(selectedEncounterName);
  updateAllFields();
});

travelButton.addEventListener('click', () => {
  if (moveMethod.value == EncounterName.Bats) {
    game.setHunterLocation(hunters[actingHunter], game.dracula.decideBatsDestination(hunters[actingHunter], game).name);
    let batsTile: Encounter;
    game.huntersInGroup(hunters[actingHunter]).forEach(companion => {
      batsTile = game.removeEncounterFromHunter(companion, EncounterName.Bats);
    });
    game.encounterPool.push(batsTile);
    game.shuffleEncounters();
  } else if (moveMethod.value == EncounterName.Fog) {
    let fogTile: Encounter;
    game.huntersInGroup(hunters[actingHunter]).forEach(companion => {
      fogTile = game.removeEncounterFromHunter(companion, EncounterName.Fog);
    });
    game.encounterPool.push(fogTile);
    game.shuffleEncounters();

  } else if (destination.value) {
    moveMethod.selectedIndex = 0;
    game.setHunterLocation(hunters[actingHunter], destination.value);
    if (moveMethod.value == 'Start Location') {
      actingHunter = Math.min(actingHunter + 1, 3);
      updateSelectedHunter();
    }
    if (moveMethod.value == 'Sense of Emergency') {
      game.resolveTrack--;
      updateDraculaDetails();
    }
    updateHunterDetails();
    updateLog();
  }
});

startButton.addEventListener('click', () => {
  actingHunter = 0;
  startButton.parentNode.removeChild(startButton);
  game.startGame();
  draculaTurnButton.style.removeProperty('display');
  clearOptions(destination);
  for (let i = 0; i < 4; i++) {
    hunterDetails[i].addEventListener('click', () => {
      actingHunter = i;
      updateMoveMethods();
    });
  }
  clearOptions(moveMethod);
  updateMoveMethods();
  moveMethod.addEventListener('change', () => {
    clearOptions(destination);
    switch (moveMethod.value) {
      case 'Road':
        hunters[actingHunter].currentLocation.roadConnections
          .forEach(location => destination.options.add(new Option(location.name)));
        break;
      case 'Train':
        let trainDestinations: Location[] = [hunters[actingHunter].currentLocation];
        for (let i = 0; i < 3; i++) {
          let newDestinations: Location[] = [];
          trainDestinations.forEach(location => {
            newDestinations = newDestinations.concat(location.trainConnections);
          });
          trainDestinations = trainDestinations.concat(newDestinations);
        }
        trainDestinations = _.uniq(trainDestinations);
        trainDestinations.forEach(dest => destination.options.add(new Option(dest.name)));
        break;
      case 'Sea':
        hunters[actingHunter].currentLocation.seaConnections
          .forEach(location => destination.options.add(new Option(location.name)));
        if (hunters[actingHunter].currentLocation.type == LocationType.sea) {
          if (game.checkForControlStorms(game.huntersInGroup(hunters[actingHunter]))) {
            updateAllFields();
          };
        }
        break;
      case 'Sense of Emergency':
        game.map.locations.forEach(location => destination.options.add(new Option(location.name)));
        break;
    }
  });
  travelButton.addEventListener('click', () => {
    if (destination.value) {
      clearOptions(destination);
      game.searchWithHunter(hunters[actingHunter]);
    }
    updateAllFields();
  });
  actingHunter = 0;
  updateSelectedHunter();
  updateTrail();
  updateDraculaDetails();
  updateLog();
});
draculaTurnButton.addEventListener('click', () => {
  game.performTimeKeepingPhase();
  updateCatacombs();
  updateDraculaDetails();
  updateAllFields();
  game.performDraculaMovementPhase();
  updateTrail();
  updateCatacombs();
  updateDraculaDetails();
  updateLog();
  game.performDraculaActionPhase();
  updateTrail();
  updateCatacombs();
  updateDraculaDetails();
  updateLog();
});
draculaEvent.addEventListener('click', () => {
  game.giveEventToDracula();
  updateDraculaDetails();
  updateDiscards();
  updateLog();
});
drawItem.addEventListener('click', () => {
  game.giveItemToHunter(itemDeck.value, hunters[actingHunter]);
  updateHunterDetails();
  updateItemDeck();
  updateLog();
});
drawEvent.addEventListener('click', () => {
  game.giveEventToHunter(eventDeck.value, hunters[actingHunter]);
  updateHunterDetails();
  updateEventDeck();
  updateTargetLocation();
  updateLog();
});
discardItem.addEventListener('click', () => {
  if ((hunterDetails[actingHunter].querySelector('#items') as HTMLSelectElement).selectedIndex > -1) {
    game.discardHunterItem((hunterDetails[actingHunter].querySelector('#items') as HTMLSelectElement).value, hunters[actingHunter]);
    updateHunterDetails();
    updateDiscards();
    updateLog();
  }
});
giveItem.addEventListener('click', () => {
  if ((hunterDetails[actingHunter].querySelector('#items') as HTMLSelectElement).selectedIndex > -1 && !game.itemInTrade) {
    game.tradeItemFromHunter((hunterDetails[actingHunter].querySelector('#items') as HTMLSelectElement).value, hunters[actingHunter]);
    updateHunterDetails();
    updateLog();
  }
});
takeItem.addEventListener('click', () => {
  if (game.itemInTrade) {
    game.tradeItemToHunter(hunters[actingHunter]);
    updateHunterDetails();
    updateLog();
  }
});
discardEvent.addEventListener('click', () => {
  if ((hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).selectedIndex > -1) {
    game.discardHunterEvent((hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).value, hunters[actingHunter]);
    updateHunterDetails();
    updateDiscards();
    updateLog();
  }
});
playEvent.addEventListener('click', () => {
  if ((hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).selectedIndex > -1) {
    game.playHunterEvent((hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).value, hunters[actingHunter], locationSelector.value);
    updateHunterDetails();
    updateDiscards();
    updateTargetLocation();
    updateMarkers();
    updateLog();
  }
});

debugGameStateButton.addEventListener('click', () => {
  console.log(game);
});

// set fields to game start state
game.initialiseGameState();
game.log('Hunters set starting locations then press Start button');
updateAllFields();

/**
 * Updates all the fields on the web page
 */
function updateAllFields() {
  updateDraculaDetails();
  updateHunterDetails()
  updateTrail();
  updateCatacombs();
  updateItemDeck();
  updateEventDeck();
  updateDiscards();
  updateMarkers();
  updateMoveMethods();
  updateLog();
}

/**
 * Updates the log field
 */
function updateLog() {
  logBox.value = game.logText;
  logBox.scrollTop = logBox.scrollHeight;
}

/**
 * Updates the values in the fields in the Dracula's Details section
 */
function updateDraculaDetails() {
  draculaBlood.value = game.dracula.blood.toString();
  draculaLocation.value = game.dracula.revealed ? game.dracula.currentLocation.name : 'Hidden';
  draculaAlly.value = game.draculaAlly ? game.draculaAlly.name : '';
  encounterCount.value = game.dracula.encounterHand.length.toString();
  eventCount.value = game.dracula.eventHand.length.toString();
  timePhase.value = timePhaseDescriptions[game.timePhase] || '';
  vampireTrack.value = game.vampireTrack.toString();
  resolveTrack.value = game.resolveTrack.toString();
}

/**
 * Updates the values in the fields in the Hunter Details section
 */
function updateHunterDetails() {
  for (let i = 0; i < 4; i++) {
    (hunterDetails[i].querySelector('#health') as HTMLInputElement).value = hunters[i].health.toString();
    (hunterDetails[i].querySelector('#bites') as HTMLInputElement).value = hunters[i].bites.toString();
    (hunterDetails[i].querySelector('#location') as HTMLInputElement).value = hunters[i].currentLocation.name;
    clearOptions(hunterDetails[i].querySelector('#items') as HTMLSelectElement);
    hunters[i].items.forEach(item => (hunterDetails[i].querySelector('#items') as HTMLSelectElement).options.add(new Option(item.name)));
    if (hunters[i].inCombat) {
      [ItemName.Punch, ItemName.Dodge, ItemName.Escape].forEach(basicAttack => (hunterDetails[i].querySelector('#items') as HTMLSelectElement).options.add(new Option(basicAttack)));
    }
    (hunterDetails[i].querySelector('#items') as HTMLSelectElement).setAttribute('size', hunters[i].items.length.toString());
    clearOptions(hunterDetails[i].querySelector('#events') as HTMLSelectElement);
    hunters[i].events.forEach(event => (hunterDetails[i].querySelector('#events') as HTMLSelectElement).options.add(new Option(event.name)));
    (hunterDetails[i].querySelector('#events') as HTMLSelectElement).setAttribute('size', hunters[i].events.length.toString());
  }
  hunterAlly.value = game.hunterAlly ? game.hunterAlly.name : '';
}

/**
 * Updates the style classes of the Hunter details to show which one is selected
 */
function updateSelectedHunter() {
  hunterDetails.forEach(details => {
    details.classList.remove('selectedHunter');
  });
  hunterDetails[actingHunter].classList.add('selectedHunter');
}

/**
 * Updates the style classes of the Encounters to show which one is selected
 */
function updateSelectedEncounter() {
  trailEncounter.forEach(encounter => {
    encounter.classList.remove('selectedEncounter');
  });
  catacombEncounterA.forEach(encounter => {
    encounter.classList.remove('selectedEncounter');
  });
  catacombEncounterB.forEach(encounter => {
    encounter.classList.remove('selectedEncounter');
  });
  dracula.classList.remove('selectedEncounter');
  ambushEncounter.classList.remove('selectedEncounter');
  if (game.selectedTrailEncounter > -1) {
    trailEncounter[game.selectedTrailEncounter].classList.add('selectedEncounter');
  }
  if (game.selectedCatacombEncounterA > -1) {
    catacombEncounterA[game.selectedCatacombEncounterA].classList.add('selectedEncounter');
  }
  if (game.selectedCatacombEncounterB > -1) {
    catacombEncounterB[game.selectedCatacombEncounterB].classList.add('selectedEncounter');
  }
  if (draculaSelected) {
    dracula.classList.add('selectedEncounter');
  }
  if (game.selectedAmbushEncounter) {
    ambushEncounter.classList.add('selectedEncounter');
  }
}

/**
 * Updates the options and visibility of the locationSelector
 */
function updateTargetLocation() {
  clearOptions(locationSelector);
  if ((hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).value == EventName.ConsecratedGround) {
    game.map.locations.filter(location => location.type == LocationType.smallCity || location.type == LocationType.largeCity)
      .forEach(location => locationSelector.options.add(new Option(location.name)));
  }
  if (locationSelector.options.length > 0) {
    targetLocation.style.removeProperty('display');
  } else {
    targetLocation.style.display = 'none';
  }
}

/**
 * Updates the values in all the fields in the Trail section
 */
function updateTrail() {
  for (let i = 0; i < 6; i++) {
    if (!game.trail[i]) {
      // no trail card, blank all fields
      blank(trailLocation[i]);
      blank(trailEncounter[i]);
      blank(trailPower[i]);
    } else {
      // if there is a location card here, show it
      if (game.trail[i].location) {
        showTrailLocation(i, game.trail[i]);
      } else {
        blank(trailLocation[i]);
      }
      // if there is an encounter here, show it
      if (game.trail[i].encounter) {
        showTrailEncounter(i, game.trail[i]);
      } else {
        blank(trailEncounter[i]);
      }
      // Hide complicates what to show
      if (game.trail[i].power) {
        if (game.trail[i].power.name.match(/Hide/)) {
          // if the card is revealed, blank the location and show the power as normal          
          if (game.trail[i].revealed) {
            blank(trailLocation[i]);
            trailPower[i].value = game.trail[i].power.name;
            // otherwise show the combined power name, if applicable, and a secret "Land" card
          } else {
            trailLocation[i].value = 'Land';
            const comboIndex = game.trail[i].power.name.indexOf(' and Hide');
            trailPower[i].value = comboIndex > -1 ? game.trail[i].power.name.slice(0, game.trail[i].power.name.indexOf(' and Hide')) : '';
          }
        } else {
          trailPower[i].value = game.trail[i].power.name;
        }
      } else {
        blank(trailPower[i]);
      }
    }
  }
  ambushEncounter.value = game.dracula.ambushEncounter ? game.dracula.ambushEncounter.name : '';
}

/**
 * Updates all the values in the fields in the Catacombs section
 */
function updateCatacombs() {
  for (let i = 0; i < 3; i++) {
    if (!game.catacombs[i]) {
      blank(catacombLocation[i]);
      blank(catacombEncounterA[i]);
      blank(catacombEncounterB[i]);
    } else {
      if (game.catacombs[i].location) {
        showCatacombLocation(i, game.catacombs[i]);
      } else {
        blank(catacombLocation[i]);
      }
      if (game.catacombs[i].encounter) {
        showCatacombEncounter(i, game.catacombs[i], 0);
      } else {
        blank(catacombEncounterA[i]);
      }
      if (game.catacombs[i].catacombEncounter) {
        showCatacombEncounter(i, game.catacombs[i], 1);
      } else {
        blank(catacombEncounterB[i]);
      }
    }
  }
}

/**
 * Updates the values in the moveMethod field
 */
function updateMoveMethods() {
  clearOptions(destination);
  if (moveMethod.options.length == 0 || moveMethod.options[0].text !== 'Start Location') {
    clearOptions(moveMethod);
    if (hunters[actingHunter].encounterTiles.find(encounter => encounter.name == EncounterName.Fog)) {
      moveMethod.options.add(new Option(EncounterName.Fog));
    } else if (hunters[actingHunter].encounterTiles.find(encounter => encounter.name == EncounterName.Bats)) {
      moveMethod.options.add(new Option(EncounterName.Bats));
    } else {
      moveMethod.options.add(new Option('No travel'));
      if (hunters[actingHunter].currentLocation.roadConnections.length > 0) {
        moveMethod.options.add(new Option('Road'));
      }
      if (hunters[actingHunter].currentLocation.trainConnections.length > 0) {
        moveMethod.options.add(new Option('Train'));
      }
      if (hunters[actingHunter].currentLocation.seaConnections.length > 0) {
        moveMethod.options.add(new Option('Sea'));
      }
      if (game.resolveTrack > 0 && hunters[actingHunter].health > (6 - game.vampireTrack)) {
        moveMethod.options.add(new Option('Sense of Emergency'));
      }
    }
  } else {
    game.map.locations.filter(location => location.type == LocationType.largeCity || location.type == LocationType.smallCity).forEach(location => {
      destination.options.add(new Option(location.name));
    });
  }
}

/**
 * Updates the options in the Item deck field
 */
function updateItemDeck() {
  clearOptions(itemDeck);
  _.uniq(game.itemDeck.map(item => item.name)).sort().forEach(item => itemDeck.options.add(new Option(item)));
}

/**
 * Updates the options in the Event deck field
 */
function updateEventDeck() {
  clearOptions(eventDeck);
  _.uniq(game.eventDeck.filter(event => !event.draculaCard).map(event => event.name)).sort().forEach(event => eventDeck.options.add(new Option(event)));
}

/**
 * Updates the values in the fields in the Discards section
 */
function updateDiscards() {
  clearOptions(itemDiscard);
  game.itemDiscard.forEach(item => itemDiscard.options.add(new Option(item.name)));
  itemDiscard.selectedIndex = itemDiscard.options.length - 1;
  clearOptions(eventDiscard);
  game.eventDiscard.forEach(event => eventDiscard.options.add(new Option(event.name)));
  eventDiscard.selectedIndex = eventDiscard.options.length - 1;
}

/**
 * Updates the marker related field values
 */
function updateMarkers() {
  consecratedGround.value = game.consecratedLocation ? game.consecratedLocation.name : '';
}

/**
 * Shows either the face or back of a Location type trail card
 * @param index The position of the trail card
 * @param trailCard The trail card to show
 */
function showTrailLocation(index: number, trailCard: TrailCard) {
  if (trailCard.revealed) {
    showTrailLocationFace(index, trailCard.location);
  } else {
    showTrailLocationBack(index, trailCard.location);
  }
}

/**
 * Shows either the face or the back of an Encounter tile on a trail card
 * @param index The position of the Encounter
 * @param trailCard The trail card which holds the Encounter
 */
function showTrailEncounter(index: number, trailCard: TrailCard) {
  if (trailCard.encounter.revealed) {
    showTrailEncounterFace(index, trailCard.encounter);
  } else {
    showTrailEncounterBack(index);
  }
}

/**
 * Shows the face of a Location type trail card
 * @param index The position of the trail card
 * @param location The Location to show
 */
function showTrailLocationFace(index: number, location: Location) {
  trailLocation[index].value = location.name;
}

/**
 * Shows the back of a Location type trail card
 * @param index The position of the trail card
 * @param location The Location to show
 */
function showTrailLocationBack(index: number, location: Location) {
  trailLocation[index].value = location.type == LocationType.sea ? 'Sea' : 'Land';
}

/**
 * Shows the face of an Encounter tile in the trail
 * @param index The position of the trail card
 * @param encounter The Encounter to show
 */
function showTrailEncounterFace(index: number, encounter: Encounter) {
  trailEncounter[index].value = encounter.name;
}

/**
 * Shows the back of an Encounter tile in the trail
 * @param index The Position of the trail card
 */
function showTrailEncounterBack(index: number) {
  trailEncounter[index].value = 'Encounter';
}

/**
 * Shows either the face or back of a catacomb card
 * @param index The position of the catacomb card
 * @param catacombCard The catacomb card to show
 */
function showCatacombLocation(index: number, catacombCard: TrailCard) {
  if (catacombCard.revealed) {
    showCatacombLocationFace(index, catacombCard.location);
  } else {
    showCatacombLocationBack(index);
  }
}

/**
 * Shows either the face or the back of an Encounter tile on a catacomb card
 * @param index The position of the Encounter
 * @param catacombCard The catacomb card which holds the Encounter
 * @param position The position of the catacomb Encounter, 0 is the normal encounter position, 1 is the catacomb encounter position
 */
function showCatacombEncounter(index: number, catacombCard: TrailCard, position: number) {
  if (position == 0) {
    if (catacombCard.encounter.revealed) {
      showCatacombEncounterFace(index, catacombCard.encounter, position);
    } else {
      showCatacombEncounterBack(index, position);
    }
  } else {
    if (catacombCard.catacombEncounter.revealed) {
      showCatacombEncounterFace(index, catacombCard.catacombEncounter, position);
    } else {
      showCatacombEncounterBack(index, position);
    }
  }
}

/**
 * Shows the face of a catacomb card
 * @param index The position of the catacomb card
 * @param location The Location to show
 */
function showCatacombLocationFace(index: number, location: Location) {
  catacombLocation[index].value = location.name;
}

/**
 * Shows the back of a catacomb card
 * @param index The position of the catacomb card
 */
function showCatacombLocationBack(index: number) {
  catacombLocation[index].value = 'Land';
}

/**
 * Shows the face of an Encounter tile on a catacomb card
 * @param index The position of the trail card
 * @param encounter The Encounter to show
 * @param position The position of the catacomb Encounter, 0 is the normal encounter position, 1 is the catacomb encounter position
 */
function showCatacombEncounterFace(index: number, encounter: Encounter, position: number) {
  if (position == 0) {
    catacombEncounterA[index].value = encounter.name;
  } else {
    catacombEncounterB[index].value = encounter.name;
  }
}

/**
 * Shows the back of an Encounter tile in the trail
 * @param index The Position of the trail card
 * @param position The position of the catacomb Encounter, 0 is the normal encounter position, 1 is the catacomb encounter position
 */
function showCatacombEncounterBack(index: number, position: number) {
  if (position == 0) {
    catacombEncounterA[index].value = 'Encounter';
  } else {
    catacombEncounterB[index].value = 'Encounter';
  }
}

/**
 * Clears the value of an element
 * @param element The element to clear
 */
function blank(element: HTMLInputElement) {
  element.value = '';
}

/**
 * Clears the options from a select element
 * @param element The select element to clear
 */
function clearOptions(element: HTMLSelectElement) {
  for (let i = element.options.length - 1; i >= 0; i--) {
    element.options.remove(i);
  }
}

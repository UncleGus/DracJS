import * as _ from 'lodash';
import { Game } from './game';
import { LocationType, Location, TravelMethod } from './map';
import { TrailCard } from './dracula';
import { Encounter, EncounterName } from './encounter';
import { EventName } from './event';
import { Hunter } from './hunter';
import { ItemName } from './item';

const game = new Game();

// get webpage components

// trail
const trailLocation: HTMLInputElement[] = [];
const trailEncounter: HTMLInputElement[] = [];
const trailPower: HTMLInputElement[] = [];
for (let i = 0; i < 6; i++) {
  trailLocation.push(document.getElementById(`trail${i}`) as HTMLInputElement);
  trailEncounter.push(document.getElementById(`encounter${i}`) as HTMLInputElement);
  trailEncounter.push(document.getElementById(`power${i}`) as HTMLInputElement);
}

// catacombs
const catacombLocation: HTMLInputElement[] = [];
const catacombEncounterA: HTMLInputElement[] = [];
const catacombEncounterB: HTMLInputElement[] = [];
for (let i = 0; i < 6; i++) {
  catacombLocation.push(document.getElementById(`catacombLocation${i}`) as HTMLInputElement);
  catacombEncounterA.push(document.getElementById(`catacombEncounter${i}A`) as HTMLInputElement);
  catacombEncounterB.push(document.getElementById(`catacombEncounter${i}B`) as HTMLInputElement);
}

// Dracula
const dracula = document.getElementById('dracula');
const draculaBlood = document.getElementById('draculaBlood') as HTMLInputElement;
const draculaLocation = document.getElementById('draculaLocation') as HTMLInputElement;
const eventCount = document.getElementById('eventCount') as HTMLInputElement;
const encounterCount = document.getElementById('encounterCount') as HTMLInputElement;
const draculaAlly = document.getElementById('draculaAlly') as HTMLInputElement;
const draculaTurnButton = document.getElementById('draculaTurn');

// track
const timePhase = document.getElementById('timePhase') as HTMLInputElement;
const vampireTrack = document.getElementById('vampireTrack') as HTMLInputElement;
const resolveTrack = document.getElementById('resolveTrack') as HTMLInputElement;
// TODO: need some way to trigger Newspaper Reports from resolve and not have it blocked

// hunters
const godalming = document.getElementById('godalming');
const seward = document.getElementById('seward');
const vanHelsing = document.getElementById('vanHelsing');
const mina = document.getElementById('mina');
const hunterAlly = document.getElementById('hunterAlly') as HTMLInputElement;

// movement
const moveMethod = document.getElementById('moveMethod') as HTMLSelectElement;
const destination = document.getElementById('destination') as HTMLSelectElement;
const travelButton = document.getElementById('travel');

// action
const eventDeck = document.getElementById('eventDeck') as HTMLSelectElement;
const drawEvent = document.getElementById('hunterEvent');
const draculaEvent = document.getElementById('draculaEvent');
const itemDeck = document.getElementById('itemDeck') as HTMLSelectElement;
const drawItem = document.getElementById('drawItem');
const discardItem = document.getElementById('discardItem');
const giveItem = document.getElementById('giveItem');  // TODO: convert these to one button
const takeItem = document.getElementById('takeItem');  // and change their action based on if there is an item being traded

// discards
const itemDiscard = document.getElementById('itemDiscard') as HTMLSelectElement;
const eventDiscard = document.getElementById('eventDiscard') as HTMLSelectElement;
const retrieveItem = document.getElementById('retrieveItem');
// TODO: need retrieve event as well

// events
const discardEvent = document.getElementById('discardEvent');
const playEvent = document.getElementById('playEvent');
const approvalButton = document.getElementById('approval');
const targetLocation = document.getElementById('targetLocation');  // TODO: rename/tidy these
const locationSelector1 = document.getElementById('locationSelector1') as HTMLSelectElement; // these
const locationSelector2 = document.getElementById('locationSelector2') as HTMLSelectElement; // these
const hiredScouts = document.getElementById('hiredScouts'); // these
// TODO: need a selector for stormy seas

// encounters
const resolveEncounter = document.getElementById('resolveEncounter');
const discardEncounter = document.getElementById('discardEncounter');
const ambushEncounter = document.getElementById('ambushEncounter') as HTMLInputElement;

// combat
const fight = document.getElementById('fight');
const hunterWin = document.getElementById('hunterWin');
const enemyWin = document.getElementById('enemyWin');

// markers
const consecratedGround = document.getElementById('consecratedGround') as HTMLSelectElement;
const roadblock = document.getElementById('roadblock') as HTMLInputElement;
// TODO: need Heavenly Host as well and a way to use them, use item button, for dogs and holy water as well?

// miscellaneous
const logBox = document.getElementById('logBox') as HTMLInputElement;
const debugGameStateButton = document.getElementById('debugGameState');

// sundry: fate to be determined
const startButton = document.getElementById('startButton');  // TODO: repurpose dracula turn button for this
const newspaperReportsButton = document.getElementById('newspaperReports');
const sendScouts = document.getElementById('sendScouts');

// variables
const hunters = [game.godalming, game.seward, game.vanHelsing, game.mina];
const hunterDetails = [godalming, seward, vanHelsing, mina];
const timePhaseDescriptions = ['Dawn', 'Noon', 'Dusk', 'Twilight', 'Midnight', 'Small Hours'];
let draculaSelected = false;
let draculaAllySelected = false;
let roadBlockSelected = false;
let selectedEncounterName = '';
let actingHunter = 0;

// wire up webpage components

// trail
for (let i = 0; i < 6; i++) {
  trailEncounter[i].addEventListener('click', () => {
    game.selectedTrailEncounter = i;
    game.selectedCatacombEncounterA = -1;
    game.selectedCatacombEncounterB = -1;
    draculaSelected = false;
    draculaAllySelected = false;
    roadBlockSelected = false;
    game.selectedAmbushEncounter = false;
    selectedEncounterName = trailEncounter[i].value;
    updateSelectedEncounter();
  });
}

// catacombs
for (let i = 0; i < 3; i++) {
  catacombEncounterA[i].addEventListener('click', () => {
    game.selectedTrailEncounter = -1;
    game.selectedCatacombEncounterA = i;
    game.selectedCatacombEncounterB = -1;
    draculaSelected = false;
    draculaAllySelected = false;
    roadBlockSelected = false;
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

// Dracula
dracula.addEventListener('click', () => {
  game.selectedTrailEncounter = -1;
  game.selectedCatacombEncounterA = -1;
  game.selectedCatacombEncounterB = -1;
  draculaSelected = true;
  draculaAllySelected = false;
  roadBlockSelected = false;
  game.selectedAmbushEncounter = false;
  selectedEncounterName = EncounterName.Dracula;
  updateSelectedEncounter();
});
draculaBlood.addEventListener('change', () => {
  game.setDraculaBlood(parseInt(draculaBlood.value));
  updateDracula();
  updateLog();
});
draculaAlly.addEventListener('click', () => {
  game.selectedTrailEncounter = -1;
  game.selectedCatacombEncounterA = -1;
  game.selectedCatacombEncounterB = -1;
  draculaSelected = false;
  draculaAllySelected = true;
  roadBlockSelected = false;
  game.selectedAmbushEncounter = false;
  selectedEncounterName = ambushEncounter.value;
  updateSelectedEncounter();
});
draculaTurnButton.addEventListener('click', () => {
  switch (draculaTurnButton.textContent) {
    case 'Perform Timekeeping phase':
      game.draculaChooseStartOfTurnEvent();
      if (game.dracula.eventAwaitingApproval) {
        updateAllFields();
        return;
      }
      draculaTurnButton.textContent = 'Perform Movement phase';
      game.performDraculaTimeKeepingPhase();
      updateAllFields();
      break;
    case 'Perform Movement phase':
      game.draculaChooseStartOfMovementEvent();
      if (game.dracula.eventAwaitingApproval) {
        updateAllFields();
        return;
      }
      draculaTurnButton.textContent = 'Perform Action phase';
      game.performDraculaMovementPhase();
      updateAllFields();
      break;
    case 'Perform Action phase':
      game.draculaPlaysStartOfActionEvent();
      if (game.dracula.eventAwaitingApproval) {
        updateAllFields();
        return;
      }
      draculaTurnButton.textContent = 'Perform Timekeeping phase';
      game.performDraculaActionPhase();
      updateAllFields();
      break;
  }
});

// track
vampireTrack.addEventListener('change', () => {
  game.setVampireTrack(parseInt(vampireTrack.value));
  updateDracula();
  updateLog();
});
resolveTrack.addEventListener('change', () => {
  game.setResolveTrack(parseInt(resolveTrack.value));
  updateDracula();
  updateLog();
});
// TODO: wire up Timephase as well

// hunters
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
    updateHunter();
    updateLog();
  });
  hunterDetails[i].querySelector('#bites').addEventListener('change', () => {
    game.setHunterBites(hunters[i], parseInt((hunterDetails[i].querySelector('#bites') as HTMLInputElement).value));
    updateHunter();
    updateLog();
  });
}

// movement
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
  } else if (moveMethod.value == TravelMethod.train && game.draculaPlaysFalseTipoff(game.huntersInGroup(hunters[actingHunter]))) {

  } else if (destination.value) {
    moveMethod.selectedIndex = 0;
    game.setHunterLocation(hunters[actingHunter], destination.value);
    if (moveMethod.value == TravelMethod.start) {
      actingHunter = Math.min(actingHunter + 1, 3);
      updateSelectedHunter();
    }
    if (moveMethod.value == TravelMethod.senseOfEmergency) {
      game.resolveTrack--;
      updateDracula();
    }
    updateHunter();
    updateLog();
  }
});

// action
drawEvent.addEventListener('click', () => {
  game.giveEventToHunter(eventDeck.value, hunters[actingHunter]);
  updateHunter();
  updateEventDeck();
  updateTargetLocation();
  updateLog();
});
draculaEvent.addEventListener('click', () => {
  if (game.dracula.eventAwaitingApproval) {
    updateAllFields();
    return;
  }
  game.giveEventToDracula();
  updateDracula();
  updateDiscards();
  updateLog();
});
drawItem.addEventListener('click', () => {
  game.giveItemToHunter(itemDeck.value, hunters[actingHunter]);
  updateHunter();
  updateItemDeck();
  updateLog();
});
discardItem.addEventListener('click', () => {
  if ((hunterDetails[actingHunter].querySelector('#items') as HTMLSelectElement).selectedIndex > -1) {
    game.discardHunterItem((hunterDetails[actingHunter].querySelector('#items') as HTMLSelectElement).value, hunters[actingHunter]);
    updateHunter();
    updateDiscards();
    updateLog();
  }
});
giveItem.addEventListener('click', () => {
  if ((hunterDetails[actingHunter].querySelector('#items') as HTMLSelectElement).selectedIndex > -1 && !game.itemInTrade) {
    game.tradeItemFromHunter((hunterDetails[actingHunter].querySelector('#items') as HTMLSelectElement).value, hunters[actingHunter]);
    updateHunter();
    updateLog();
  }
});
takeItem.addEventListener('click', () => {
  if (game.itemInTrade) {
    game.tradeItemToHunter(hunters[actingHunter]);
    updateHunter();
    updateLog();
  }
});

// discards
retrieveItem.addEventListener('click', () => {
  game.retrieveItemForHunter(itemDiscard.value, hunters[actingHunter]);
  updateHunter();
  updateItemDeck();
  updateLog();
});

// events
discardEvent.addEventListener('click', () => {
  if (draculaAllySelected && draculaAlly.value !== '') {
    game.discardDraculaAlly();
    updateHunter();
    updateDiscards();
    updateLog();
  } else if ((hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).selectedIndex > -1) {
    game.discardHunterEvent((hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).value, hunters[actingHunter]);
    updateHunter();
    updateDiscards();
    updateLog();
  }
});
playEvent.addEventListener('click', () => {
  if ((hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).selectedIndex > -1) {
    if (game.dracula.eventAwaitingApproval && !((hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).value == EventName.GoodLuck
      || (hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).value == EventName.CharteredCarriage)) {
      return;
    }
    game.playHunterEvent((hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).value, hunters[actingHunter], [locationSelector1.value, locationSelector2.value], draculaAllySelected, roadBlockSelected);
    updateAllFields();
  }
});
approvalButton.addEventListener('click', () => {
  if (game.dracula.eventAwaitingApproval) {
    game.resolveApprovedEvent();
    updateAllFields()
  }
});

// encounters
resolveEncounter.addEventListener('click', () => {
  game.resolveEncounter(selectedEncounterName, hunters[actingHunter]);
  updateAllFields();
});
discardEncounter.addEventListener('click', () => {
  game.discardEncounter(selectedEncounterName);
  updateAllFields();
});
ambushEncounter.addEventListener('click', () => {
  game.selectedTrailEncounter = -1;
  game.selectedCatacombEncounterA = -1;
  game.selectedCatacombEncounterB = -1;
  draculaSelected = false;
  draculaAllySelected = false;
  roadBlockSelected = false;
  game.selectedAmbushEncounter = true;
  selectedEncounterName = ambushEncounter.value;
  updateSelectedEncounter();
});


// combat
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
  updateAllFields();
});
hunterWin.addEventListener('click', () => {
  game.applyHunterAttackSuccess(hunters[actingHunter].lastUsedCombatItem);
  updateAllFields();
});
enemyWin.addEventListener('click', () => {
  game.applyEnemyAttackSuccess()
  updateAllFields();
});

// markers

// miscellaneous
debugGameStateButton.addEventListener('click', () => {
  console.log(game);
});

// sundry
// newspaperReportsButton.addEventListener('click', () => {
//   game.resolveNewspaperReports(true);
//   updateAllFields();
// });
// sendScouts.addEventListener('click', () => {
//   game.resolveHiredScouts([(hiredScouts.querySelector('#location1') as HTMLSelectElement).value, (hiredScouts.querySelector('#location2') as HTMLSelectElement).value]);
// });
consecratedGround.options.add(new Option('Nowhere'));
game.map.locations.filter(location => location.type == LocationType.smallCity || location.type == LocationType.largeCity)
  .map(city => city.name).sort().forEach(city => consecratedGround.options.add(new Option(city)));
consecratedGround.addEventListener('change', () => {
  if (consecratedGround.selectedIndex > 0) {
    game.consecratedLocation = game.map.getLocationByName(consecratedGround.value);
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
      updateMovement();
    });
  }
  clearOptions(moveMethod);
  updateMovement();
  moveMethod.addEventListener('change', () => {
    clearOptions(destination);
    switch (moveMethod.value) {
      case TravelMethod.road:
        hunters[actingHunter].currentLocation.roadConnections
          .forEach(location => destination.options.add(new Option(location.name)));
        break;
      case TravelMethod.train:
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
      case TravelMethod.sea:
        hunters[actingHunter].currentLocation.seaConnections
          .forEach(location => destination.options.add(new Option(location.name)));
        if (hunters[actingHunter].currentLocation.type == LocationType.sea) {
          if (game.draculaChooseControlStormsDestination(game.huntersInGroup(hunters[actingHunter]))) {
            updateAllFields();
          };
        }
        break;
      case TravelMethod.senseOfEmergency:
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
  updateDracula();
  updateLog();
});

// set fields to game start state
game.initialiseGameState();
game.log('Hunters set starting locations then press Start button');
updateAllFields();

/**
 * Updates all the fields on the web page
 */
function updateAllFields() {
  updateTrail();
  updateCatacombs();
  updateDracula();
  updateTrack();
  updateHunter()
  updateMovement();
  updateEventDeck();
  updateItemDeck();
  updateDiscards();
  updateEvents();
  updateEncounters();
  updateCombat();
  updateMarkers();
  updateLog();
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
 * Updates the values in the fields in the Dracula's Details section
 */
function updateDracula() {
  draculaBlood.value = game.dracula.blood.toString();
  draculaLocation.value = game.dracula.revealed ? game.dracula.currentLocation.name : 'Hidden';
  draculaAlly.value = game.draculaAlly ? game.draculaAlly.name : '';
  encounterCount.value = game.dracula.encounterHand.length.toString();
  eventCount.value = game.dracula.eventHand.length.toString();
}

/**
 * Updates the values in the fields in the Track section
 */
function updateTrack() {
  timePhase.value = timePhaseDescriptions[game.timePhase] || '';
  vampireTrack.value = game.vampireTrack.toString();
  resolveTrack.value = game.resolveTrack.toString();
}

/**
 * Updates the values in the fields in the Hunter Details section
 */
function updateHunter() {
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
 * Updates the values in the moveMethod field
 */
function updateMovement() {
  clearOptions(destination);
  if (moveMethod.options.length == 0 || moveMethod.options[0].text !== 'Start Location') {
    clearOptions(moveMethod);
    if (hunters[actingHunter].encounterTiles.find(encounter => encounter.name == EncounterName.Fog)) {
      moveMethod.options.add(new Option(EncounterName.Fog));
    } else if (hunters[actingHunter].encounterTiles.find(encounter => encounter.name == EncounterName.Bats)) {
      moveMethod.options.add(new Option(EncounterName.Bats));
    } else {
      moveMethod.options.add(new Option(TravelMethod.noTravel));
      if (hunters[actingHunter].currentLocation.roadConnections.length > 0) {
        moveMethod.options.add(new Option(TravelMethod.road));
      }
      if (hunters[actingHunter].currentLocation.trainConnections.length > 0) {
        moveMethod.options.add(new Option(TravelMethod.train));
      }
      if (hunters[actingHunter].currentLocation.seaConnections.length > 0) {
        moveMethod.options.add(new Option(TravelMethod.sea));
      }
      if (game.resolveTrack > 0 && hunters[actingHunter].health > (6 - game.vampireTrack)) {
        moveMethod.options.add(new Option(TravelMethod.senseOfEmergency));
      }
    }
  } else {
    game.map.locations.filter(location => location.type == LocationType.largeCity || location.type == LocationType.smallCity).forEach(location => {
      destination.options.add(new Option(location.name));
    });
  }
}

/**
 * Updates the options in the Event deck field
 */
function updateEventDeck() {
  clearOptions(eventDeck);
  _.uniq(game.eventDeck.filter(event => !event.draculaCard).map(event => event.name)).sort().forEach(event => eventDeck.options.add(new Option(event)));
}

/**
 * Updates the options in the Item deck field
 */
function updateItemDeck() {
  clearOptions(itemDeck);
  _.uniq(game.itemDeck.map(item => item.name)).sort().forEach(item => itemDeck.options.add(new Option(item)));
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
 * Updates the Event related buttons in the Events section
 */
function updateEvents() {
  // TODO: all of this, and create the Events section
}

/**
 * Updates the visibility of Encounter related buttons and fields
 */
function updateEncounters() {
  // TODO: all of this
}

/**
 * Updates the visibility of combat buttons
 */
function updateCombat() {
  // TODO: all of this, and create a variable to track combat state
}

/**
 * Updates the marker related field values
 */
function updateMarkers() {
  // TODO: move some of this to event related stuff
  consecratedGround.value = game.consecratedLocation ? game.consecratedLocation.name : '';
  roadblock.value = game.roadBlock.length > 0 ? `${game.roadBlock[0]} <==> ${game.roadBlock[1]}` : '';
  if (game.hiredScoutsInEffect) {
    hiredScouts.style.display = null;
    const location1 = (hiredScouts.querySelector('#location1') as HTMLSelectElement);
    const location2 = (hiredScouts.querySelector('#location2') as HTMLSelectElement);
    clearOptions(location1);
    clearOptions(location2);
    game.map.locations.forEach(location => {
      location1.options.add(new Option(location.name));
      location2.options.add(new Option(location.name));
    });
  } else {
    hiredScouts.style.display = 'none';
  }
}

/**
 * Updates the log field
 */
function updateLog() {
  logBox.value = game.logText;
  logBox.scrollTop = logBox.scrollHeight;
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
  draculaAlly.classList.remove('selectedEncounter');
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
  if (draculaAllySelected) {
    draculaAlly.classList.add('selectedEncounter');
  }
  if (game.selectedAmbushEncounter) {
    ambushEncounter.classList.add('selectedEncounter');
  }
}

/**
 * Updates the options and visibility of the locationSelector
 */
function updateTargetLocation() {
  // TODO: move this wherever appropriate
  [locationSelector1, locationSelector2].forEach(locationSelector => {
    clearOptions(locationSelector);
    if ((hunterDetails[actingHunter].querySelector('#events') as HTMLSelectElement).value == EventName.HiredScouts) {
      game.map.locations.filter(location => location.type == LocationType.smallCity || location.type == LocationType.largeCity)
        .forEach(location => locationSelector.options.add(new Option(location.name)));
    }
    if (locationSelector.options.length > 0) {
      targetLocation.style.removeProperty('display');
    } else {
      targetLocation.style.display = 'none';
    }
  });
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

import * as _ from 'lodash';
import { Game } from "./game";
import { LocationType, Location } from "./map";
import { TrailCard } from "./dracula";
import { Encounter } from "./encounter";

const game = new Game();

// get webpage components
const logBox = document.getElementById('logBox') as HTMLInputElement;
const draculaBlood = document.getElementById('draculaBlood') as HTMLInputElement;
const draculaLocation = document.getElementById('draculaLocation') as HTMLInputElement;
const encounterCount = document.getElementById('encounterCount') as HTMLInputElement;
const godalmingHealth = document.getElementById('godalmingHealth') as HTMLInputElement;
const godalmingLocation = document.getElementById('godalmingLocation') as HTMLInputElement;
const godalmingItems = document.getElementById('godalmingItems') as HTMLSelectElement;
const sewardHealth = document.getElementById('sewardHealth') as HTMLInputElement;
const sewardLocation = document.getElementById('sewardLocation') as HTMLInputElement;
const sewardItems = document.getElementById('sewardItems') as HTMLSelectElement;
const vanHelsingHealth = document.getElementById('vanHelsingHealth') as HTMLInputElement;
const vanHelsingLocation = document.getElementById('vanHelsingLocation') as HTMLInputElement;
const vanHelsingItems = document.getElementById('vanHelsingItems') as HTMLSelectElement;
const minaHealth = document.getElementById('minaHealth') as HTMLInputElement;
const minaLocation = document.getElementById('minaLocation') as HTMLInputElement;
const minaItems = document.getElementById('minaItems') as HTMLSelectElement;
const actingHunter = document.getElementById('actingHunter') as HTMLSelectElement;
const moveMethod = document.getElementById('moveMethod') as HTMLSelectElement;
const destination = document.getElementById('destination') as HTMLSelectElement;
const travelButton = document.getElementById('travel');
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

const timePhase = document.getElementById('timePhase') as HTMLInputElement;
const vampireTrack = document.getElementById('vampireTrack') as HTMLInputElement;
const resolveTrack = document.getElementById('resolveTrack') as HTMLInputElement;
const startButton = document.getElementById('startButton');
const draculaTurnButton = document.getElementById('draculaTurn');
const debugGameStateButton = document.getElementById('debugGameState');

const timePhaseDescriptions = ['Dawn', 'Noon', 'Dusk', 'Twilight', 'Midnight', 'Small Hours'];

// wire up webpage components
draculaBlood.addEventListener('change', () => {
  game.setDraculaBlood(parseInt(draculaBlood.value));
  updateAllFields();
});
game.map.locations.filter(location => location.type == LocationType.largeCity || location.type == LocationType.smallCity).forEach(location => {
  destination.options.add(new Option(location.name));
});
travelButton.addEventListener('click', () => {
  moveMethod.selectedIndex = 0;
  switch (actingHunter.selectedIndex) {
    case 0:
      game.setHunterLocation(game.godalming, game.map.getLocationByName(destination.value));
      break;
    case 1:
      game.setHunterLocation(game.seward, game.map.getLocationByName(destination.value));
      break;
    case 2:
      game.setHunterLocation(game.vanHelsing, game.map.getLocationByName(destination.value));
      break;
    case 3:
      game.setHunterLocation(game.mina, game.map.getLocationByName(destination.value));
      break;
  }
  if (moveMethod.value == 'Start Location') {
    actingHunter.selectedIndex = Math.min(actingHunter.selectedIndex + 1, 3);
  }
  updateAllFields();
});
godalmingHealth.addEventListener('change', () => {
  game.setHunterHealth(game.godalming, parseInt(godalmingHealth.value));
  updateAllFields();
});
sewardHealth.addEventListener('change', () => {
  game.setHunterHealth(game.seward, parseInt(sewardHealth.value));
  updateAllFields();
});
vanHelsingHealth.addEventListener('change', () => {
  game.setHunterHealth(game.vanHelsing, parseInt(vanHelsingHealth.value));
  updateAllFields();
});
minaHealth.addEventListener('change', () => {
  game.setHunterHealth(game.mina, parseInt(minaHealth.value));
  updateAllFields();
});
startButton.addEventListener('click', () => {
  startButton.parentNode.removeChild(startButton);
  game.startGame();
  draculaTurnButton.style.visibility = null;
  clearOptions(destination);
  moveMethod.options.remove(0);
  moveMethod.options.add(new Option('No travel'));
  moveMethod.options.add(new Option('Road'));
  moveMethod.options.add(new Option('Train'));
  moveMethod.options.add(new Option('Sea'));
  moveMethod.addEventListener('change', () => {
    const hunters = [game.godalming, game.seward, game.vanHelsing, game.mina];
    switch (moveMethod.selectedIndex) {
      case 1:
        clearOptions(destination);
        hunters[actingHunter.selectedIndex].currentLocation.roadConnections.map(road => game.map.getLocationByName(road))
          .forEach(location => destination.options.add(new Option(location.name)));
        break;
      case 2:
        clearOptions(destination);
        let trainDestinations: Location[] = [hunters[actingHunter.selectedIndex].currentLocation];
        for (let i = 0; i < 3; i++) {
          let newDestinations: Location[] = [];
          trainDestinations.forEach(location => {
            const locationsConnectedByTrain = location.trainConnections.map(train => game.map.getLocationByName(train));
            newDestinations = newDestinations.concat(locationsConnectedByTrain);
          });
          trainDestinations = trainDestinations.concat(newDestinations);
        }
        trainDestinations = _.uniq(trainDestinations);
        trainDestinations.forEach(dest => destination.options.add(new Option(dest.name)));
        break;
      case 3:
        clearOptions(destination);
        hunters[actingHunter.selectedIndex].currentLocation.seaConnections.map(sea => game.map.getLocationByName(sea))
          .forEach(location => destination.options.add(new Option(location.name)));
        break;
    }
  });
  travelButton.addEventListener('click', () => {
    clearOptions(destination);
  });
  actingHunter.selectedIndex = 0;
  updateAllFields();
});
draculaTurnButton.addEventListener('click', () => {
  game.performTimeKeepingPhase();
  updateAllFields();
  game.performDraculaMovementPhase();
  updateAllFields();
  game.performDraculaActionPhase();
  updateAllFields();
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
  logBox.value = game.logText;
  logBox.scrollTop = logBox.scrollHeight;
  draculaBlood.value = game.dracula.blood.toString();
  draculaLocation.value = game.dracula.revealed ? game.dracula.currentLocation.name : 'Hidden';
  godalmingHealth.value = game.godalming.health.toString();
  godalmingLocation.value = game.godalming.currentLocation.name;
  sewardHealth.value = game.seward.health.toString();
  sewardLocation.value = game.seward.currentLocation.name;
  vanHelsingHealth.value = game.vanHelsing.health.toString();
  vanHelsingLocation.value = game.vanHelsing.currentLocation.name;
  minaHealth.value = game.mina.health.toString();
  minaLocation.value = game.mina.currentLocation.name;
  encounterCount.value = game.dracula.encounterHand.length.toString();
  timePhase.value = timePhaseDescriptions[game.timePhase] || '';
  vampireTrack.value = game.vampireTrack.toString();
  resolveTrack.value = game.resolveTrack.toString();

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

  clearOptions(godalmingItems);
  game.godalming.items.forEach(item => godalmingItems.options.add(new Option(item.name)));
  godalmingItems.setAttribute('size', game.godalming.items.length.toString());
  clearOptions(sewardItems);
  game.seward.items.forEach(item => sewardItems.options.add(new Option(item.name)));
  sewardItems.setAttribute('size', game.seward.items.length.toString());
  clearOptions(vanHelsingItems);
  game.vanHelsing.items.forEach(item => vanHelsingItems.options.add(new Option(item.name)));
  vanHelsingItems.setAttribute('size', game.vanHelsing.items.length.toString());
  clearOptions(minaItems);
  game.mina.items.forEach(item => minaItems.options.add(new Option(item.name)));
  minaItems.setAttribute('size', game.mina.items.length.toString());
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
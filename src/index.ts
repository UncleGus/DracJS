import { Game } from "./game";
import { LocationType } from "./map";

const game = new Game();

// get webpage components
const logBox = document.getElementById('logBox') as HTMLInputElement;
const draculaBlood = document.getElementById('draculaBlood') as HTMLInputElement;
const draculaLocation = document.getElementById('draculaLocation') as HTMLInputElement;
const encounterCount = document.getElementById('encounterCount') as HTMLInputElement;
const godalmingHealth = document.getElementById('godalmingHealth') as HTMLInputElement;
const sewardHealth = document.getElementById('sewardHealth') as HTMLInputElement;
const vanHelsingHealth = document.getElementById('vanHelsingHealth') as HTMLInputElement;
const minaHealth = document.getElementById('minaHealth') as HTMLInputElement;
const godalmingLocation = document.getElementById('godalmingLocation') as HTMLInputElement;
const sewardLocation = document.getElementById('sewardLocation') as HTMLInputElement;
const vanHelsingLocation = document.getElementById('vanHelsingLocation') as HTMLInputElement;
const minaLocation = document.getElementById('minaLocation') as HTMLInputElement;
const trail = [
  document.getElementById('trail1') as HTMLInputElement,
  document.getElementById('trail2') as HTMLInputElement,
  document.getElementById('trail3') as HTMLInputElement,
  document.getElementById('trail4') as HTMLInputElement,
  document.getElementById('trail5') as HTMLInputElement,
  document.getElementById('trail6') as HTMLInputElement
];
const encounter = [
  document.getElementById('encounter1') as HTMLInputElement,
  document.getElementById('encounter2') as HTMLInputElement,
  document.getElementById('encounter3') as HTMLInputElement,
  document.getElementById('encounter4') as HTMLInputElement,
  document.getElementById('encounter5') as HTMLInputElement,
  document.getElementById('encounter6') as HTMLInputElement
];
const timePhase = document.getElementById('timePhase') as HTMLInputElement;
const vampireTrack = document.getElementById('vampireTrack') as HTMLInputElement;
const resolveTrack = document.getElementById('resolveTrack') as HTMLInputElement;
const startButton = document.getElementById('startButton');
const godalmingSearch = document.getElementById('godalmingSearch');
const sewardSearch = document.getElementById('sewardSearch');
const vanHelsingSearch = document.getElementById('vanHelsingSearch');
const minaSearch = document.getElementById('minaSearch');
const timeKeepingButton = document.getElementById('timeKeepingButton');
const draculaMovementButton = document.getElementById('draculaMovementButton');
const draculaActionButton = document.getElementById('draculaActionButton');

const timePhaseDescriptions = ['Dawn', 'Noon', 'Dusk', 'Twilight', 'Midnight', 'Small Hours'];
    
// wire up webpage components
draculaBlood.addEventListener('change', () => {
  game.setDraculaBlood(parseInt(draculaBlood.value));
  updateAllFields();
});
Array.from(document.getElementsByClassName('locationSelector')).forEach(selector => {
  game.map.locations.forEach(location => {
    (selector as HTMLSelectElement).options.add(new Option(location.name));
  });
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
godalmingLocation.addEventListener('change', () => {
  game.setHunterLocation(game.godalming, game.map.getLocationByName(godalmingLocation.value));
  updateAllFields();
});
sewardLocation.addEventListener('change', () => {
  game.setHunterLocation(game.seward, game.map.getLocationByName(sewardLocation.value));
  updateAllFields();
});
vanHelsingLocation.addEventListener('change', () => {
  game.setHunterLocation(game.vanHelsing, game.map.getLocationByName(vanHelsingLocation.value));
  updateAllFields();
});
minaLocation.addEventListener('change', () => {
  game.setHunterLocation(game.mina, game.map.getLocationByName(minaLocation.value));
  updateAllFields();
});
startButton.addEventListener('click', () => {
  startButton.parentNode.removeChild(startButton);
  game.startGame();
  timeKeepingButton.style.visibility = null;
  updateAllFields();
});
godalmingSearch.addEventListener('click', () => {
  game.searchWithHunter(game.godalming);
  updateAllFields();
});
sewardSearch.addEventListener('click', () => {
  game.searchWithHunter(game.seward);
  updateAllFields();
});
vanHelsingSearch.addEventListener('click', () => {
  game.searchWithHunter(game.vanHelsing);
  updateAllFields();
});
minaSearch.addEventListener('click', () => {
  game.searchWithHunter(game.mina);
  updateAllFields();
});
timeKeepingButton.addEventListener('click', () => {
  game.performTimeKeepingPhase();
  timeKeepingButton.style.visibility = 'hidden';
  draculaMovementButton.style.visibility = null;
  updateAllFields();
});
draculaMovementButton.addEventListener('click', () => {
  game.performDraculaMovementPhase();
  draculaMovementButton.style.visibility = 'hidden';
  draculaActionButton.style.visibility = null;
  updateAllFields();
});
draculaActionButton.addEventListener('click', () => {
  game.performDraculaActionPhase();
  draculaActionButton.style.visibility = 'hidden';
  timeKeepingButton.style.visibility = null;
  updateAllFields();
});

// set fields to game start state
game.initialiseGameState();
game.log('Hunters set starting locations then press Start button');
updateAllFields();

function updateAllFields() {
  logBox.value = game.logText;
  logBox.scrollTop = logBox.scrollHeight;
  draculaBlood.value = game.dracula.blood.toString();
  draculaLocation.value = game.dracula.revealed ? game.dracula.currentLocation.name : 'Hidden';
  godalmingHealth.value = game.godalming.health.toString();
  sewardHealth.value = game.seward.health.toString();
  vanHelsingHealth.value = game.vanHelsing.health.toString();
  minaHealth.value = game.mina.health.toString();
  encounterCount.value = game.dracula.encounterHand.length.toString();
  timePhase.value = timePhaseDescriptions[game.timePhase] || '';
  vampireTrack.value = game.vampireTrack.toString();
  resolveTrack.value = game.resolveTrack.toString();

  for (let i = 0; i < 6; i++) {
    if (game.dracula.trail[i]) {
      if (game.dracula.trail[i].revealed) {
        trail[i].value = game.dracula.trail[i].location.name;
      } else {
        trail[i].value = game.dracula.trail[i].location.type == LocationType.sea ? 'Sea' : 'Land';
      }
      if (game.dracula.trail[i].encounters[0]) {
        encounter[i].value = game.dracula.trail[i].encounters[0].revealed ? game.dracula.trail[i].encounters[0].name : 'Encounter';
      } else {
        encounter[i].value = '';
      }
    }
  }
}
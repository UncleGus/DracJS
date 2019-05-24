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
const startButton = document.getElementById('startButton');
const godalmingSearch = document.getElementById('godalmingSearch');
const sewardSearch = document.getElementById('sewardSearch');
const vanHelsingSearch = document.getElementById('vanHelsingSearch');
const minaSearch = document.getElementById('minaSearch');
    
// wire up webpage components
draculaBlood.addEventListener('change', () => {
  log(game.dracula.setBlood(parseInt(draculaBlood.value)));
  updateAllFields();
});
Array.from(document.getElementsByClassName('locationSelector')).forEach(selector => {
  game.map.locations.forEach(location => {
    (selector as HTMLSelectElement).options.add(new Option(location.name));
  });
});
godalmingHealth.addEventListener('change', () => {
  log(game.godalming.setHealth(parseInt(godalmingHealth.value)));
  updateAllFields();
});
sewardHealth.addEventListener('change', () => {
  log(game.seward.setHealth(parseInt(sewardHealth.value)));
  updateAllFields();
});
vanHelsingHealth.addEventListener('change', () => {
  log(game.vanHelsing.setHealth(parseInt(vanHelsingHealth.value)));
  updateAllFields();
});
minaHealth.addEventListener('change', () => {
  log(game.mina.setHealth(parseInt(minaHealth.value)));
  updateAllFields();
});
godalmingLocation.addEventListener('change', () => {
  log(game.godalming.setLocation(game.map.getLocationByName(godalmingLocation.value)));
  updateAllFields();
});
sewardLocation.addEventListener('change', () => {
  log(game.seward.setLocation(game.map.getLocationByName(sewardLocation.value)));
  updateAllFields();
});
vanHelsingLocation.addEventListener('change', () => {
  log(game.vanHelsing.setLocation(game.map.getLocationByName(vanHelsingLocation.value)));
  updateAllFields();
});
minaLocation.addEventListener('change', () => {
  log(game.mina.setLocation(game.map.getLocationByName(minaLocation.value)));
  updateAllFields();
});
startButton.addEventListener('click', () => {
  startButton.parentNode.removeChild(startButton);
  log(game.startGame());
  updateAllFields();
});
godalmingSearch.addEventListener('click', () => {
  log(game.searchWithHunter(game.godalming));
  updateAllFields();
});
sewardSearch.addEventListener('click', () => {
  log(game.searchWithHunter(game.seward));
  updateAllFields();
});
vanHelsingSearch.addEventListener('click', () => {
  log(game.searchWithHunter(game.vanHelsing));
  updateAllFields();
});
minaSearch.addEventListener('click', () => {
  log(game.searchWithHunter(game.mina));
  updateAllFields();
});

// set fields to game start state
log(game.initialiseGameState());
updateAllFields();
log('Hunters set starting locations then press Start button');

function log(message: string) {
  console.log(message);
  logBox.value += `${message}\n`;
  logBox.scrollTop = logBox.scrollHeight;
}

function updateAllFields() {
  draculaBlood.value = game.dracula.blood.toString();
  draculaLocation.value = game.dracula.revealed ? game.dracula.currentLocation.name : 'Hidden';
  godalmingHealth.value = game.godalming.health.toString();
  sewardHealth.value = game.seward.health.toString();
  vanHelsingHealth.value = game.vanHelsing.health.toString();
  minaHealth.value = game.mina.health.toString();
  encounterCount.value = game.dracula.encounterHand.length.toString();

  for (let i = 0; i < 6; i++) {
    if (game.dracula.trail[i]) {
      if (game.dracula.trail[i].revealed) {
        trail[i].value = game.dracula.trail[i].location.name;
      } else {
        trail[i].value = game.dracula.trail[i].location.type == LocationType.sea ? 'Sea' : 'Land';
      }
      if (game.dracula.trail[i].encounter) {
        encounter[i].value = 'Encounter';
      }
    }
  }
}
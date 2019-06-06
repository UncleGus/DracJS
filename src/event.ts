import { Game } from "./game";
import { EncounterName } from "./encounter";
import { LocationType } from "./map";

export class Event {
  name: string;
  draculaCard: boolean;
  type: EventType;

  constructor(name: string, draculaCard: boolean, type: EventType) {
    this.name = name;
    this.draculaCard = draculaCard;
    this.type = type;
  }
}

export enum EventName {
  AdvancePlanning = 'Advance Planning',
  BloodTransfusion = 'Blood Transfusion',
  CharteredCarriage = 'Chartered Carriage',
  ConsecratedGround = 'Consecrated Ground',
  ControlStorms = 'Control Storms',
  CustomsSearch = 'Customs Search',
  DevilishPower = 'Devilish Power',
  DraculasBrides = 'Dracula\'s Brides',
  EscapeRoute = 'Escape Route',
  Evasion = 'Evasion',
  ExcellentWeather = 'Excellent Weather',
  FalseTipoff = 'False Tipoff',
  Forewarned = 'Forewarned',
  GoodLuck = 'Good Luck',
  GreatStrength = 'Good Strength',
  HeroicLeap = 'Heroic Leap',
  HiredScouts = 'Hired Scouts',
  Hypnosis = 'Hypnosis',
  ImmanuelHildesheim = 'Immanuel Hildesheim',
  JonathanHarker = 'Jonathan Harker',
  LongDay = 'Long Day',
  MoneyTrail = 'Money Trail',
  MysticResearch = 'Mystic Research',
  NewspaperReports = 'Newspaper Reports',
  NightVisit = 'Night Visit',
  QuinceyPMorris = 'Quincey P Morris',
  Rage = 'Rage',
  ReEquip = 'Re-Equip',
  RelentlessMinion = 'Relentless Minion',
  Roadblock = 'Roadblock',
  RufusSmith = 'Rufus Smith',
  SecretWeapon = 'Secret Weapon',
  Seduction = 'Seduction',
  SensationalistPress = 'Sensationalist Press',
  SenseofEmergency = 'Sense Of Emergency',
  SisterAgatha = 'Sister Agatha',
  StormySeas = 'Stormy Seas',
  SurprisingReturn = 'Surprising Return',
  TelegraphAhead = 'Telegraph Ahead',
  TimeRunsShort = 'Time Runs Short',
  Trap = 'Trap',
  UnearthlySwiftness = 'Unearthly Swiftness',
  VampireLair = 'Vampire Lair',
  VampiricInfluence = 'Vampiric Influence',
  WildHorses = 'Wild Horses'
}

export enum EventType {
  Ally,
  Keep,
  PlayImmediately
}

export function initialiseEventDeck(): Event[] {
  return [
    new Event(EventName.AdvancePlanning, false, EventType.Keep),
    new Event(EventName.AdvancePlanning, false, EventType.Keep),
    new Event(EventName.AdvancePlanning, false, EventType.Keep),
    new Event(EventName.BloodTransfusion, false, EventType.Keep),
    new Event(EventName.CharteredCarriage, false, EventType.Keep),
    new Event(EventName.CharteredCarriage, false, EventType.Keep),
    new Event(EventName.CharteredCarriage, false, EventType.Keep),
    new Event(EventName.ConsecratedGround, false, EventType.PlayImmediately),
    new Event(EventName.ControlStorms, true, EventType.Keep),
    new Event(EventName.CustomsSearch, true, EventType.Keep),
    new Event(EventName.DevilishPower, true, EventType.Keep),
    new Event(EventName.DevilishPower, true, EventType.Keep),
    new Event(EventName.DraculasBrides, true, EventType.Ally),
    new Event(EventName.EscapeRoute, false, EventType.Keep),
    new Event(EventName.EscapeRoute, false, EventType.Keep),
    new Event(EventName.Evasion, true, EventType.PlayImmediately),
    new Event(EventName.ExcellentWeather, false, EventType.Keep),
    new Event(EventName.ExcellentWeather, false, EventType.Keep),
    new Event(EventName.FalseTipoff, true, EventType.Keep),
    new Event(EventName.FalseTipoff, true, EventType.Keep),
    new Event(EventName.Forewarned, false, EventType.Keep),
    new Event(EventName.Forewarned, false, EventType.Keep),
    new Event(EventName.Forewarned, false, EventType.Keep),
    new Event(EventName.GoodLuck, false, EventType.Keep),
    new Event(EventName.GoodLuck, false, EventType.Keep),
    new Event(EventName.GreatStrength, false, EventType.Keep),
    new Event(EventName.HeroicLeap, false, EventType.Keep),
    new Event(EventName.HiredScouts, false, EventType.PlayImmediately),
    new Event(EventName.HiredScouts, false, EventType.PlayImmediately),
    new Event(EventName.HiredScouts, false, EventType.PlayImmediately),
    new Event(EventName.Hypnosis, false, EventType.Keep),
    new Event(EventName.Hypnosis, false, EventType.Keep),
    new Event(EventName.ImmanuelHildesheim, true, EventType.Ally),
    new Event(EventName.JonathanHarker, false, EventType.Ally),
    new Event(EventName.LongDay, false, EventType.Keep),
    new Event(EventName.LongDay, false, EventType.Keep),
    new Event(EventName.MoneyTrail, false, EventType.Keep),
    new Event(EventName.MysticResearch, false, EventType.PlayImmediately),
    new Event(EventName.MysticResearch, false, EventType.PlayImmediately),
    new Event(EventName.NewspaperReports, false, EventType.PlayImmediately),
    new Event(EventName.NewspaperReports, false, EventType.PlayImmediately),
    new Event(EventName.NewspaperReports, false, EventType.PlayImmediately),
    new Event(EventName.NewspaperReports, false, EventType.PlayImmediately),
    new Event(EventName.NewspaperReports, false, EventType.PlayImmediately),
    new Event(EventName.NightVisit, true, EventType.PlayImmediately),
    new Event(EventName.QuinceyPMorris, true, EventType.Ally),
    new Event(EventName.Rage, true, EventType.Keep),
    new Event(EventName.ReEquip, false, EventType.PlayImmediately),
    new Event(EventName.ReEquip, false, EventType.PlayImmediately),
    new Event(EventName.ReEquip, false, EventType.PlayImmediately),
    new Event(EventName.RelentlessMinion, true, EventType.Keep),
    new Event(EventName.RelentlessMinion, true, EventType.Keep),
    new Event(EventName.Roadblock, true, EventType.Keep),
    new Event(EventName.RufusSmith, false, EventType.Ally),
    new Event(EventName.SecretWeapon, false, EventType.Keep),
    new Event(EventName.SecretWeapon, false, EventType.Keep),
    new Event(EventName.Seduction, true, EventType.Keep),
    new Event(EventName.SensationalistPress, true, EventType.Keep),
    new Event(EventName.SenseofEmergency, false, EventType.Keep),
    new Event(EventName.SenseofEmergency, false, EventType.Keep),
    new Event(EventName.SisterAgatha, false, EventType.Ally),
    new Event(EventName.StormySeas, false, EventType.Keep),
    new Event(EventName.SurprisingReturn, false, EventType.PlayImmediately),
    new Event(EventName.SurprisingReturn, false, EventType.PlayImmediately),
    new Event(EventName.TelegraphAhead, false, EventType.PlayImmediately),
    new Event(EventName.TelegraphAhead, false, EventType.PlayImmediately),
    new Event(EventName.TimeRunsShort, true, EventType.Keep),
    new Event(EventName.Trap, true, EventType.Keep),
    new Event(EventName.Trap, true, EventType.Keep),
    new Event(EventName.Trap, true, EventType.Keep),
    new Event(EventName.UnearthlySwiftness, true, EventType.Keep),
    new Event(EventName.VampireLair, false, EventType.PlayImmediately),
    new Event(EventName.VampiricInfluence, true, EventType.PlayImmediately),
    new Event(EventName.VampiricInfluence, true, EventType.PlayImmediately),
    new Event(EventName.WildHorses, true, EventType.Keep),
  ];
}

export function resolveEvent(eventName: string, gameState: Game) {
  switch (eventName) {
    case EventName.AdvancePlanning:
      gameState.log('One Hunter receives +1 to all combat rolls until the end of the combat');
      break;
    case EventName.BloodTransfusion:
      gameState.log('One Hunter loses 1 health and the other is cured of a bite');
      break;
    case EventName.CharteredCarriage:
      gameState.log(`${gameState.hunterWhoPlayedEvent.name} automatically catches a Fast/Express train`);
      break;
    case EventName.ConsecratedGround:
      gameState.log('Choose a location to move the Consecrated Ground marker');
      break;
    // Handled in game.draculaChooseControlStormsDestination()
    // case EventName.ControlStorms:
    //   break;
    // Handled in game.setHunterLocation()
    // case EventName.CustomsSearch:
    //   break;
    case EventName.DevilishPower:
      gameState.log(gameState.dracula.chooseTargetForDevilishPower());
      break;
    // Ally
    // case EventName.DraculasBrides:
    //   break;
    case EventName.EscapeRoute:
      gameState.log('The combat is cancelled but an encounter has still occurred');
      break;
    case EventName.Evasion:
      gameState.dracula.revealed = false;
      const evasionDestination = gameState.dracula.chooseEvasionDestination();
      gameState.dracula.currentLocation = evasionDestination;
      gameState.pushToTrail({ revealed: false, location: evasionDestination, encounter: gameState.dracula.chooseEncounterForTrail() });
      break;
    case EventName.ExcellentWeather:
      gameState.log(`${gameState.hunterWhoPlayedEvent.name} may make up to four sea moves`);
      break;
    // Handle in game.playHunterEvent()
    // case EventName.FalseTipoff:
    //   break;
    case EventName.Forewarned:
      gameState.log('Discard the encounter instead of resolving it');
      break;
    case EventName.GoodLuck:
      gameState.goodLuckInEffect = true;
      gameState.log('Choose a target for Good luck, Dracula\'s Ally or the Roadblock token');
      break;
    case EventName.GreatStrength:
      gameState.log('The Health loss or bite is cancelled');
      break;
    case EventName.HeroicLeap:
      gameState.log(`The combat is cancelled. Roll a die and deduct that amount from ${gameState.hunterWhoPlayedEvent.name}'s Health and Dracula's blood`);
      break;
    case EventName.HiredScouts:
      gameState.hiredScoutsInEffect = true;
      gameState.log('Choose two cities to investigate with Hired Scouts');
      break;
    case EventName.Hypnosis:
      let trailIndex = 0;
      for (trailIndex; trailIndex < gameState.trail.length; trailIndex++) {
        if (gameState.trail[trailIndex].location == gameState.dracula.currentLocation) {
          gameState.trailCardsToBeRevealed.push(trailIndex);
        }
        if (gameState.trail[trailIndex].encounter) {
          if (gameState.trail[trailIndex].encounter.name == EncounterName.NewVampire) {
            gameState.trail[trailIndex].encounter.revealed = true;
            gameState.log('A New Vampire is revealed in Dracula\'s trail');
          }
        }
      }
      gameState.catacombs.forEach(card => {
        if (card.encounter) {
          if (card.encounter.name == EncounterName.NewVampire) {
            card.encounter.revealed = true;
            gameState.log('A New Vampire is revealed in Dracula\'s catacombs');
          }
          if (card.catacombEncounter.name == EncounterName.NewVampire) {
            card.catacombEncounter.revealed = true;
            gameState.log('A New Vampire is revealed in Dracula\'s catacombs');
          }
        }
      });
      gameState.timePhase = (gameState.timePhase + 1) % 6;
      gameState.dracula.chooseNextMove();
      gameState.timePhase = (gameState.timePhase + 5) % 6;
      gameState.dracula.hypnosisInEffect = true;
      if (!gameState.dracula.nextMove) {
        gameState.log('Dracula has no legal next move');
      } else {
        if (gameState.dracula.nextMove.power) {
          gameState.log(`Dracula will use power ${gameState.dracula.nextMove.power.name}`);
        }
        if (gameState.dracula.nextMove.location) {
          gameState.log(`Dracula will move to ${gameState.dracula.nextMove.location.name}`)
        }
      }
      break;
    // Ally
    // case EventName.ImmanuelHildesheim:
    //   break;
    // Ally
    // case EventName.JonathanHarker:
    //   break;
    case EventName.LongDay:
      gameState.timePhase--;
      break;
    case EventName.MoneyTrail:
      let moneyTrailIndex = 0;
      for (moneyTrailIndex; moneyTrailIndex < gameState.trail.length; moneyTrailIndex++) {
        if (gameState.trail[moneyTrailIndex].location) {
          if (gameState.trail[moneyTrailIndex].location.type == LocationType.sea) {
            gameState.trailCardsToBeRevealed.push(moneyTrailIndex);
          }
        }
      }
      break;
    case EventName.MysticResearch:
      gameState.dracula.eventHand.forEach(card => {
        gameState.log(`Dracula has ${card.name}`);
      });
      break;
    case EventName.NewspaperReports:
      let i = gameState.trail.length - 1;
      for (i; i > 0; i--) {
        if (!gameState.trail[i].revealed) {
          gameState.trailCardsToBeRevealed.push(i);
          break;
        }
      }
      break;
    case EventName.NightVisit:
      gameState.log(gameState.dracula.chooseHunterToNightVisit());
      break;
    // Ally
    // case EventName.QuinceyPMorris:
    //   break;
    case EventName.Rage:
      gameState.log(gameState.dracula.chooseRageVictim());
      gameState.rageRounds = 3;
      break;
    case EventName.ReEquip:
      gameState.log('Discard one item and drew a new one from the deck');
      break;
    // Handled in game.handleCombatEffect()
    // case EventName.RelentlessMinion:
    //   break;
    case EventName.Roadblock:
      gameState.roadBlock = gameState.dracula.chooseRoadBlockTarget();
      gameState.log(`Dracula chose to move the Roadblock to the road between ${gameState.roadBlock[0].name} and ${gameState.roadBlock[1].name}`);
      break;
    // Ally
    // case EventName.RufusSmith:
    //   break;
    case EventName.SecretWeapon:
      gameState.log('Discard one item and retrieve one item from the discard pile');
      break;
    case EventName.Seduction:
      if (gameState.dracula.potentialTargetHunters.length > 1) {
        gameState.log('The New Vampire bites each member of the group before returning to Dracula');
      } else {
        gameState.log(`The New Vampire bites ${gameState.dracula.potentialTargetHunters[0].name} before returning to Dracula`);
      }
      let vampireIndex = 0;
      for (vampireIndex; vampireIndex < gameState.encounterPool.length; vampireIndex++) {
        if (gameState.encounterPool[vampireIndex].name == EncounterName.NewVampire) {
          break;
        }
      }
      gameState.dracula.encounterHand.push(gameState.encounterPool.splice(vampireIndex, 1)[0]);
      gameState.dracula.discardDownEncounters(gameState.encounterPool);
      break;
    case EventName.SensationalistPress:
      gameState.dracula.chooseLocationForSensationalistPress();
      break;
    case EventName.SenseofEmergency:
      gameState.log(`Lose ${6 - gameState.vampireTrack} Health and move to your chosen destination`);
      break;
    // Ally
    // case EventName.SisterAgatha:
    //   break;
    case EventName.StormySeas:
      gameState.stormySeasInEffect = true;
      gameState.log('Choose a sea location for Stormy Seas');
      break;
    case EventName.SurprisingReturn:
      gameState.log('Choose a Keep event from the discard pile to retrieve');
      break;
    case EventName.TelegraphAhead:
      let telegraphTrailIndex = 0;
      for (telegraphTrailIndex; telegraphTrailIndex < gameState.trail.length; telegraphTrailIndex++) {
        if (gameState.hunterWhoPlayedEvent.currentLocation.roadConnections.find(road => road == gameState.trail[telegraphTrailIndex].location)) {
          gameState.trailCardsToBeRevealed.push(telegraphTrailIndex);
        }
      }
      break;
    case EventName.TimeRunsShort:
      gameState.log('Time marches on...');
      gameState.timePhase++;
      if (this.timePhase == 6) {
        this.log('A new day dawns');
        this.setVampireTrack(this.vampireTrack + 1);
        this.resolveTrack += 1;
        this.timePhase = 0;
      }
      break;
    case EventName.Trap:
      gameState.log('Dracula receives +1 to all combat rolls this combat');
      break;
    case EventName.UnearthlySwiftness:
      gameState.unearthlySwiftnessInEffect = true;
      break;
    case EventName.VampireLair:
      if (gameState.vampireTrack == 0) {
        gameState.log('No Vampire to fight');
        break;
      }
      gameState.vampireLairInEffect = true;
      gameState.resolveEncounter(EncounterName.VampireLair, gameState.hunterWhoPlayedEvent);
      break;
    case EventName.VampiricInfluence:
      const hunterToInfluence = gameState.dracula.chooseHunterToInfluence();
      gameState.log(`${hunterToInfluence.name} must show Dracula all event and item cards and declare their next move to Dracula`);
      hunterToInfluence.knownEvents = [];
      hunterToInfluence.knownItems = [];
      hunterToInfluence.possibleItems = [];
      hunterToInfluence.items.forEach(item => hunterToInfluence.knownItems.push(item.name));
      hunterToInfluence.events.forEach(event => hunterToInfluence.knownEvents.push(event.name));
      break;
    case EventName.WildHorses:
      const wildHorsesLocation = gameState.dracula.chooseWildHorsesLocation();
      gameState.setHunterLocation(gameState.dracula.potentialTargetHunters[0], wildHorsesLocation.name);
      break;
  }
}
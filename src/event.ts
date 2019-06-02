import { Game } from "./game";

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
  SensationalistPress = 'Sensational Press',
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
    new Event(EventName.MysticResearch, false, EventType.Keep),
    new Event(EventName.MysticResearch, false, EventType.Keep),
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
      break;
    case EventName.BloodTransfusion:
      break;
    case EventName.CharteredCarriage:
      break;
    case EventName.ConsecratedGround:
      break;
    case EventName.ControlStorms:
      break;
    case EventName.CustomsSearch:
      break;
    case EventName.DevilishPower:
      break;
    case EventName.DraculasBrides:
      break;
    case EventName.EscapeRoute:
      break;
    case EventName.Evasion:
      break;
    case EventName.ExcellentWeather:
      break;
    case EventName.FalseTipoff:
      break;
    case EventName.Forewarned:
      break;
    case EventName.GoodLuck:
      break;
    case EventName.GreatStrength:
      break;
    case EventName.HeroicLeap:
      break;
    case EventName.HiredScouts:
      break;
    case EventName.Hypnosis:
      break;
    case EventName.ImmanuelHildesheim:
      break;
    case EventName.JonathanHarker:
      break;
    case EventName.LongDay:
      break;
    case EventName.MoneyTrail:
      break;
    case EventName.MysticResearch:
      break;
    case EventName.NewspaperReports:
      break;
    case EventName.NightVisit:
      break;
    case EventName.QuinceyPMorris:
      break;
    case EventName.Rage:
      break;
    case EventName.ReEquip:
      break;
    case EventName.RelentlessMinion:
      break;
    case EventName.Roadblock:
      break;
    case EventName.RufusSmith:
      break;
    case EventName.SecretWeapon:
      break;
    case EventName.Seduction:
      break;
    case EventName.SensationalistPress:
      break;
    case EventName.SenseofEmergency:
      break;
    case EventName.SisterAgatha:
      break;
    case EventName.StormySeas:
      break;
    case EventName.SurprisingReturn:
      break;
    case EventName.TelegraphAhead:
      break;
    case EventName.TimeRunsShort:
      break;
    case EventName.Trap:
      break;
    case EventName.UnearthlySwiftness:
      break;
    case EventName.VampireLair:
      break;
    case EventName.VampiricInfluence:
      break;
    case EventName.WildHorses:
      break;
  }
}
import { ItemName } from "./item";
import { Attack } from "./dracula";

export function getHunterSuccessCombatOutcome(hunterItem: string, enemyItem: string): CombatOutcome[] {
  let outcome: CombatOutcome[] = [];
  switch (hunterItem) {
    case ItemName.Dodge:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.DodgeDracula:
        case Attack.Fangs:
        case Attack.Mesmerize:
        case Attack.Strength:
        case Attack.DodgeMinion:
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.HunterRollBonus, CombatOutcome.Continue);
          break;
        case Attack.EscapeMan:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.EscapeAsBat, CombatOutcome.End);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Escape:
      outcome.push(CombatOutcome.End);
      break;
    case ItemName.Punch:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.DodgeDracula:
        case Attack.EscapeMan:
        case Attack.Strength:
        case Attack.DodgeMinion:
        case Attack.Knife:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.Continue);
          break;
        case Attack.EscapeBat:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.Fangs:
          outcome.push(CombatOutcome.Repel);
          break;
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.DraculaLose1Blood);
          break;
        case Attack.Punch:
          outcome.push(CombatOutcome.MinionDeath, CombatOutcome.End);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Knife:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.EscapeBat:
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.DraculaLose2Blood);
          break;
        case Attack.DodgeDracula:
        case Attack.DodgeMinion:
        case Attack.Rifle:
          outcome.push(CombatOutcome.Continue);
          break;
        case Attack.EscapeMan:
          outcome.push(CombatOutcome.DraculaDeath, CombatOutcome.End);
          break;
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.Fangs:
          outcome.push(CombatOutcome.DraculaLose3Blood);
          break;
        case Attack.Strength:
          outcome.push(CombatOutcome.DraculaLose1Blood);
          break;
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
          outcome.push(CombatOutcome.MinionDeath, CombatOutcome.End);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Pistol:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.DodgeDracula:
        case Attack.EscapeMan:
        case Attack.EscapeBat:
        case Attack.Strength:
        case Attack.DodgeMinion:
          outcome.push(CombatOutcome.Continue);
          break;
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.Fangs:
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.Repel);
          break;
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.MinionDeath, CombatOutcome.End);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Rifle:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.EscapeMan:
        case Attack.EscapeBat:
        case Attack.Fangs:
        case Attack.Mesmerize:
        case Attack.Strength:
          outcome.push(CombatOutcome.Repel);
          break;
        case Attack.DodgeDracula:
        case Attack.DodgeMinion:
          outcome.push(CombatOutcome.Continue);
          break;
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.MinionDeath, CombatOutcome.End);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.SacredBullets:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.EscapeBat:
        case Attack.Strength:
          outcome.push(CombatOutcome.DraculaLose1Blood, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.DodgeDracula:
          outcome.push(CombatOutcome.DraculaDeath, CombatOutcome.End, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.EscapeMan:
        case Attack.Fangs:
          outcome.push(CombatOutcome.DraculaLose2Blood, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.DraculaLose3Blood, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.DodgeMinion:
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.MinionDeath, CombatOutcome.End, CombatOutcome.HunterItemDestroyed);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Stake:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.DodgeDracula:
        case Attack.EscapeMan:
        case Attack.EscapeBat:
        case Attack.Fangs:
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.DraculaDeath, CombatOutcome.End);
          break;
        case Attack.EscapeMist:
        case Attack.Strength:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.DodgeMinion:
          outcome.push(CombatOutcome.MinionDeath, CombatOutcome.End);
          break;
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
          outcome.push(CombatOutcome.MinionDeath, CombatOutcome.End, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.Rifle:
          outcome.push(CombatOutcome.Continue);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Crucifix:
      switch (enemyItem) {
        case Attack.Claws:
          outcome.push(CombatOutcome.DraculaLose3Blood);
          break;
        case Attack.DodgeDracula:
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.DraculaLose1Blood);
          break;
        case Attack.EscapeMan:
        case Attack.Fangs:
        case Attack.Strength:
          outcome.push(CombatOutcome.DraculaLose2Blood);
          break;
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.Repel);
          break;
        case Attack.DodgeMinion:
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.Invalid);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.HeavenlyHost:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.DodgeDracula:
        case Attack.EscapeMan:
        case Attack.EscapeBat:
        case Attack.EscapeMist:
        case Attack.Fangs:
        case Attack.Mesmerize:
        case Attack.Strength:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.DodgeMinion:
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.Invalid);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.HolyWater:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.Strength:
          outcome.push(CombatOutcome.DraculaLose3Blood, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.DodgeDracula:
        case Attack.EscapeMan:
          outcome.push(CombatOutcome.DraculaLose2Blood, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.EscapeBat:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.DraculaLose1Blood, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.Fangs:
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.DraculaLose4Blood);
          break;
        case Attack.DodgeMinion:
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.Invalid);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    default:
      outcome.push(CombatOutcome.Invalid);
      break;
  }
  return outcome;
}

export function getEnemySuccessCombatOutcome(hunterItem: string, enemyItem: string): CombatOutcome[] {
  let outcome: CombatOutcome[] = [];
  switch (hunterItem) {
    case ItemName.Dodge:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.Punch:
          outcome.push(CombatOutcome.HunterLose1Health);
          break;
        case Attack.DodgeDracula:
        case Attack.Fangs:
        case Attack.Mesmerize:
        case Attack.Strength:
        case Attack.DodgeMinion:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus);
          break;
        case Attack.EscapeMan:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.End, CombatOutcome.EscapeAsBat);
          break;
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.Knife:
          outcome.push(CombatOutcome.HunterLose2Health, CombatOutcome.HunterEventDiscarded);
          break;
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.Continue);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Escape:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.Strength:
          outcome.push(CombatOutcome.HunterLose2Health);
          break;
        case Attack.DodgeDracula:
        case Attack.EscapeMan:
        case Attack.EscapeBat:
        case Attack.EscapeMist:
        case Attack.DodgeMinion:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.Fangs:
          outcome.push(CombatOutcome.Bite, CombatOutcome.End, CombatOutcome.EscapeAsBat);
          break;
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.Bite, CombatOutcome.End, CombatOutcome.HunterLosesAllItems);
          break;
        case Attack.Punch:
          outcome.push(CombatOutcome.HunterLose1Health);
          break;
        case Attack.Knife:
          outcome.push(CombatOutcome.HunterLose2Health, CombatOutcome.HunterEventDiscarded);
          break;
        case Attack.Pistol:
          outcome.push(CombatOutcome.HunterLose2Health);
          break;
        case Attack.Rifle:
          outcome.push(CombatOutcome.HunterLose3Health);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Punch:
      switch (enemyItem) {
        case Attack.Claws:
          outcome.push(CombatOutcome.HunterLose1Health);
          break;
        case Attack.DodgeDracula:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus);
          break;
        case Attack.EscapeMan:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.End, CombatOutcome.EscapeAsBat);
          break;
        case Attack.Fangs:
          outcome.push(CombatOutcome.Bite, CombatOutcome.End, CombatOutcome.EscapeAsBat);
          break;
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.Continue);
          break;
        case Attack.Strength:
          outcome.push(CombatOutcome.HunterLose3Health);
          break;
        case Attack.DodgeMinion:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus);
          break;
        case Attack.Punch:
          outcome.push(CombatOutcome.HunterLose1Health);
          break;
        case Attack.Knife:
          outcome.push(CombatOutcome.HunterLose2Health, CombatOutcome.HunterEventDiscarded);
          break;
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.HunterLose3Health);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Knife:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.Fangs:
        case Attack.Punch:
          outcome.push(CombatOutcome.HunterLose1Health);
          break;
        case Attack.DodgeDracula:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus);
          break;
        case Attack.EscapeMan:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.End, CombatOutcome.EscapeAsBat);
          break;
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.Bite, CombatOutcome.End, CombatOutcome.HunterLosesAllItems);
          break;
        case Attack.Strength:
          outcome.push(CombatOutcome.Continue, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.DodgeMinion:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus);
          break;
        case Attack.Knife:
          outcome.push(CombatOutcome.HunterLose1Health, CombatOutcome.HunterEventDiscarded);
          break;
        case Attack.Pistol:
          outcome.push(CombatOutcome.HunterLose2Health);
          break;
        case Attack.Rifle:
          outcome.push(CombatOutcome.HunterLose3Health);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Pistol:
      switch (enemyItem) {
        case Attack.Claws:
          outcome.push(CombatOutcome.Continue);
          break;
        case Attack.DodgeDracula:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus);
          break;
        case Attack.EscapeMan:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.End, CombatOutcome.EscapeAsBat);
          break;
        case Attack.Fangs:
          outcome.push(CombatOutcome.Bite, CombatOutcome.End, CombatOutcome.EscapeAsBat);
          break;
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.Bite, CombatOutcome.End, CombatOutcome.HunterLosesAllItems);
          break;
        case Attack.Strength:
          outcome.push(CombatOutcome.HunterLose1Health);
          break;
        case Attack.DodgeMinion:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus);
          break;
        case Attack.Punch:
          outcome.push(CombatOutcome.Continue);
          break;
        case Attack.Knife:
          outcome.push(CombatOutcome.HunterLose1Health, CombatOutcome.HunterEventDiscarded);
          break;
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.HunterLose2Health);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Rifle:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.Fangs:
        case Attack.Mesmerize:
        case Attack.Punch:
          outcome.push(CombatOutcome.Continue);
          break;
        case Attack.DodgeDracula:
        case Attack.DodgeMinion:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus);
          break;
        case Attack.EscapeMan:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.End, CombatOutcome.EscapeAsBat);
          break;
        case Attack.Strength:
          outcome.push(CombatOutcome.Continue, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.Knife:
          outcome.push(CombatOutcome.Continue, CombatOutcome.HunterEventDiscarded);
          break;
        case Attack.Pistol:
          outcome.push(CombatOutcome.HunterLose1Health);
          break;
        case Attack.Rifle:
          outcome.push(CombatOutcome.HunterLose2Health);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.SacredBullets:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.HunterLose2Health, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.DodgeDracula:
        case Attack.DodgeMinion:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.EscapeMan:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.End, CombatOutcome.EscapeAsBat, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.Fangs:
          outcome.push(CombatOutcome.Bite, CombatOutcome.End, CombatOutcome.EscapeAsBat, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.Bite, CombatOutcome.End, CombatOutcome.HunterLosesAllItems);
          break;
        case Attack.Strength:
        case Attack.Punch:
          outcome.push(CombatOutcome.Continue, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.Knife:
          outcome.push(CombatOutcome.HunterLose1Health, CombatOutcome.HunterEventDiscarded, CombatOutcome.HunterItemDestroyed);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Stake:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.Pistol:
          outcome.push(CombatOutcome.HunterLose2Health);
          break;
        case Attack.DodgeDracula:
        case Attack.DodgeMinion:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus);
          break;
        case Attack.EscapeMan:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.End, CombatOutcome.EscapeAsBat);
          break;
        case Attack.Fangs:
          outcome.push(CombatOutcome.HunterLose3Health);
          break;
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.Bite, CombatOutcome.End, CombatOutcome.HunterLosesAllItems);
          break;
        case Attack.Strength:
          outcome.push(CombatOutcome.Continue, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.Punch:
          outcome.push(CombatOutcome.HunterLose1Health);
          break;
        case Attack.Knife:
          outcome.push(CombatOutcome.HunterLose1Health, CombatOutcome.HunterEventDiscarded);
          break;
        case Attack.Rifle:
          outcome.push(CombatOutcome.HunterLose3Health);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.Crucifix:
      switch (enemyItem) {
        case Attack.Claws:
          outcome.push(CombatOutcome.HunterLose1Health);
          break;
        case Attack.DodgeDracula:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus);
          break;
        case Attack.EscapeMan:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.End, CombatOutcome.EscapeAsBat);
          break;
        case Attack.Fangs:
        case Attack.Mesmerize:
          outcome.push(CombatOutcome.Continue);
          break;
        case Attack.Strength:
          outcome.push(CombatOutcome.Continue, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.DodgeMinion:
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.Invalid);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.HeavenlyHost:
      switch (enemyItem) {
        case Attack.Claws:
        case Attack.Fangs:
        case Attack.Mesmerize:
        case Attack.Strength:
          outcome.push(CombatOutcome.Continue);
          break;
        case Attack.DodgeDracula:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus);
          break;
        case Attack.EscapeMan:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End);
          break;
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.End, CombatOutcome.EscapeAsBat);
          break;
        case Attack.DodgeMinion:
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.Invalid);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    case ItemName.HolyWater:
      switch (enemyItem) {
        case Attack.Claws:
          outcome.push(CombatOutcome.HunterLose2Health, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.DodgeDracula:
          outcome.push(CombatOutcome.Continue, CombatOutcome.DraculaInitiativeBonus, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.EscapeMan:
        case Attack.EscapeMist:
          outcome.push(CombatOutcome.End, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.EscapeBat:
          outcome.push(CombatOutcome.End, CombatOutcome.EscapeAsBat, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.Fangs:
          outcome.push(CombatOutcome.HunterLose1Health, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.Mesmerize:
        case Attack.Strength:
          outcome.push(CombatOutcome.Continue, CombatOutcome.HunterItemDestroyed);
          break;
        case Attack.DodgeMinion:
        case Attack.Punch:
        case Attack.Knife:
        case Attack.Pistol:
        case Attack.Rifle:
          outcome.push(CombatOutcome.Invalid);
          break;
        default:
          outcome.push(CombatOutcome.Invalid);
          break;
      }
      break;
    default:
      outcome.push(CombatOutcome.Invalid);
      break;
  }
  return outcome;
}

export enum CombatOutcome {
  DraculaLose1Blood,
  DraculaLose2Blood,
  DraculaLose3Blood,
  DraculaLose4Blood,
  HunterRollBonus,
  Repel,
  DraculaDeath,
  MinionDeath,
  HunterLose1Health,
  HunterLose2Health,
  HunterLose3Health,
  DraculaInitiativeBonus,
  HunterItemDestroyed,
  HunterEventDiscarded,
  HunterLosesAllItems,
  Bite,
  EscapeAsBat,
  Continue,
  End,
  Invalid
}

export class Encounter {
  name: string;
  revealed: boolean;

  constructor(name: string) {
    this.name = name;
    this.revealed = false;
  }
}

/**
 * Creates the set of Encounters to use in the game
 */
export function initialiseEncounterPool(): Encounter[] {
  return [
    new Encounter(EncounterName.Ambush),
    new Encounter(EncounterName.Ambush),
    new Encounter(EncounterName.Ambush),
    new Encounter(EncounterName.Assassin),
    new Encounter(EncounterName.Bats),
    new Encounter(EncounterName.Bats),
    new Encounter(EncounterName.Bats),
    new Encounter(EncounterName.DesecratedSoil),
    new Encounter(EncounterName.DesecratedSoil),
    new Encounter(EncounterName.DesecratedSoil),
    new Encounter(EncounterName.Fog),
    new Encounter(EncounterName.Fog),
    new Encounter(EncounterName.Fog),
    new Encounter(EncounterName.Fog),
    new Encounter(EncounterName.MinionWithKnife),
    new Encounter(EncounterName.MinionWithKnife),
    new Encounter(EncounterName.MinionWithKnife),
    new Encounter(EncounterName.MinionWithKnifeAndPistol),
    new Encounter(EncounterName.MinionWithKnifeAndPistol),
    new Encounter(EncounterName.MinionWithKnifeAndRifle),
    new Encounter(EncounterName.MinionWithKnifeAndRifle),
    new Encounter(EncounterName.Hoax),
    new Encounter(EncounterName.Hoax),
    new Encounter(EncounterName.Lightning),
    new Encounter(EncounterName.Lightning),
    new Encounter(EncounterName.Peasants),
    new Encounter(EncounterName.Peasants),
    new Encounter(EncounterName.Plague),
    new Encounter(EncounterName.Rats),
    new Encounter(EncounterName.Rats),
    new Encounter(EncounterName.Saboteur),
    new Encounter(EncounterName.Saboteur),
    new Encounter(EncounterName.Spy),
    new Encounter(EncounterName.Spy),
    new Encounter(EncounterName.Thief),
    new Encounter(EncounterName.Thief),
    new Encounter(EncounterName.NewVampire),
    new Encounter(EncounterName.NewVampire),
    new Encounter(EncounterName.NewVampire),
    new Encounter(EncounterName.NewVampire),
    new Encounter(EncounterName.NewVampire),
    new Encounter(EncounterName.NewVampire),
    new Encounter(EncounterName.Wolves),
    new Encounter(EncounterName.Wolves),
    new Encounter(EncounterName.Wolves)
  ];
}

export enum EncounterName {
  Ambush = 'Ambush',
  Assassin = 'Assasin',
  Bats = 'Bats',
  DesecratedSoil = 'Desecrated Soil',
  Fog = 'Fog',
  MinionWithKnife = 'Minion With Knife',
  MinionWithKnifeAndPistol = 'Minion With Knife And Pistol',
  MinionWithKnifeAndRifle = 'Minion With Knife And Rifle',
  Hoax = 'Hoax',
  Lightning = 'Lightning',
  Peasants = 'Peasants',
  Plague = 'Plague',
  Rats = 'Rats',
  Saboteur = 'Saboteur',
  Spy = 'Spy',
  Thief = 'Thief',
  NewVampire = 'New Vampire',
  Wolves = 'Wolves'
}
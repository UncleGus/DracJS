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
    new Encounter('Ambush'),
    new Encounter('Ambush'),
    new Encounter('Ambush'),
    new Encounter('Assassin'),
    new Encounter('Bats'),
    new Encounter('Bats'),
    new Encounter('Bats'),
    new Encounter('Desecrated Soil'),
    new Encounter('Desecrated Soil'),
    new Encounter('Desecrated Soil'),
    new Encounter('Fog'),
    new Encounter('Fog'),
    new Encounter('Fog'),
    new Encounter('Fog'),
    new Encounter('Minion with Knife'),
    new Encounter('Minion with Knife'),
    new Encounter('Minion with Knife'),
    new Encounter('Minion with Knife and Pistol'),
    new Encounter('Minion with Knife and Pistol'),
    new Encounter('Minion with Knife and Rifle'),
    new Encounter('Minion with Knife and Rifle'),
    new Encounter('Hoax'),
    new Encounter('Hoax'),
    new Encounter('Lightning'),
    new Encounter('Lightning'),
    new Encounter('Peasants'),
    new Encounter('Peasants'),
    new Encounter('Plague'),
    new Encounter('Rats'),
    new Encounter('Rats'),
    new Encounter('Saboteur'),
    new Encounter('Saboteur'),
    new Encounter('Spy'),
    new Encounter('Spy'),
    new Encounter('Thief'),
    new Encounter('Thief'),
    new Encounter('New Vampire'),
    new Encounter('New Vampire'),
    new Encounter('New Vampire'),
    new Encounter('New Vampire'),
    new Encounter('New Vampire'),
    new Encounter('New Vampire'),
    new Encounter('Wolves'),
    new Encounter('Wolves'),
    new Encounter('Wolves')
  ];
}

/**
 * Shuffles the Encounters
 * @param encounters The Encounters to shuffle
 */
export function shuffleEncounters(encounters: Encounter[]) {
  const shuffledEncounters = [];
  while (encounters.length > 0) {
    const randomIndex = Math.floor(Math.random()*encounters.length);
    shuffledEncounters.push(encounters.splice(randomIndex, 1)[0]);
  }
  return shuffledEncounters;
}
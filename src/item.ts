export class Item {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export enum ItemName {
  Crucifix = 'Crucifix',
  Dogs = 'Dogs',
  FastHorse = 'Fast Horse',
  Garlic = 'Garlic',
  HeavenlyHost = 'Heavenly Host',
  HolyWater = 'Holy Water',
  Knife = 'Knife',
  LocalRumors = 'Local Rumors',
  Pistol = 'Pistol',
  Rifle = 'Rifle',
  SacredBullets = 'Sacred Bullets',
  Stake = 'Stakes',
  Punch = 'Punch',
  Dodge = 'Dodge',
  Escape = 'Escape'
}

export function initialiseItemDeck(): Item[] {
  return [
    new Item(ItemName.Crucifix),
    new Item(ItemName.Crucifix),
    new Item(ItemName.Crucifix),
    new Item(ItemName.Dogs),
    new Item(ItemName.Dogs),
    new Item(ItemName.FastHorse),
    new Item(ItemName.FastHorse),
    new Item(ItemName.FastHorse),
    new Item(ItemName.Garlic),
    new Item(ItemName.Garlic),
    new Item(ItemName.Garlic),
    new Item(ItemName.Garlic),
    new Item(ItemName.HeavenlyHost),
    new Item(ItemName.HeavenlyHost),
    new Item(ItemName.HolyWater),
    new Item(ItemName.HolyWater),
    new Item(ItemName.HolyWater),
    new Item(ItemName.Knife),
    new Item(ItemName.Knife),
    new Item(ItemName.Knife),
    new Item(ItemName.Knife),
    new Item(ItemName.Knife),
    new Item(ItemName.LocalRumors),
    new Item(ItemName.LocalRumors),
    new Item(ItemName.Pistol),
    new Item(ItemName.Pistol),
    new Item(ItemName.Pistol),
    new Item(ItemName.Pistol),
    new Item(ItemName.Pistol),
    new Item(ItemName.Rifle),
    new Item(ItemName.Rifle),
    new Item(ItemName.Rifle),
    new Item(ItemName.Rifle),
    new Item(ItemName.SacredBullets),
    new Item(ItemName.SacredBullets),
    new Item(ItemName.SacredBullets),
    new Item(ItemName.Stake),
    new Item(ItemName.Stake),
    new Item(ItemName.Stake),
    new Item(ItemName.Stake)
  ];
}
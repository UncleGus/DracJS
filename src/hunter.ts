import { Location } from "./map";

export class Hunter {
  name: string;
  health: number;
  currentLocation: Location;

  constructor(newName: string) {
    this.name = newName;
  }
}

export class Godalming extends Hunter {
  constructor() {
    super('Lord Godalming');
    this.health = 12;
  }
}

export class Seward extends Hunter {
  constructor() {
    super('Dr. Seward');
    this.health = 10;
  }
}

export class VanHelsing extends Hunter {
  constructor() {
    super('Van Helsing');
    this.health = 8;
  }
}

export class Mina extends Hunter {
  constructor() {
    super('Mina Harker');
    this.health = 8;
  }
}

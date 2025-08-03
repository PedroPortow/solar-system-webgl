export const PLANETS = {
  SUN: {
    radius: 696340,
    orbitDistanceFromSun: 0,
    orbitalPeriod: 0,
    rotationPeriod: 25.05,
  },
  MERCURY: {
    radius: 2439.5,
    orbitDistanceFromSun: 57900000,
    orbitalPeriod: 88.0,
    rotationPeriod: 58.65,
  },
  VENUS: {
    radius: 6052,
    orbitDistanceFromSun: 108200000,
    orbitalPeriod: 224.7,
    rotationPeriod: -243.02,
  },
  EARTH: {
    radius: 6378,
    orbitDistanceFromSun: 149600000,
    orbitalPeriod: 365.2,
    rotationPeriod: 0.996,
  },
  MARS: {
    radius: 3396,
    orbitDistanceFromSun: 228000000,
    orbitalPeriod: 687.0,
    rotationPeriod: 1.025,
  },
  JUPITER: {
    radius: 71492,
    orbitDistanceFromSun: 778500000,
    orbitalPeriod: 4331,
    rotationPeriod: 0.4125,
  },
  SATURN: {
    radius: 60268,
    orbitDistanceFromSun: 1432000000,
    orbitalPeriod: 10747,
    rotationPeriod: 0.4458,
  },
  URANUS: {
    radius: 25559,
    orbitDistanceFromSun: 2867000000,
    orbitalPeriod: 30589,
    rotationPeriod: -0.7167,
  },
  NEPTUNE: {
    radius: 24764,
    orbitDistanceFromSun: 4515000000,
    orbitalPeriod: 59800,
    rotationPeriod: 0.6708,
  },
  PLUTO: {
    radius: 1188,
    orbitDistanceFromSun: 5906400000,
    orbitalPeriod: 90560,
    rotationPeriod: -6.3875,
  },
};

export const COMETS = {
  HALLEY: {
    radius: 5.5,
    orbitalPeriod: 27503, // ~75 anos
    rotationPeriod: 2.2,
  },
  VOYAGER: {
    radius: 3.0,
    orbitalPeriod: 43800, // ~120 anos 
    rotationPeriod: 1.5,
  },
  MACHHOLZ: {
    radius: 1.0,
    orbitalPeriod: 1929, // ~5.28 anos
    rotationPeriod: 1.0,
  }
}

export const PLANET_DISPLAY_SCALE = new Map([
  [PLANETS?.SUN, 50],
  [PLANETS?.EARTH, 10],
  [PLANETS?.MERCURY, 10],
  [PLANETS?.VENUS, 10],
  [PLANETS?.MARS, 10],
  [PLANETS?.JUPITER, 50],
  [PLANETS?.SATURN, 70],
  [PLANETS?.URANUS, 80],
  [PLANETS?.NEPTUNE, 90],
  [PLANETS?.PLUTO, 100],
]);

export const COMET_DISPLAY_SCALE = new Map([
  [COMETS.HALLEY, 10],
  [COMETS.VOYAGER, 10],
  [COMETS.MACHHOLZ, 10],      
]);

// reza a lenda que um dia vou deixar isso bonito com oop
const baseSpeed = 1;
export const PLANETS_ROTATION_SPEED = new Map([
    [PLANETS?.SUN, baseSpeed / PLANETS?.SUN?.rotationPeriod * 0.5],
    [PLANETS?.MERCURY, baseSpeed / PLANETS?.MERCURY?.rotationPeriod],
    [PLANETS?.VENUS, baseSpeed / Math.abs(PLANETS?.VENUS?.rotationPeriod)],
    [PLANETS?.EARTH, baseSpeed / PLANETS?.EARTH?.rotationPeriod],
    [PLANETS?.MARS, baseSpeed / PLANETS?.MARS?.rotationPeriod],
    [PLANETS?.JUPITER, baseSpeed / PLANETS?.JUPITER?.rotationPeriod],
    [PLANETS?.SATURN, baseSpeed / PLANETS?.SATURN?.rotationPeriod],
    [PLANETS?.URANUS, baseSpeed / Math.abs(PLANETS?.URANUS?.rotationPeriod)],
    [PLANETS?.NEPTUNE, baseSpeed / PLANETS?.NEPTUNE?.rotationPeriod],
    [PLANETS?.PLUTO, baseSpeed / Math.abs(PLANETS?.PLUTO?.rotationPeriod)],
]);

export const COMET_SPEEDS = new Map([
  [COMETS.HALLEY, {
    rotation: baseSpeed / COMETS.HALLEY.rotationPeriod,
    orbit: baseSpeed / COMETS.HALLEY.orbitalPeriod * 0.5
  }],
  [COMETS.VOYAGER, {
    rotation: baseSpeed / COMETS.VOYAGER.rotationPeriod,
    orbit: baseSpeed / COMETS.VOYAGER.orbitalPeriod * 0.3
  }],
  [COMETS.MACHHOLZ, {
    rotation: baseSpeed / COMETS.MACHHOLZ.rotationPeriod,
    orbit: baseSpeed / COMETS.MACHHOLZ.orbitalPeriod * 0.1
  }],
]);

export const PLANET_ORBITAL_SPEEDS = new Map([
  [PLANETS.MERCURY, PLANETS.EARTH.orbitalPeriod / PLANETS.MERCURY.orbitalPeriod],
  [PLANETS.VENUS, PLANETS.EARTH.orbitalPeriod / PLANETS.VENUS.orbitalPeriod],     
  [PLANETS.EARTH, 1.0],                                                          
  [PLANETS.MARS, PLANETS.EARTH.orbitalPeriod / PLANETS.MARS.orbitalPeriod],      
  [PLANETS.JUPITER, PLANETS.EARTH.orbitalPeriod / PLANETS.JUPITER.orbitalPeriod],
  [PLANETS.SATURN, PLANETS.EARTH.orbitalPeriod / PLANETS.SATURN.orbitalPeriod],   
  [PLANETS.URANUS, PLANETS.EARTH.orbitalPeriod / PLANETS.URANUS.orbitalPeriod],  
  [PLANETS.NEPTUNE, PLANETS.EARTH.orbitalPeriod / PLANETS.NEPTUNE.orbitalPeriod], 
  [PLANETS.PLUTO, PLANETS.EARTH.orbitalPeriod / PLANETS.PLUTO.orbitalPeriod],  
]);

export const COMET_ORBITAL_SPEEDS = new Map([
  [COMETS.HALLEY, PLANETS.EARTH.orbitalPeriod / COMETS.HALLEY.orbitalPeriod],     // ~75 anos
  [COMETS.VOYAGER, PLANETS.EARTH.orbitalPeriod / COMETS.VOYAGER.orbitalPeriod],   // ~120 anos
  [COMETS.MACHHOLZ, PLANETS.EARTH.orbitalPeriod / COMETS.MACHHOLZ.orbitalPeriod], // ~5.28 anos
]);

export const PLANETS = {
  SUN: {
    radius: 696340, // km
    orbitDistanceFromSun: 0, // km (centro)
    orbitalPeriod: 0, // dias
    rotationPeriod: 25.05, // dias
    color: [1.0, 0.8, 0.2, 1.0]
  },
  MERCURY: {
    radius: 2439.5, // km
    orbitDistanceFromSun: 57900000, // km
    orbitalPeriod: 88.0, // dias
    rotationPeriod: 58.65, // dias
    color: [0.8, 0.8, 0.9, 1.0] 
  },
  // VENUS: {
  //   radius: 6051.8, // km
  //   orbitDistanceFromSun: 108200000, // km
  //   orbitalPeriod: 224.7, // dias
  //   rotationPeriod: -243.02, // dias (rotação retrógrada)
  //   color: [1.0, 0.9, 0.7, 1.0] 
  // },
  EARTH: {
    radius: 6378, // km
    orbitDistanceFromSun: 149600000, // km
    orbitalPeriod: 365.2, // dias
    rotationPeriod: 0.996, // dias
    color: [0.0, 0.0, 1.0, 1.0] 
  },
  // MARS: {
  //   radius: 3396, // km
  //   orbitDistanceFromSun: 228000000, // km
  //   orbitalPeriod: 687.0, // dias
  //   rotationPeriod: 1.025, // dias
  //   color: [1.0, 0.0, 0.0, 1.0]
  // },
  // JUPITER: {
  //   radius: 71492, // km
  //   orbitDistanceFromSun: 778500000, // km
  //   orbitalPeriod: 4331, // dias
  //   rotationPeriod: 0.4125, // dias
  //   color: [0.8, 0.5, 0.2, 1.0] 
  // },
  // SATURN: {
  //   radius: 60268, // km
  //   orbitDistanceFromSun: 1432000000, // km
  //   orbitalPeriod: 10747, // dias
  //   rotationPeriod: 0.4458, // dias
  //   color: [1.0, 1.0, 0.0, 1.0]
  // },
  // URANUS: {
  //   radius: 25559, // km
  //   orbitDistanceFromSun: 2867000000, // km
  //   orbitalPeriod: 30589, // dias
  //   rotationPeriod: -0.7167, // dias (rotação retrógrada)
  //   color: [0.6, 0.8, 1.0, 1.0] 
  // },
  // NEPTUNE: {
  //   radius: 24764, // km
  //   orbitDistanceFromSun: 4515000000, // km
  //   orbitalPeriod: 59800, // dias
  //   rotationPeriod: 0.6708, // dias
  //   color: [0.0, 0.0, 0.5, 1.0]
  // },
  // PLUTO: {
  //   radius: 1188, // km
  //   orbitDistanceFromSun: 5906400000, // km
  //   orbitalPeriod: 90560, // dias
  //   rotationPeriod: -6.3875, // dias (rotação retrógrada)
  //   color: [0.7, 0.7, 0.7, 1.0] 
  // }
};

export const PLANET_DISPLAY_SCALE = new Map([
  [PLANETS?.SUN, 6],
  [PLANETS?.MERCURY, 1.2],
  [PLANETS?.VENUS, 2.0],
  [PLANETS?.EARTH, 2.1],
  [PLANETS?.MARS, 1.6],
  [PLANETS?.JUPITER, 8.5],
  [PLANETS?.SATURN, 7.2],
  [PLANETS?.URANUS, 4.8],
  [PLANETS?.NEPTUNE, 4.6],
  [PLANETS?.PLUTO, 1.0],
]);

export const PLANET_ORBITS_DISPLAY_SCALE = new Map([
  [PLANETS?.SUN, 0],
  [PLANETS?.MERCURY, 25],
  [PLANETS?.VENUS, 35],
  [PLANETS?.EARTH, 45],
  [PLANETS?.MARS, 55],
  [PLANETS?.JUPITER, 75],
  [PLANETS?.SATURN, 95],
  [PLANETS?.URANUS, 125],
  [PLANETS?.NEPTUNE, 155],
  [PLANETS?.PLUTO, 185],
]);

const baseSpeed = 1;
export const PLANET_SPEEDS = new Map([
    [PLANETS?.SUN, { 
        rotation: baseSpeed / PLANETS?.SUN?.rotationPeriod * 0.5, 
        orbit: null 
    }],
    [PLANETS?.MERCURY, { 
        rotation: baseSpeed / PLANETS?.MERCURY?.rotationPeriod, 
        orbit: baseSpeed / PLANETS?.MERCURY?.orbitalPeriod * 2 
    }],
    [PLANETS?.VENUS, { 
        rotation: baseSpeed / Math.abs(PLANETS?.VENUS?.rotationPeriod), 
        orbit: baseSpeed / PLANETS?.VENUS?.orbitalPeriod * 2 
    }],
    [PLANETS?.EARTH, { 
        rotation: baseSpeed / PLANETS?.EARTH?.rotationPeriod, 
        orbit: baseSpeed / PLANETS?.EARTH?.orbitalPeriod * 2 
    }],
    [PLANETS?.MARS, { 
        rotation: baseSpeed / PLANETS?.MARS?.rotationPeriod, 
        orbit: baseSpeed / PLANETS?.MARS?.orbitalPeriod * 2 
    }],
    [PLANETS?.JUPITER, { 
        rotation: baseSpeed / PLANETS?.JUPITER?.rotationPeriod, 
        orbit: baseSpeed / PLANETS?.JUPITER?.orbitalPeriod * 2 
    }],
    [PLANETS?.SATURN, { 
        rotation: baseSpeed / PLANETS?.SATURN?.rotationPeriod, 
        orbit: baseSpeed / PLANETS?.SATURN?.orbitalPeriod * 2 
    }],
    [PLANETS?.URANUS, { 
        rotation: baseSpeed / Math.abs(PLANETS?.URANUS?.rotationPeriod), 
        orbit: baseSpeed / PLANETS?.URANUS?.orbitalPeriod * 2 
    }],
    [PLANETS?.NEPTUNE, { 
        rotation: baseSpeed / PLANETS?.NEPTUNE?.rotationPeriod, 
        orbit: baseSpeed / PLANETS?.NEPTUNE?.orbitalPeriod * 2 
    }],
    [PLANETS?.PLUTO, { 
        rotation: baseSpeed / Math.abs(PLANETS?.PLUTO?.rotationPeriod), 
        orbit: baseSpeed / PLANETS?.PLUTO?.orbitalPeriod * 2 
    }],
]); 

export const PLANETS = {
  SUN: {
    radius: 696340, // km
    orbitDistanceFromSun: 0, // km (centro)
    orbitalPeriod: 0, // dias
    rotationPeriod: 25.05, // dias
    color: [1.0, 0.8, 0.2, 1.0],
    orbitalElements: {
      semiMajorAxis: 0, // AU
      eccentricity: 0,
      inclination: 0 // degrees
    }
  },
  MERCURY: {
    radius: 2439.5, // km
    orbitDistanceFromSun: 57900000, // km
    orbitalPeriod: 88.0, // dias
    rotationPeriod: 58.65, // dias
    color: [0.8, 0.8, 0.9, 1.0],
    orbitalElements: {
      semiMajorAxis: 0.387, // AU
      eccentricity: 0.206,
      inclination: 7.0 // degrees
    }
  },
  VENUS: {
    radius: 6052, // km
    orbitDistanceFromSun: 108200000, // km
    orbitalPeriod: 224.7, // dias
    rotationPeriod: -243.02, // dias (rotação retrógrada)
    color: [1.0, 0.9, 0.7, 1.0],
    orbitalElements: {
      semiMajorAxis: 0.723, // AU
      eccentricity: 0.007,
      inclination: 3.4 // degrees
    }
  },
  EARTH: {
    radius: 6378, // km
    orbitDistanceFromSun: 149600000, // km
    orbitalPeriod: 365.2, // dias
    rotationPeriod: 0.996, // dias
    color: [0.0, 0.0, 1.0, 1.0],
    orbitalElements: {
      semiMajorAxis: 1.000, // AU
      eccentricity: 0.017,
      inclination: 0.0 // degrees
    }
  },
  MARS: {
    radius: 3396, // km
    orbitDistanceFromSun: 228000000, // km
    orbitalPeriod: 687.0, // dias
    rotationPeriod: 1.025, // dias
    color: [1.0, 0.0, 0.0, 1.0],
    orbitalElements: {
      semiMajorAxis: 1.524, // AU
      eccentricity: 0.093,
      inclination: 1.8 // degrees
    }
  },
  JUPITER: {
    radius: 71492, // km
    orbitDistanceFromSun: 778500000, // km
    orbitalPeriod: 4331, // dias
    rotationPeriod: 0.4125, // dias
    color: [0.8, 0.5, 0.2, 1.0],
    orbitalElements: {
      semiMajorAxis: 5.203, // AU
      eccentricity: 0.048,
      inclination: 1.3 // degrees
    }
  },
  SATURN: {
    radius: 60268, // km
    orbitDistanceFromSun: 1432000000, // km
    orbitalPeriod: 10747, // dias
    rotationPeriod: 0.4458, // dias
    color: [1.0, 1.0, 0.0, 1.0],
    orbitalElements: {
      semiMajorAxis: 9.537, // AU
      eccentricity: 0.054,
      inclination: 2.5 // degrees
    }
  },
  URANUS: {
    radius: 25559, // km
    orbitDistanceFromSun: 2867000000, // km
    orbitalPeriod: 30589, // dias
    rotationPeriod: -0.7167, // dias (rotação retrógrada)
    color: [0.6, 0.8, 1.0, 1.0],
    orbitalElements: {
      semiMajorAxis: 19.191, // AU
      eccentricity: 0.047,
      inclination: 0.8 // degrees
    }
  },
  NEPTUNE: {
    radius: 24764, // km
    orbitDistanceFromSun: 4515000000, // km
    orbitalPeriod: 59800, // dias
    rotationPeriod: 0.6708, // dias
    color: [0.0, 0.0, 0.5, 1.0],
    orbitalElements: {
      semiMajorAxis: 30.069, // AU
      eccentricity: 0.009,
      inclination: 1.8 // degrees
    }
  },
  PLUTO: {
    radius: 1188, // km
    orbitDistanceFromSun: 5906400000, // km
    orbitalPeriod: 90560, // dias
    rotationPeriod: -6.3875, // dias (rotação retrógrada)
    color: [0.7, 0.7, 0.7, 1.0],
    orbitalElements: {
      semiMajorAxis: 39.482, // AU
      eccentricity: 0.249,
      inclination: 17.1 // degrees
    }
  }
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
  [PLANETS?.MARS, 60],
  [PLANETS?.JUPITER, 120],
  [PLANETS?.SATURN, 180],
  [PLANETS?.URANUS, 280],
  [PLANETS?.NEPTUNE, 350],
  [PLANETS?.PLUTO, 420],
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

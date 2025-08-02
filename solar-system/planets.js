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
  }
};

export const PLANET_DISPLAY_SCALE = new Map([
  [PLANETS?.SUN, 500],          
  [PLANETS?.EARTH, 200],     
  [PLANETS?.MERCURY, 100],      
  [PLANETS?.VENUS, 100],        
  [PLANETS?.MARS, 100],      
  [PLANETS?.JUPITER, 1000],      
  [PLANETS?.SATURN, 1000],       
  [PLANETS?.URANUS, 1000],       
  [PLANETS?.NEPTUNE, 1000],     
  [PLANETS?.PLUTO, 100],        
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

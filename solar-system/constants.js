import { EARTH_TRAJECTORY } from "./trajectories/earthTrajectory.js"
import { HALLEY_TRAJECTORY } from "./trajectories/halleyTrajectory.js"
import { JUPITER_TRAJECTORY } from "./trajectories/jupiterTrajectory.js"
import { MACHHOLZ_TRAJECTORY } from "./trajectories/machholzTrajectory.js"
import { MARS_TRAJECTORY } from "./trajectories/marsTrajectory.js"
import { MERCURY_TRAJECTORY } from "./trajectories/mercuryTrajectory.js"
import { NEPTUNE_TRAJECTORY } from "./trajectories/neptuneTrajectory.js"
import { PLUTO_TRAJECTORY } from "./trajectories/plutoTrajectory.js"
import { SATURN_TRAJECTORY } from "./trajectories/saturnTrajectory.js"
import { URANUS_TRAJECTORY } from "./trajectories/uranusTrajectory.js"
import { VENUS_TRAJECTORY } from "./trajectories/venusTrajectory.js"
import { VOYAGER_TRAJECTORY } from "./trajectories/voyagerTrajectory.js"

export const DIRECTIONS = { FORWARD: 1, BACKWARD: -1 }

export const TEXTURES = {
  'MERCURY': './assets/2k_mercury.jpg',
  'VENUS': './assets/2k_venus_surface.jpg',
  'EARTH': './assets/2k_earth_daymap.jpg',
  'MARS': './assets/2k_mars.jpg',
  'JUPITER': './assets/2k_jupiter.jpg',
  'SATURN': './assets/2k_saturn.jpg',
  'URANUS': './assets/2k_uranus.jpg',
  'NEPTUNE': './assets/2k_neptune.jpg',
  'SUN': './assets/8k_sun.jpg',
  'PLUTO': './assets/plutomap2k.jpg',
  'HALLEY': './assets/2k_mercury.jpg',
  'MACHHOLZ': './assets/2k_mercury.jpg',
  'VOYAGER': './assets/2k_mercury.jpg',
}

export const TRAJECTORIES = {
  'EARTH': EARTH_TRAJECTORY,
  'JUPITER': JUPITER_TRAJECTORY,
  'MARS': MARS_TRAJECTORY,
  'MERCURY': MERCURY_TRAJECTORY,
  'NEPTUNE': NEPTUNE_TRAJECTORY,
  'PLUTO': PLUTO_TRAJECTORY,
  'SATURN': SATURN_TRAJECTORY,
  'URANUS': URANUS_TRAJECTORY,
  'VENUS': VENUS_TRAJECTORY,
  'HALLEY': HALLEY_TRAJECTORY,
  'VOYAGER': VOYAGER_TRAJECTORY,
  'MACHHOLZ': MACHHOLZ_TRAJECTORY
}


export const EARTH_DISTANCE_FROM_SUN = 149600000
export const DISTANCE_SCALE_FACTOR = 0.000009

export const SIMULATION_START_DATE = new Date(2024, 0, 1); 


const PLANET_TRAJECTORIES = {
  'EARTH': EARTH_TRAJECTORY,
  'JUPITER': JUPITER_TRAJECTORY,
  'MARS': MARS_TRAJECTORY,
  'MERCURY': MERCURY_TRAJECTORY,
  'NEPTUNE': NEPTUNE_TRAJECTORY,
  'PLUTO': PLUTO_TRAJECTORY,
  'SATURN': SATURN_TRAJECTORY,
  'URANUS': URANUS_TRAJECTORY,
  'VENUS': VENUS_TRAJECTORY
}

function getPlanetPositionFromTrajectory(planetKey, time) {
  const trajectory = PLANET_TRAJECTORIES[planetKey]

  // pegar o index pra achar a posição atual, se passar um ano n pode sair do arrayyy precisa normalizar
  /** @see {https://dev.to/avocoaster/how-to-wrap-around-a-range-of-numbers-with-the-modulo-cdo} */
  const currentIndex = Math.floor(time) % trajectory.length
  const nextIndex = (currentIndex + 1) % trajectory.length

  const currentPoint = trajectory[currentIndex]
  const nextPoint = trajectory[nextIndex]

  const currentPos = convertHGIToCartesian(currentPoint.RAD_AU, currentPoint.HGI_LAT, currentPoint.HGI_LON)
  const nextPos = convertHGIToCartesian(nextPoint.RAD_AU, nextPoint.HGI_LAT, nextPoint.HGI_LON)


  // TODO: Quando troca de posição tá dando umas travadinhas acho que é algo de interpolação? tem q ser mais suave?
  return [
    currentPos[0] + (nextPos[0] - currentPos[0]),
    currentPos[1] + (nextPos[1] - currentPos[1]),
    currentPos[2] + (nextPos[2] - currentPos[2])
  ]
}

function createPlanetOrbit(planetKey) {
  const positions = []

  const planetTrajectory = PLANET_TRAJECTORIES[planetKey]

  for (let i = 0; i < planetTrajectory.length; ++i) {
    const point = planetTrajectory[i]
    const [x, y, z] = convertHGIToCartesian(point.RAD_AU, point.HGI_LAT, point.HGI_LON)
    positions.push(x, y, z)
  }

  /*  Problemasso: Obviamente pra terra funciona porque ela dá uma volta perfeita em volta do sol
      então cria uma órbita fechadinha e bonita. Mas os outros dão sla X voltas em um ano de dados
      aí a tem vezes q n fecha os 360 graus da órbita bonita e fica com descontinuidades
      então tem q fechar
  */
  // const firstPoint = planetTrajectory[0]
  // const lastPoint = planetTrajectory[planetTrajectory.length - 1]

  // const angleDiff = Math.abs(firstPoint.HGI_LON - lastPoint.HGI_LON)
  // const normalizedAngleDiff = Math.min(angleDiff, 360 - angleDiff)

  // if (normalizedAngleDiff < 30) {
  //   positions.push(positions[0], positions[1], positions[2])
  // }

  return new Float32Array(positions)
}


function getPlanetPositionFromTrajectory(planetKey, time) {
  const trajectory = PLANET_TRAJECTORIES[planetKey]

  // pegar o index pra achar a posição atual, se passar um ano n pode sair do arrayyy precisa normalizar
  /** @see {https://dev.to/avocoaster/how-to-wrap-around-a-range-of-numbers-with-the-modulo-cdo} */
  const currentIndex = Math.floor(time) % trajectory.length
  const nextIndex = (currentIndex + 1) % trajectory.length

  const currentPoint = trajectory[currentIndex]
  const nextPoint = trajectory[nextIndex]

  const currentPos = convertHGIToCartesian(currentPoint.RAD_AU, currentPoint.HGI_LAT, currentPoint.HGI_LON)
  const nextPos = convertHGIToCartesian(nextPoint.RAD_AU, nextPoint.HGI_LAT, nextPoint.HGI_LON)


  // TODO: Quando troca de posição tá dando umas travadinhas acho que é algo de interpolação? tem q ser mais suave?
  return [
    currentPos[0] + (nextPos[0] - currentPos[0]),
    currentPos[1] + (nextPos[1] - currentPos[1]),
    currentPos[2] + (nextPos[2] - currentPos[2])
  ]
}

function createPlanetOrbit(planetKey) {
  const positions = []

  const planetTrajectory = PLANET_TRAJECTORIES[planetKey]

  for (let i = 0; i < planetTrajectory.length; ++i) {
    const point = planetTrajectory[i]
    const [x, y, z] = convertHGIToCartesian(point.RAD_AU, point.HGI_LAT, point.HGI_LON)
    positions.push(x, y, z)
  }

  /*  Problemasso: Obviamente pra terra funciona porque ela dá uma volta perfeita em volta do sol
      então cria uma órbita fechadinha e bonita. Mas os outros dão sla X voltas em um ano de dados
      aí a tem vezes q n fecha os 360 graus da órbita bonita e fica com descontinuidades
      então tem q fechar
  */
  // const firstPoint = planetTrajectory[0]
  // const lastPoint = planetTrajectory[planetTrajectory.length - 1]

  // const angleDiff = Math.abs(firstPoint.HGI_LON - lastPoint.HGI_LON)
  // const normalizedAngleDiff = Math.min(angleDiff, 360 - angleDiff)

  // if (normalizedAngleDiff < 30) {
  //   positions.push(positions[0], positions[1], positions[2])
  // }

  return new Float32Array(positions)
}

function createOrbitBuffer(gl, programInfo, radius) {
  const positions = createOrbitGeometry(radius)

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 3, data: positions }
  })

  const vao = twgl.createVAOFromBufferInfo(gl, programInfo, bufferInfo)

  return { bufferInfo, vao, numElements: positions.length / 3 }
}

"use strict"

import { texturedVertexShader, texturedFragmentShader, orbitVertexShader, orbitFragmentShader, skyboxVertexShader, skyboxFragmentShader } from "./shaders.js"
import { convertHGIToCartesian, degToRad } from "./utils/main.js"
import { PLANETS, PLANET_DISPLAY_SCALE, PLANET_ORBITS_DISPLAY_SCALE, PLANET_SPEEDS } from "./planets.js"
import { EARTH_TRAJECTORY } from "./trajectories/earthTrajectory.js"
import { JUPITER_TRAJECTORY } from "./trajectories/jupiterTrajectory.js"
import { MARS_TRAJECTORY } from "./trajectories/marsTrajectory.js"
import { MERCURY_TRAJECTORY } from "./trajectories/mercuryTrajectory.js"
import { NEPTUNE_TRAJECTORY } from "./trajectories/neptuneTrajectory.js"
import { PLUTO_TRAJECTORY } from "./trajectories/plutoTrajectory.js"
import { SATURN_TRAJECTORY } from "./trajectories/saturnTrajectory.js"
import { URANUS_TRAJECTORY } from "./trajectories/uranusTrajectory.js"
import { VENUS_TRAJECTORY } from "./trajectories/venusTrajectory.js"

const DIRECTIONS = { FORWARD: 1, BACKWARD: -1 }

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



function main() {
  const canvas = document.querySelector("#canvas")
  const gl = canvas.getContext("webgl2")

  const playPauseButton = document.querySelector(".play-pause-button")
  const reverseButton = document.querySelector(".reverse-button")
  const speedSlider = document.querySelector(".speed-slider")

  const playIcon = playPauseButton.querySelector(".fa-play")
  const pauseIcon = playPauseButton.querySelector(".fa-pause")

  let time = 0
  let isPaused = false
  let speed = 1
  let direction = DIRECTIONS.FORWARD
  let previousTime = 0

  let cameraAngleX = 0
  let cameraAngleY = Math.PI / 3
  let cameraDistance = 250
  let isDragging = false
  let previousMouseX = 0
  let previousMouseY = 0

  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      isDragging = true
      previousMouseX = e.clientX
      previousMouseY = e.clientY
    }
  })
  canvas.addEventListener("mouseup", () => { isDragging = false })
  canvas.addEventListener("mouseleave", () => { isDragging = false })

  canvas.addEventListener("mousemove", (e) => {
    if (!isDragging) return
    const deltaX = e.clientX - previousMouseX
    const deltaY = e.clientY - previousMouseY
    previousMouseX = e.clientX
    previousMouseY = e.clientY

    cameraAngleX += deltaX * 0.005
    cameraAngleY += deltaY * 0.005
    cameraAngleY = Math.max(0.1, Math.min(Math.PI - 0.1, cameraAngleY))
  })
  
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault()
    cameraDistance += e.deltaY
    cameraDistance = Math.max(25, Math.min(1000, cameraDistance))
  })
  
  playPauseButton.addEventListener("click", () => {
    isPaused = !isPaused

    playIcon.style.display = isPaused ? "none" : "block"
    pauseIcon.style.display = isPaused ? "block" : "none"

    if (!isPaused) requestAnimationFrame(updateScene)
  })

  reverseButton.addEventListener("click", () => {
    direction = direction === DIRECTIONS.FORWARD ? DIRECTIONS.BACKWARD : DIRECTIONS.FORWARD
  })

  speedSlider.addEventListener("input", (event) => {
    speed = parseFloat(event.target.value)
  })

  twgl.setAttributePrefix("a_") // prefixo para os atributos

  const planetsProgram = twgl.createProgramInfo(gl, [texturedVertexShader, texturedFragmentShader])
  const orbitProgram = twgl.createProgramInfo(gl, [orbitVertexShader, orbitFragmentShader])
  const skyboxProgram = twgl.createProgramInfo(gl, [skyboxVertexShader, skyboxFragmentShader])

  const planetTextures = {
    MERCURY: twgl.createTexture(gl, {
      src: './assets/2k_mercury.jpg',
      crossOrigin: ''
    }),
    VENUS: twgl.createTexture(gl, {
      src: './assets/2k_venus_surface.jpg',
      crossOrigin: ''
    }),
    EARTH: twgl.createTexture(gl, {
      src: './assets/2k_earth_daymap.jpg',
      crossOrigin: ''
    }),
    MARS: twgl.createTexture(gl, {
      src: './assets/2k_mars.jpg',
      crossOrigin: ''
    }),
    JUPITER: twgl.createTexture(gl, {
      src: './assets/2k_jupiter.jpg',
      crossOrigin: ''
    }),
    SATURN: twgl.createTexture(gl, {
      src: './assets/2k_saturn.jpg',
      crossOrigin: ''
    }),
    URANUS: twgl.createTexture(gl, {
      src: './assets/2k_uranus.jpg',
      crossOrigin: ''
    }),
    NEPTUNE: twgl.createTexture(gl, {
      src: './assets/2k_neptune.jpg',
      crossOrigin: ''
    }),
    SUN: twgl.createTexture(gl, {
      src: './assets/8k_sun.jpg',
      crossOrigin: ''
    }),
    PLUTO: twgl.createTexture(gl, {
      src: './assets/plutomap2k.jpg',
      crossOrigin: ''
    }),
  }

  const skyboxTexture = twgl.createTexture(gl, {
    src: './assets/8k_stars_milky_way.jpg',
    crossOrigin: ''
  })

  const planets = createPlanetsRenderData(gl, planetsProgram, planetTextures, PLANET_DISPLAY_SCALE)

  const objectsToDraw = Object.keys(planets).map(planetKey => ({
    programInfo: planetsProgram,
    bufferInfo: planets[planetKey].buffer,
    vertexArray: planets[planetKey].vao,
    uniforms: planets[planetKey].uniforms,
  }))

  const orbits = {
    program: orbitProgram,
    ...Object.keys(PLANETS).reduce((acc, planetKey) => {
      const planet = PLANETS[planetKey]

      // TODo: arrumar isso aqui nem sei pq eu tava fazendo isso
      if (planetKey === 'SUN') {
        const orbitRadius = PLANET_ORBITS_DISPLAY_SCALE.get(planet)
        if (orbitRadius) acc[planetKey] = createOrbitBuffer(gl, orbitProgram, orbitRadius)
      } else {
    
        // acc[planetKey] = createOrbitBuffer(gl, orbitProgram, PLANET_ORBITS_DISPLAY_SCALE.get(planet))
        acc[planetKey] = createPlanetOrbitBuffer(gl, orbitProgram, planetKey)
      }

      return acc
    }, {})
  }

  const skybox = createSkybox(gl, skyboxProgram, skyboxTexture)

  const fieldOfViewRadians = degToRad(60)

  const updateScene = (now) => {
    if (isPaused) return

    const deltaTime = now - previousTime

    previousTime = now
    time += deltaTime * speed * direction * 0.001

    const camera = {
      angleX: cameraAngleX,
      angleY: cameraAngleY,
      distance: cameraDistance
    }

    drawScene({
      time,
      gl,
      fieldOfViewRadians,
      objectsToDraw,
      planets,
      orbits,
      skybox,
      camera,
    })

    requestAnimationFrame(updateScene)
  }

  requestAnimationFrame(updateScene)
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

function drawScene({ time, gl, fieldOfViewRadians, objectsToDraw, planets, orbits, skybox, camera }) {
  twgl.resizeCanvasToDisplaySize(gl.canvas)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight
  const projectionMatrix = m4.perspective(fieldOfViewRadians, aspectRatio, 1, 2000)

  const cameraPosition = [
    camera.distance * Math.sin(camera.angleY) * Math.cos(camera.angleX),
    camera.distance * Math.cos(camera.angleY),
    camera.distance * Math.sin(camera.angleY) * Math.sin(camera.angleX)
  ]

  const lookVector = [0, 0, 0]
  const upVector = [0, 1, 0]
  const cameraMatrix = m4.lookAt(cameraPosition, lookVector, upVector)

  const viewMatrix = m4.inverse(cameraMatrix)
  const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

  // Desativa o negócio de não desenhar as coisas de trás, porque nós estamos dentro da
  // esfera da skybox 
  gl.disable(gl.CULL_FACE)
  gl.useProgram(skybox.program.program)
  gl.bindVertexArray(skybox.vao)

  const skyboxMatrix = m4.copy(viewMatrix)
  /*
    tira a translação pra n se mexer coma camera
    [ x    x    x   0  
      x    x    x   0  
      x    x    x   0  
      0    0    0   1  ]
  */
  skyboxMatrix[12] = 0
  skyboxMatrix[13] = 0
  skyboxMatrix[14] = 0
  
  const skyboxProjectionMatrix = m4.multiply(projectionMatrix, skyboxMatrix)
  
  twgl.setUniforms(skybox.program, { u_viewProjectionMatrix: skyboxProjectionMatrix, u_texture: skybox.texture })
  twgl.drawBufferInfo(gl, skybox.bufferInfo)
  gl.enable(gl.CULL_FACE)

  // orbita primeiro pra ficar atras dos planeta
  gl.useProgram(orbits.program.program)

  const orbitUniforms = {
    u_viewProjectionMatrix: viewProjectionMatrix,
    u_orbitColor: [0.4, 0.6, 1.0], // TODO: botar um negocio legal aqui
    u_alpha: 0.6
  }

  twgl.setUniforms(orbits.program, orbitUniforms)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  Object.keys(orbits).forEach(planetKey => {
    if (planetKey !== 'program') {
      gl.bindVertexArray(orbits[planetKey].vao)
      gl.drawArrays(gl.LINE_STRIP, 0, orbits[planetKey].numElements)
    }
  })

  gl.disable(gl.BLEND)

  Object.keys(planets).forEach(planetKey => {
    const planet = PLANETS[planetKey]
    const planetRenderable = planets[planetKey]
    const speedInfo = PLANET_SPEEDS.get(planet)

    if (PLANETS[planetKey] === PLANETS.SUN) {
      const sunRotation = time * speedInfo.rotation
      planetRenderable.uniforms.u_matrix = computeMatrix(viewProjectionMatrix, [0, 0, 0], 0, sunRotation)
    } else {
      const planetPosition = getPlanetPositionFromTrajectory(planetKey, time * 250)

      planetRenderable.uniforms.u_matrix = computeMatrix(viewProjectionMatrix, planetPosition, 0, 4)
    }
  })

  objectsToDraw.forEach(function(object) {
    const programInfo = object.programInfo

    gl.useProgram(programInfo.program)
    gl.bindVertexArray(object.vertexArray)
    twgl.setUniforms(programInfo, object.uniforms)
    twgl.drawBufferInfo(gl, object.bufferInfo)
  })
}

function createOrbitGeometry(radius, segments = 64) {
  const positions = []

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = 0 // órbitas no plano XZ

    positions.push(x, y, z)
  }

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

function createPlanetOrbitBuffer(gl, orbitPogram, planetKey) {
  const positions = createPlanetOrbit(planetKey)

  console.log({ positions })

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 3, data: positions }
  })

  const vao = twgl.createVAOFromBufferInfo(gl, orbitPogram, bufferInfo)

  return { bufferInfo, vao, numElements: positions.length / 3 }
}

function createPlanetsRenderData(gl, program, textures, scale) {
  const planets = {}

  Object.keys(PLANETS).forEach(planetKey => {
    const planet = PLANETS[planetKey]
    const radius = scale.get(planet)

    if (radius) {
      const detail = planetKey === 'SUN' ? [24, 12] : [16, 8]
      
      const buffer = flattenedPrimitives.createSphereBufferInfo(gl, radius, detail[0], detail[1])
      
      const uniforms = {
        u_colorMult: planet.color,
        u_matrix: m4.identity(),
        u_texture: textures[planetKey],
      }

      planets[planetKey] = {
        buffer,
        uniforms,
        vao: twgl.createVAOFromBufferInfo(gl, program, buffer)
      }
    }
  })

  return planets
}

function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
  // transalação + rotação x + rotação y
  let matrix = m4.translate(viewProjectionMatrix, translation[0], translation[1], translation[2])
  matrix = m4.xRotate(matrix, xRotation)
  return m4.yRotate(matrix, yRotation)
}

function createSkybox(gl, program, texture) {
  const sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 2000, 32, 16)
  const vao = twgl.createVAOFromBufferInfo(gl, program, sphereBufferInfo)
  
  return {
    program,
    bufferInfo: sphereBufferInfo,
    vao,
    texture
  }
}

main()

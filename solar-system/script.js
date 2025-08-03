"use strict"

import { CAMERA_CONTROLS, DIRECTIONS, DISTANCE_SCALE_FACTOR, SIMULATION_START_DATE, TEXTURES, TIME_SCALE, TRAJECTORIES } from "./constants.js"
import { COMETS, COMET_DISPLAY_SCALE, COMET_ORBITAL_SPEEDS, COMET_SPEEDS, PLANETS, PLANETS_ROTATION_SPEED, PLANET_DISPLAY_SCALE, PLANET_ORBITAL_SPEEDS } from "./planets.js"
import { bodyFragmentShader, bodyVertexShader, cometFragmentShader, cometTrailFragmentShader, cometTrailVertexShader, cometVertexShader, orbitFragmentShader, orbitVertexShader, skyboxFragmentShader, skyboxVertexShader, sunFragmentShader, sunVertexShader } from "./shaders.js"
import { degToRad, formatDate, smoothTrajectory } from "./utils.js"


const height = document.documentElement.clientHeight

function main() {
  const canvas = document.querySelector("#canvas")
  const gl = canvas.getContext("webgl2")

  const playPauseButton = document.querySelector(".play-pause-button")
  const speedSlider = document.querySelector(".speed-slider")
  const focusSelector = document.querySelector(".focus-selector")
  const currentDateElement = document.querySelector("#current-date")

  currentDateElement.textContent = formatDate(SIMULATION_START_DATE)

  const playIcon = playPauseButton.querySelector(".fa-play")
  const pauseIcon = playPauseButton.querySelector(".fa-pause")

  let time = 0
  let isPaused = false
  let speed = 1
  let previousTime = 0

  let cameraAngleX = 0
  let cameraAngleY = Math.PI / 3
  let cameraDistance = 1500
  let isDragging = false
  let previousMouseX = 0
  let previousMouseY = 0
  let focusTarget = 'SUN'

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

    cameraAngleX += deltaX * CAMERA_CONTROLS.MOUSE_SENSITIVITY
    cameraAngleY += deltaY * CAMERA_CONTROLS.MOUSE_SENSITIVITY
    cameraAngleY = Math.max(CAMERA_CONTROLS.MIN_ANGLE_Y, Math.min(CAMERA_CONTROLS.MAX_ANGLE_Y, cameraAngleY))
  })

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault()
    cameraDistance += e.deltaY
    cameraDistance = Math.max(CAMERA_CONTROLS.MIN_DISTANCE, Math.min(CAMERA_CONTROLS.MAX_DISTANCE, cameraDistance))
  })

  playPauseButton.addEventListener("click", () => {
    isPaused = !isPaused

    playIcon.style.display = isPaused ? "none" : "block"
    pauseIcon.style.display = isPaused ? "block" : "none"

    if (!isPaused) requestAnimationFrame(updateScene)
  })

  speedSlider.addEventListener("input", (event) => {
    speed = parseFloat(event.target.value)
  })

  focusSelector.addEventListener("change", (event) => {
    focusTarget = event.target.value
  })

  twgl.setAttributePrefix("a_") // prefixo para os atributos

  const planetsProgram = twgl.createProgramInfo(gl, [bodyVertexShader, bodyFragmentShader])
  const sunProgram = twgl.createProgramInfo(gl, [sunVertexShader, sunFragmentShader])
  const orbitProgram = twgl.createProgramInfo(gl, [orbitVertexShader, orbitFragmentShader])
  const skyboxProgram = twgl.createProgramInfo(gl, [skyboxVertexShader, skyboxFragmentShader])
  const cometProgram = twgl.createProgramInfo(gl, [cometVertexShader, cometFragmentShader])
  const cometTrailProgram = twgl.createProgramInfo(gl, [cometTrailVertexShader, cometTrailFragmentShader])

  const planetTextures = Object.keys(PLANETS).reduce((acc, planetKey) => {
    acc[planetKey] = twgl.createTexture(gl, {
      src: TEXTURES[planetKey],
      crossOrigin: ''
    })

    return acc
  }, {})


  const skyboxTexture = twgl.createTexture(gl, { src: './assets/8k_stars_milky_way.jpg', crossOrigin: '' })

  const sun = createSunBuffer(gl, sunProgram, planetTextures['SUN'], PLANET_DISPLAY_SCALE.get(PLANETS.SUN))
  const planets = createPlanetsBuffer(gl, planetsProgram, planetTextures, PLANET_DISPLAY_SCALE)
  const comets = createCometsBuffer(gl, cometProgram, COMET_DISPLAY_SCALE)
  const cometTrails = createCometTrailsBuffer(gl, cometTrailProgram, COMET_DISPLAY_SCALE)
  const skybox = createSkyboxBuffer(gl, skyboxProgram, skyboxTexture)

  const cometPositionHistory = new Map()
  const TRAIL_LENGTH = 8
  let frameCount = 0

  const objectsToDraw = [
    {
      programInfo: sunProgram,
      bufferInfo: sun.buffer,
      vertexArray: sun.vao,
      uniforms: sun.uniforms,
    },
    ...Object.keys(planets).map(planetKey => ({
      programInfo: planetsProgram,
      bufferInfo: planets[planetKey].buffer,
      vertexArray: planets[planetKey].vao,
      uniforms: planets[planetKey].uniforms,
    })),
    ...Object.keys(comets).map(cometKey => ({
      programInfo: cometProgram,
      bufferInfo: comets[cometKey].buffer,
      vertexArray: comets[cometKey].vao,
      uniforms: comets[cometKey].uniforms,
    }))
  ]

  const orbits = {
    program: orbitProgram,
    ...Object.keys(PLANETS).reduce((acc, planetKey) => {
      if (planetKey !== 'SUN') {
        acc[planetKey] = createOrbitBuffer(gl, orbitProgram, TRAJECTORIES[planetKey])
      }

      return acc
    }, {}),
    ...Object.keys(COMETS).reduce((acc, cometKey) => {
      acc[cometKey] = createOrbitBuffer(gl, orbitProgram, TRAJECTORIES[cometKey], cometKey === 'VOYAGER' || cometKey === 'MACHHOLZ')
      return acc
    }, {})
  }


  const updateScene = (now) => {
    if (isPaused) return

    const deltaTime = now - previousTime
    previousTime = now
    time += deltaTime * speed * TIME_SCALE.SIMULATION_SPEED

    updateSimulationTime(time, currentDateElement)

    const camera = { angleX: cameraAngleX, angleY: cameraAngleY, distance: cameraDistance, focusTarget }

    drawScene({ time, gl, fieldOfViewRadians: degToRad(60), objectsToDraw, planets, comets, cometTrails, orbits, skybox, camera, sun, cometPositionHistory, TRAIL_LENGTH, frameCount })
    frameCount++

    requestAnimationFrame(updateScene)
  }

  requestAnimationFrame(updateScene)
}

function drawScene({ time, gl, fieldOfViewRadians, objectsToDraw, planets, comets, cometTrails, orbits, skybox, camera, sun, cometPositionHistory, TRAIL_LENGTH, frameCount }) {
  twgl.resizeCanvasToDisplaySize(gl.canvas)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight
  const projectionMatrix = m4.perspective(fieldOfViewRadians, aspectRatio, 10, 50000)

  const focusPosition = getFocusPosition(camera.focusTarget, time, planets, comets, sun)

  const cameraPosition = [
    focusPosition[0] + camera.distance * Math.sin(camera.angleY) * Math.cos(camera.angleX),
    focusPosition[1] + camera.distance * Math.cos(camera.angleY),
    focusPosition[2] + camera.distance * Math.sin(camera.angleY) * Math.sin(camera.angleX)
  ]

  const upVector = [0, 1, 0]
  const cameraMatrix = m4.lookAt(cameraPosition, focusPosition, upVector)

  const viewMatrix = m4.inverse(cameraMatrix)
  const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

  const lightPosition = [0, 0, 0]
  const lightColor = [1.5, 1.4, 1.2]
  const viewPosition = cameraPosition

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
  const orbitUniforms = { u_viewProjectionMatrix: viewProjectionMatrix, u_orbitColor: [0.4, 0.6, 1.0], u_alpha: 0.6 }
  twgl.setUniforms(orbits.program, orbitUniforms)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  Object.keys(orbits).forEach(objectKey => {
    if (objectKey !== 'program') {
      if (objectKey === 'HALLEY') {
        const halleyUniforms = { u_viewProjectionMatrix: viewProjectionMatrix, u_orbitColor: [1.0, 0.8, 0.2], u_alpha: 0.8 }
        twgl.setUniforms(orbits.program, halleyUniforms)
      } else if (objectKey === 'VOYAGER') {
        const voyagerUniforms = { u_viewProjectionMatrix: viewProjectionMatrix, u_orbitColor: [0.2, 0.8, 1.0], u_alpha: 0.8 }
        twgl.setUniforms(orbits.program, voyagerUniforms)
      } else {

      twgl.setUniforms(orbits.program, orbitUniforms)
      }

      gl.bindVertexArray(orbits[objectKey].vao)

      const isComet = objectKey === 'VOYAGER' || objectKey === 'MACHHOLZ' || objectKey === 'HALLEY'

      gl.drawArrays(isComet ? gl.LINES : gl.LINE_LOOP, 0, orbits[objectKey].numElements)
    }
  })

  gl.disable(gl.BLEND)

  const sunRotation = time * PLANETS_ROTATION_SPEED.get(PLANETS.SUN)
  const sunWorldMatrix = computeWorldMatrix([0, 0, 0], 0, sunRotation)
  const sunNormalMatrix = m4.transpose(m4.inverse(sunWorldMatrix))

  sun.uniforms.u_worldMatrix = sunWorldMatrix
  sun.uniforms.u_viewProjectionMatrix = viewProjectionMatrix
  sun.uniforms.u_normalMatrix = sunNormalMatrix
  sun.uniforms.u_time = time

  Object.keys(planets).forEach(planetKey => {
    const planet = PLANETS[planetKey]
    const planetRenderable = planets[planetKey]
    const planetRotationSpeed = PLANETS_ROTATION_SPEED.get(planet)

    const orbitalSpeed = PLANET_ORBITAL_SPEEDS.get(planet)
    const planetPosition = getBodyPosition(time * TIME_SCALE.ORBITAL_SPEED_MULTIPLIER * orbitalSpeed, TRAJECTORIES[planetKey])
    const planetRotation = time * planetRotationSpeed

    const worldMatrix = computeWorldMatrix(planetPosition, 0, planetRotation)
    const normalMatrix = m4.transpose(m4.inverse(worldMatrix))

    planetRenderable.uniforms.u_worldMatrix = worldMatrix
    planetRenderable.uniforms.u_viewProjectionMatrix = viewProjectionMatrix
    planetRenderable.uniforms.u_normalMatrix = normalMatrix
    planetRenderable.uniforms.u_lightPosition = lightPosition
    planetRenderable.uniforms.u_lightColor = lightColor
    planetRenderable.uniforms.u_viewPosition = viewPosition
  })

  Object.keys(comets).forEach(cometKey => {
    const comet = COMETS[cometKey]
    const cometRenderable = comets[cometKey]
    const speedInfo = COMET_SPEEDS.get(comet)

    const orbitalSpeed = COMET_ORBITAL_SPEEDS.get(comet)
    const cometPosition = getBodyPosition(time * TIME_SCALE.ORBITAL_SPEED_MULTIPLIER * orbitalSpeed, TRAJECTORIES[cometKey], cometKey === 'VOYAGER' || cometKey === 'MACHHOLZ')
    const cometRotation = time * speedInfo.rotation

    // Atualizar histórico de posições para o rastro (apenas a cada 5 frames)
    if (frameCount % 5 === 0) {
      if (!cometPositionHistory.has(cometKey)) {
        cometPositionHistory.set(cometKey, [])
      }
      const history = cometPositionHistory.get(cometKey)
      history.push([...cometPosition])
      if (history.length > TRAIL_LENGTH) {
        history.shift()
      }
    }

    const worldMatrix = computeWorldMatrix(cometPosition, 0, cometRotation)

    cometRenderable.uniforms.u_worldMatrix = worldMatrix
    cometRenderable.uniforms.u_viewProjectionMatrix = viewProjectionMatrix

    let cometColor

    switch (cometKey) {
      case 'HALLEY':
        cometColor = [1.0, 0.3, 0.1] // laranja
        break
      case 'VOYAGER':
        cometColor = [0.1, 0.8, 1.0] // azul
        break
      case 'MACHHOLZ':
        cometColor = [0.8, 0.1, 1.0] // rosa
        break
    }

    cometRenderable.uniforms.u_cometColor = cometColor
  })

  //  rastro dos cometas
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  Object.keys(comets).forEach(cometKey => {
    const history = cometPositionHistory.get(cometKey)
    if (!history || history.length < 2) return

    const cometTrailRenderable = cometTrails[cometKey]

    for (let i = 0; i < history.length - 1; i++) {
      const alpha = (1.0 - (i / (history.length - 1))) * 0.8
      const trailPosition = history[i]

      const trailWorldMatrix = computeWorldMatrix(trailPosition, 0, 0)
      const trailNormalMatrix = m4.transpose(m4.inverse(trailWorldMatrix))

      cometTrailRenderable.uniforms.u_worldMatrix = trailWorldMatrix
      cometTrailRenderable.uniforms.u_viewProjectionMatrix = viewProjectionMatrix
      cometTrailRenderable.uniforms.u_normalMatrix = trailNormalMatrix
      cometTrailRenderable.uniforms.u_lightPosition = lightPosition
      cometTrailRenderable.uniforms.u_lightColor = lightColor
      cometTrailRenderable.uniforms.u_trailColor = [1.0, 0.8, 0.2, 1.0] // cor dourada
      cometTrailRenderable.uniforms.u_alpha = alpha

      gl.useProgram(cometTrailRenderable.programInfo.program)
      gl.bindVertexArray(cometTrailRenderable.vao)
      twgl.setUniforms(cometTrailRenderable.programInfo, cometTrailRenderable.uniforms)
      twgl.drawBufferInfo(gl, cometTrailRenderable.buffer)
    }
  })

  gl.disable(gl.BLEND)

  objectsToDraw.forEach(function(object) {
    const programInfo = object.programInfo

    gl.useProgram(programInfo.program)
    gl.bindVertexArray(object.vertexArray)
    twgl.setUniforms(programInfo, object.uniforms)
    twgl.drawBufferInfo(gl, object.bufferInfo)
  })
}

function createPlanetsBuffer(gl, program, textures, scale) {
  const planets = {}

  Object.keys(PLANETS).forEach(planetKey => {
    if (planetKey === 'SUN') return

    const planet = PLANETS[planetKey]
    const radius = scale.get(planet)

    if (radius) {
      const detail = [16, 8]

      const buffer = flattenedPrimitives.createSphereBufferInfo(gl, radius, detail[0], detail[1])

      const uniforms = {
        u_worldMatrix: m4.identity(),
        u_viewProjectionMatrix: m4.identity(),
        u_normalMatrix: m4.identity(),
        u_texture: textures[planetKey],
        u_lightPosition: [0, 0, 0],
        u_lightColor: [1, 1, 1],
        u_viewPosition: [0, 0, 0],
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

function computeWorldMatrix(translation, xRotation, yRotation) {
  let matrix = m4.translation(translation[0], translation[1], translation[2])

  matrix = m4.xRotate(matrix, xRotation)
  return m4.yRotate(matrix, yRotation)
}

function createSkyboxBuffer(gl, program, texture) {
  const sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 40000, 32, 16)
  const vao = twgl.createVAOFromBufferInfo(gl, program, sphereBufferInfo)

  return {
    program,
    bufferInfo: sphereBufferInfo,
    vao,
    texture
  }
}

function createOrbitBuffer(gl, orbitProgram, trajectoryData, avoidSmootyTrajectory = false) {
  const smoothedTrajectory = avoidSmootyTrajectory ? trajectoryData : smoothTrajectory(trajectoryData, 5)
  const positions = []

  for (let i = 0; i < smoothedTrajectory.length; i++) {
    const point = smoothedTrajectory[i]
    const x = point.x * DISTANCE_SCALE_FACTOR
    const y = point.z * DISTANCE_SCALE_FACTOR
    const z = point.y * DISTANCE_SCALE_FACTOR

    positions.push(x, y, z)
  }

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 3, data: new Float32Array(positions) }
  })

  const vao = twgl.createVAOFromBufferInfo(gl, orbitProgram, bufferInfo)

  return { bufferInfo, vao, numElements: positions.length / 3 }
}

function getBodyPosition(time, trajectory, avoidSmoothTrajectory = false) {
  const smoothedTrajectory = avoidSmoothTrajectory ? trajectory : smoothTrajectory(trajectory, 5)
  const trajectoryLength = smoothedTrajectory.length

  const currentIndex = Math.floor((time % 1) * trajectoryLength)
  const nextIndex = (currentIndex + 1) % trajectoryLength

  const currentPoint = smoothedTrajectory[currentIndex]
  const nextPoint = smoothedTrajectory[nextIndex]

  const t = (time * trajectoryLength) % 1

  const x = currentPoint.x + (nextPoint.x - currentPoint.x) * t
  const y = currentPoint.z + (nextPoint.z - currentPoint.z) * t
  const z = currentPoint.y + (nextPoint.y - currentPoint.y) * t

  return [ x * DISTANCE_SCALE_FACTOR, y * DISTANCE_SCALE_FACTOR, z * DISTANCE_SCALE_FACTOR ]
}

function createCometsBuffer(gl, program, scale) {
  const comets = {}

  Object.keys(COMETS).forEach(cometKey => {
    const comet = COMETS[cometKey]
    const radius = scale.get(comet)

    if (radius) {
      const buffer = flattenedPrimitives.createSphereBufferInfo(gl, radius, 16, 8)

      const uniforms = {
        u_worldMatrix: m4.identity(),
        u_viewProjectionMatrix: m4.identity(),
        u_cometColor: [1, 1, 1]
      }

      comets[cometKey] = {
        buffer,
        uniforms,
        vao: twgl.createVAOFromBufferInfo(gl, program, buffer)
      }
    }
  })

  return comets
}

function createCometTrailsBuffer(gl, program, scale) {
  const cometTrails = {}

  Object.keys(COMETS).forEach((cometKey, index) => {
    const comet = COMETS[cometKey]
    const radius = scale.get(comet) * (index === 0 ? 0.8 : 0.5) // rastro um pouco menor que o cometa

    if (radius) {
      const buffer = flattenedPrimitives.createSphereBufferInfo(gl, radius, 12, 6)

      const uniforms = {
        u_worldMatrix: m4.identity(),
        u_viewProjectionMatrix: m4.identity(),
        u_normalMatrix: m4.identity(),
        u_lightPosition: [0, 0, 0],
        u_lightColor: [1, 1, 1],
        u_trailColor: [1.0, 0.8, 0.2, 1.0],
        u_alpha: 0.5
      }

      cometTrails[cometKey] = {
        buffer,
        uniforms,
        vao: twgl.createVAOFromBufferInfo(gl, program, buffer),
        programInfo: program
      }
    }
  })

  return cometTrails
}

function createSunBuffer(gl, program, texture, radius) {
  const buffer = flattenedPrimitives.createSphereBufferInfo(gl, radius, 24, 12)

  const uniforms = {
    u_worldMatrix: m4.identity(),
    u_viewProjectionMatrix: m4.identity(),
    u_normalMatrix: m4.identity(),
    u_texture: texture,
    u_time: 0,
  }

  return {
    buffer,
    uniforms,
    vao: twgl.createVAOFromBufferInfo(gl, program, buffer)
  }
}

function getFocusPosition(focusTarget, time, planets, comets, sun) {
  if (focusTarget === 'SUN') return [0, 0, 0]

  if (PLANETS[focusTarget]) {
    const orbitalSpeed = PLANET_ORBITAL_SPEEDS.get(PLANETS[focusTarget])
    return getBodyPosition(time * TIME_SCALE.ORBITAL_SPEED_MULTIPLIER * orbitalSpeed, TRAJECTORIES[focusTarget])
  }

  if (COMETS[focusTarget]) {
    const orbitalSpeed = COMET_ORBITAL_SPEEDS.get(COMETS[focusTarget])
    return getBodyPosition(time * TIME_SCALE.ORBITAL_SPEED_MULTIPLIER * orbitalSpeed, TRAJECTORIES[focusTarget], focusTarget === 'VOYAGER' || focusTarget === 'MACHHOLZ' )
  }

  return [0, 0, 0]
}

function updateSimulationTime(time, dateElement) {
  const totalEarthOrbits = time * TIME_SCALE.ORBITAL_SPEED_MULTIPLIER
  const totalDaysElapsed = totalEarthOrbits * PLANETS.EARTH.orbitalPeriod

  const currentDate = new Date(SIMULATION_START_DATE.getTime() + (totalDaysElapsed * 24 * 60 * 60 * 1000))

  dateElement.textContent = formatDate(currentDate)
}

main()

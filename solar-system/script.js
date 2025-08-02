"use strict"

import { DIRECTIONS, DISTANCE_SCALE_FACTOR, TEXTURES } from "./constants.js"
import { COMETS, COMET_DISPLAY_SCALE, COMET_SPEEDS, PLANETS, PLANET_DISPLAY_SCALE, PLANET_SPEEDS } from "./planets.js"
import { orbitFragmentShader, orbitVertexShader, skyboxFragmentShader, skyboxVertexShader, texturedFragmentShader, texturedVertexShader } from "./shaders.js"
import { HALLEY_TRAJECTORY } from "./trajectories/halleyTrajectory.js"
import { degToRad } from "./utils.js"

const height = document.documentElement.clientHeight

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
  let cameraDistance = 1500
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
    cameraDistance = Math.max(25, Math.min(25000, cameraDistance))
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

  const planetTextures = Object.keys(PLANETS).reduce((acc, planetKey) => {
    acc[planetKey] = twgl.createTexture(gl, {
      src: TEXTURES[planetKey],
      crossOrigin: ''
    })

    return acc
  }, {})

  const cometTextures = Object.keys(COMETS).reduce((acc, cometKey) => {
    acc[cometKey] = twgl.createTexture(gl, {
      src: TEXTURES[cometKey],
      crossOrigin: ''
    })
    return acc
  }, {})

  const skyboxTexture = twgl.createTexture(gl, { src: './assets/8k_stars_milky_way.jpg', crossOrigin: '' })
  
  const planets = createPlanetsBuffer(gl, planetsProgram, planetTextures, PLANET_DISPLAY_SCALE)
  const comets = createCometsBuffer(gl, planetsProgram, cometTextures, COMET_DISPLAY_SCALE)
  const skybox = createSkybox(gl, skyboxProgram, skyboxTexture)

  const objectsToDraw = [
    ...Object.keys(planets).map(planetKey => ({
      programInfo: planetsProgram,
      bufferInfo: planets[planetKey].buffer,
      vertexArray: planets[planetKey].vao,
      uniforms: planets[planetKey].uniforms,
    })),
    ...Object.keys(comets).map(cometKey => ({
      programInfo: planetsProgram,
      bufferInfo: comets[cometKey].buffer,
      vertexArray: comets[cometKey].vao,
      uniforms: comets[cometKey].uniforms,
    }))
  ]

  const orbits = {
    program: orbitProgram,
    ...Object.keys(PLANETS).reduce((acc, planetKey) => {
      const planet = PLANETS[planetKey]
      if (planetKey !== 'SUN') {
        acc[planetKey] = createOrbitBuffer(gl, orbitProgram, planet)
      }
      return acc
    }, {}),
    ...Object.keys(COMETS).reduce((acc, cometKey) => {
      if (cometKey === 'HALLEY') {
        acc[cometKey] = createCometOrbitBuffer(gl, orbitProgram, HALLEY_TRAJECTORY)
      }
      return acc
    }, {})
  }


  const updateScene = (now) => {
    if (isPaused) return

    const deltaTime = now - previousTime
    previousTime = now
    time += deltaTime * speed * direction * 0.0001

    const camera = { angleX: cameraAngleX, angleY: cameraAngleY, distance: cameraDistance }

    drawScene({ time, gl, fieldOfViewRadians: degToRad(60), objectsToDraw, planets, comets, orbits, skybox, camera })

    requestAnimationFrame(updateScene)
  }

  requestAnimationFrame(updateScene)
}

function drawScene({ time, gl, fieldOfViewRadians, objectsToDraw, planets, comets, orbits, skybox, camera }) {
  twgl.resizeCanvasToDisplaySize(gl.canvas)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight
  const projectionMatrix = m4.perspective(fieldOfViewRadians, aspectRatio, 10, 50000)

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
  const orbitUniforms = { u_viewProjectionMatrix: viewProjectionMatrix, u_orbitColor: [0.4, 0.6, 1.0], u_alpha: 0.6 }
  twgl.setUniforms(orbits.program, orbitUniforms)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  Object.keys(orbits).forEach(objectKey => {
    if (objectKey !== 'program') {
      if (objectKey === 'HALLEY') {
        const halleyUniforms = { u_viewProjectionMatrix: viewProjectionMatrix, u_orbitColor: [1.0, 0.8, 0.2], u_alpha: 0.8 }
        twgl.setUniforms(orbits.program, halleyUniforms)
      } else {
        twgl.setUniforms(orbits.program, orbitUniforms)
      }
      gl.bindVertexArray(orbits[objectKey].vao)
      gl.drawArrays(gl.LINE_STRIP, 0, orbits[objectKey].numElements)
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
      const planetPosition = getPlanetPosition(planet, time * 20)
      const planetRotation = time * speedInfo.rotation
      planetRenderable.uniforms.u_matrix = computeMatrix(viewProjectionMatrix, planetPosition, 0, planetRotation)
    }
  })

  Object.keys(comets).forEach(cometKey => {
    const comet = COMETS[cometKey]
    const cometRenderable = comets[cometKey]
    const speedInfo = COMET_SPEEDS.get(comet)

    if (cometKey === 'HALLEY') {
      const cometPosition = getCometPosition(time * 0.1)
      const cometRotation = time * speedInfo.rotation
      cometRenderable.uniforms.u_matrix = computeMatrix(viewProjectionMatrix, cometPosition, 0, cometRotation)
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

function getPlanetPosition(planet, time) {
  const { orbitDistanceFromSun, orbitalPeriod } = planet
  
  const radius = orbitDistanceFromSun * DISTANCE_SCALE_FACTOR
  const angle = (time * 2 * Math.PI) / orbitalPeriod
  
  const x = radius * Math.cos(angle)
  const y = 0
  const z = radius * Math.sin(angle)
  
  return [x, y, z]
}

function createOrbitBuffer(gl, orbitProgram, planet) {
  const { orbitDistanceFromSun } = planet
  const radius = orbitDistanceFromSun * DISTANCE_SCALE_FACTOR
  
  const positions = createCircularOrbit(radius, 256)

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 3, data: positions }
  })

  const vao = twgl.createVAOFromBufferInfo(gl, orbitProgram, bufferInfo)

  return { bufferInfo, vao, numElements: positions.length / 3 }
}

function createCircularOrbit(radius, segments = 128) {
  const positions = []
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    
    const x = radius * Math.cos(angle)
    const y = 0
    const z = radius * Math.sin(angle)
    
    positions.push(x, y, z)
  }
  
  return new Float32Array(positions)
}


function createPlanetsBuffer(gl, program, textures, scale) {
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
  const sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 40000, 32, 16)
  const vao = twgl.createVAOFromBufferInfo(gl, program, sphereBufferInfo)

  return {
    program,
    bufferInfo: sphereBufferInfo,
    vao,
    texture
  }
}

function createCometOrbitBuffer(gl, orbitProgram, trajectoryData) {
  const positions = []
  
  for (let i = 0; i < trajectoryData.length; i++) {
    const point = trajectoryData[i]
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

function getCometPosition(normalizedTime) {
  const trajectoryLength = HALLEY_TRAJECTORY.length
  const index = Math.floor((normalizedTime % 1) * trajectoryLength)
  const nextIndex = (index + 1) % trajectoryLength
  
  const currentPoint = HALLEY_TRAJECTORY[index]
  const nextPoint = HALLEY_TRAJECTORY[nextIndex]
  
  const t = (normalizedTime * trajectoryLength) % 1
  
  const x = currentPoint.x + (nextPoint.x - currentPoint.x) * t
  const y = currentPoint.z + (nextPoint.z - currentPoint.z) * t  
  const z = currentPoint.y + (nextPoint.y - currentPoint.y) * t
  
  return [
    x * DISTANCE_SCALE_FACTOR,
    y * DISTANCE_SCALE_FACTOR,
    z * DISTANCE_SCALE_FACTOR
  ]
}

function createCometsBuffer(gl, program, textures, scale) {
  const comets = {}

  Object.keys(COMETS).forEach(cometKey => {
    const comet = COMETS[cometKey]
    const radius = scale.get(comet)

    if (radius) {
      const buffer = flattenedPrimitives.createSphereBufferInfo(gl, radius, 16, 8)

      const uniforms = {
        u_colorMult: [1, 1, 1, 1],
        u_matrix: m4.identity(),
        u_texture: textures[cometKey],
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

main()

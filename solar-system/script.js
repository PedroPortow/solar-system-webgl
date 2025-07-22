"use strict"

import { vertexShader, fragmentShader, orbitVertexShader, orbitFragmentShader  } from "./shaders.js"
import { degToRad } from "./utils.js"
import { PLANETS, PLANET_DISPLAY_SCALE, PLANET_ORBITS_DISPLAY_SCALE, PLANET_SPEEDS } from "./planets.js"

function main() {
  const canvas = document.querySelector("#canvas")
  const gl = canvas.getContext("webgl2")

  twgl.setAttributePrefix("a_") // prefixo para os atributos

  const planetsProgram = twgl.createProgramInfo(gl, [vertexShader, fragmentShader])
  const orbitProgram = twgl.createProgramInfo(gl, [orbitVertexShader, orbitFragmentShader])

  const planets = createPlanetsRenderData(gl, planetsProgram, PLANET_DISPLAY_SCALE)

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
      const orbitRadius = PLANET_ORBITS_DISPLAY_SCALE.get(planet)

      if (orbitRadius) acc[planetKey] = createOrbitBuffer(gl, orbitProgram, orbitRadius)

      return acc
    }, {})
  }

  const fieldOfViewRadians = degToRad(60)

  requestAnimationFrame((time) => drawScene({ 
    time, 
    gl, 
    fieldOfViewRadians, 
    objectsToDraw, 
    planets,
    orbits 
  }))
}

function drawScene({ time, gl, fieldOfViewRadians, objectsToDraw, planets, orbits }) {
  time = time * 0.02

  twgl.resizeCanvasToDisplaySize(gl.canvas)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight
  const projectionMatrix = m4.perspective(fieldOfViewRadians, aspectRatio, 1, 2000)

  const cameraDistance = 200
  const cameraPosition = [0, cameraDistance * 0.4, cameraDistance]
  const lookVector = [0, 0, 0]
  const upVector = [0, 1, 0]
  const cameraMatrix = m4.lookAt(cameraPosition, lookVector, upVector)

  const viewMatrix = m4.inverse(cameraMatrix)
  const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

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

  console.log({planets})

  Object.keys(planets).forEach(planetKey => {
    const planet = PLANETS[planetKey]
    const planetRenderable = planets[planetKey]
    const speedInfo = PLANET_SPEEDS.get(planet)
    
    
    if (PLANETS[planetKey] === PLANETS.SUN) {
      const sunRotation = time * speedInfo.rotation
      planetRenderable.uniforms.u_matrix = computeMatrix(viewProjectionMatrix, [0, 0, 0], 0, sunRotation)
    } else {
      const orbitRadius = PLANET_ORBITS_DISPLAY_SCALE.get(planet)
      
      if (speedInfo && orbitRadius) {
        const orbitSpeed = time * speedInfo.orbit
        const translation = [
          Math.cos(orbitSpeed) * orbitRadius,
          0,
          Math.sin(orbitSpeed) * orbitRadius
        ]
        const rotation = time * speedInfo.rotation
        
        planetRenderable.uniforms.u_matrix = computeMatrix(viewProjectionMatrix, translation, 0, rotation)
      }
    }
  })

  objectsToDraw.forEach(function(object) {
    const programInfo = object.programInfo

    gl.useProgram(programInfo.program)
    gl.bindVertexArray(object.vertexArray)
    twgl.setUniforms(programInfo, object.uniforms)
    twgl.drawBufferInfo(gl, object.bufferInfo)
  })

  requestAnimationFrame((time) => drawScene({ time, gl, fieldOfViewRadians, objectsToDraw, planets, orbits }))
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

function createPlanetsRenderData(gl, program, scale) {
  const planets = {}

  Object.keys(PLANETS).forEach(planetKey => {
    const planet = PLANETS[planetKey]
    const radius = scale.get(planet)
    
    if (radius) {
      const detail = planetKey === 'SUN' ? [24, 12] : [16, 8]
      const buffer = flattenedPrimitives.createSphereBufferInfo(gl, radius, detail[0], detail[1])
      
      planets[planetKey] = {
        buffer,
        uniforms: { u_colorMult: planet.color, u_matrix: m4.identity() },
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

main()

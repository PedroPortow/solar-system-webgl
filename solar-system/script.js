"use strict"

import { vertexShader, fragmentShader } from "./shaders.js"
import { degToRad } from "./utils.js"

function main() {
  const canvas = document.querySelector("#canvas")
  const gl = canvas.getContext("webgl2")

  twgl.setAttributePrefix("a_") // prefixo para os atributos

  /**
  * @param {WebGL2RenderingContext} gl
  * @param {number} radius - raio
  * @param {number} subdivisionAxis - numero de subdivisões no eixo x
  * @param {number} subdivisionsHeight - numero de subdivisões no eixo y
  * @returns {Object}
  * @see https://twgljs.org/docs/module-twgl_primitives.html#.createSphereBufferInfo
  */
  const sunBuffer = flattenedPrimitives.createSphereBufferInfo(gl, 15, 12, 6)  // Sol r = 15, 12 segmentos, 6 subdivisões
  const planetBuffer = flattenedPrimitives.createSphereBufferInfo(gl, 8, 12, 6)  // Planeta r = 8, 12 segmentos, 6 subdivisões

  const programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader])

  const sunVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sunBuffer)
  const planetVAO = twgl.createVAOFromBufferInfo(gl, programInfo, planetBuffer)

  const sunUniforms = { u_colorMult: [1, 0.8, 0.2, 1], u_matrix: m4.identity() }
  const planetUniforms = { u_colorMult: [0.2, 0.5, 1, 1], u_matrix: m4.identity() }

  const objectsToDraw = [
    {
      programInfo: programInfo,
      bufferInfo: sunBuffer,
      vertexArray: sunVAO,
      uniforms: sunUniforms,
    },
    {
      programInfo: programInfo,
      bufferInfo: planetBuffer,
      vertexArray: planetVAO,
      uniforms: planetUniforms,
    },
  ]

  requestAnimationFrame((time) => drawScene({ time, gl, fieldOfViewRadians: degToRad(60), objectsToDraw, sunUniforms, planetUniforms }))
}

// calcula a matriz de transformação final 
// todo: mudar pra primeiro calcular todas as transformações e depois aplicar na viewProjectionMatrix?
function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
  // transalação + rotação x + rotação y
  let matrix = m4.translate(viewProjectionMatrix, translation[0],  translation[1],  translation[2]) 

  matrix = m4.xRotate(matrix, xRotation)
  return m4.yRotate(matrix, yRotation)
}

function drawScene({ time, gl, fieldOfViewRadians, objectsToDraw, sunUniforms, planetUniforms }) {
  time = time * 0.0005

  twgl.resizeCanvasToDisplaySize(gl.canvas)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight
  const projectionMatrix = m4.perspective(fieldOfViewRadians, aspectRatio, 1, 2000)

  // buildar a camera
  const cameraPosition = [0, 0, 120]
  const lookVector = [0, 0, 0]
  const upVector = [0, 1, 0]
  const cameraMatrix = m4.lookAt(cameraPosition, lookVector, upVector)

  const viewMatrix = m4.inverse(cameraMatrix)
  const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

  const sunTranslation = [0, 0, 0]
  sunUniforms.u_matrix = computeMatrix(viewProjectionMatrix, sunTranslation, 0, 0)

  // Planeta orbitando
  const planetOrbitRadius = 50
  const planetOrbitSpeed = time * 1.5

  const planetTranslation = [ Math.cos(planetOrbitSpeed) * planetOrbitRadius, 0, Math.sin(planetOrbitSpeed) * planetOrbitRadius]
  const planetRotation = time * 2

  planetUniforms.u_matrix = computeMatrix( viewProjectionMatrix, planetTranslation, 0, planetRotation)

  objectsToDraw.forEach(function(object) {
    const programInfo = object.programInfo

    gl.useProgram(programInfo.program)
    gl.bindVertexArray(object.vertexArray)
    twgl.setUniforms(programInfo, object.uniforms)
    twgl.drawBufferInfo(gl, object.bufferInfo)
  })

  requestAnimationFrame((time) => drawScene({ time, gl, fieldOfViewRadians, objectsToDraw, sunUniforms, planetUniforms }))
}

main()

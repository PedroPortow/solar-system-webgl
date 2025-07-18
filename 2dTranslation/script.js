const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

function main() {
  const canvas = document.querySelector("#canvas")
  const gl = canvas.getContext("webgl2")

  // Use our boilerplate utils to compile the shaders and link into a program
  const program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource])

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position")

  // look up uniform locations
  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution")
  const colorLocation = gl.getUniformLocation(program, "u_color")

  // Create a buffer
  const positionBuffer = gl.createBuffer()

  // Create a vertex array object (attribute state)
  const vao = gl.createVertexArray()

  gl.bindVertexArray(vao)
  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

  // First let's make some constiables
  // to hold the translation, width and height of the rectangle
  const translation = [0, 0]
  const width = 100
  const height = 30
  const color = [Math.random(), Math.random(), Math.random(), 1]

  drawScene()

  webglLessonsUI.setupSlider("#x", { slide: updatePosition(0), max: gl.canvas.width  })
  webglLessonsUI.setupSlider("#y", { slide: updatePosition(1), max: gl.canvas.height})

  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value
      drawScene()
    }
  }

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program)

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao)

    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

    // Update the position buffer with rectangle positions
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    setRectangle(gl, translation[0], translation[1], width, height)

    // Set a random color.
    gl.uniform4fv(colorLocation, color)

    // Draw the rectangle.
    const primitiveType = gl.TRIANGLES
    const offset = 0
    const count = 6
    gl.drawArrays(primitiveType, offset, count)
  }
}

// Fill the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
  const x1 = x
  const x2 = x + width
  const y1 = y
  const y2 = y + height
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW)
}


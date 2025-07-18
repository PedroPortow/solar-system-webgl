const vertexShaderSource = `#version 300 es

  uniform float uPointSize;
  uniform vec2 uPosition;

  void main() {
    gl_PointSize = uPointSize;
    gl_Position = vec4(uPosition, 0, 1);
  }
`

const fragmentShaderSource = `#version 300 es
  precision mediump float;
  out vec4 outColor;
  
  void main() {
    outColor = vec4(1, 0, 0.5, 1);
  }
`

const canvas = document.querySelector('canvas')
const gl = canvas.getContext('webgl2')

function resizeCanvas() {
  // Set the canvas size to match the window size
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  // Set the WebGL viewport to match the canvas size
  gl.viewport(0, 0, canvas.width, canvas.height)
}

function main() {
  const program = gl.createProgram()

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertexShader, vertexShaderSource)
  gl.compileShader(vertexShader)
  gl.attachShader(program, vertexShader)

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragmentShader, fragmentShaderSource)
  gl.compileShader(fragmentShader)
  gl.attachShader(program, fragmentShader)

  gl.linkProgram(program)

  // Checking logs is expensive as fuck apparently
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader))
    console.log(gl.getShaderInfoLog(fragmentShader))
  }

  gl.useProgram(program)

  resizeCanvas()

  const uPointSizeLoc = gl.getUniformLocation(program, 'uPointSize')
  const uPositionLoc = gl.getUniformLocation(program, 'uPosition')

  gl.uniform1f(uPointSizeLoc, 100)
  gl.uniform2f(uPositionLoc, 0, -1)

  gl.drawArrays(gl.POINTS, 0, 3)

  gl.uniform1f(uPointSizeLoc, 50)
  gl.uniform2f(uPositionLoc, 0, 0)

  gl.drawArrays(gl.POINTS, 0, 3)


  gl.uniform1f(uPointSizeLoc, 100)
  gl.uniform2f(uPositionLoc, 0, 0.5)

  gl.drawArrays(gl.POINTS, 0, 3)


  gl.uniform1f(uPointSizeLoc, 100)
  gl.uniform2f(uPositionLoc, 0, -0.3)

  gl.drawArrays(gl.POINTS, 0, 3)

}

// Handle window resize
window.addEventListener('resize', () => {
  resizeCanvas()
  // Redraw if needed
  gl.drawArrays(gl.POINTS, 0, 3)
})

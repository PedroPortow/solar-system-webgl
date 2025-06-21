const vertexShaderSource = `#version 300 es
  in vec4 posicao1; 
    
  void main() {
    gl_Position = posicao1;
  }
`;
 
const fragmentShaderSource = `#version 300 es
  precision mediump float;
  out vec4 outColor;
  
  void main() {
    outColor = vec4(1, 0, 0.5, 1);
  }
`;

function main() {
  const canvas = document.getElementById("myCanvas")
  const gl = canvas.getContext("webgl2")
  
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

  // Agora que temos o programa GLSL criado, precisamos passar dados para ele desenhar as coisas
  const program = createProgram(gl, vertexShader, fragmentShader) 

  // O posicao1 é o único atributo de input que temos declarado no vertex shader.
  // Vamos pegar a localização do atributo no programa (nome correto do atributo)
  const positionAttributeLocation = gl.getAttribLocation(program, "posicao1")
  console.log({positionAttributeLocation})

  // Cria um buffer para armazenar dados de vértices na GPU
  const positionBuffer = gl.createBuffer()
  // Associa o buffer à posição do atributo
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer) 

  // three 2d points
  const vertices = [
    0, 0,
    0, 0.5,
    0.7, 0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Agora que os dados estão no buffer da GPU
  const vao = gl.createVertexArray() // Vertex Array Object - funciona no WebGL 2.0
  gl.bindVertexArray(vao)

  // Habilita o atributo posicao1 para receber dados 
  gl.enableVertexAttribArray(positionAttributeLocation)

  // Define como os dados do buffer serão interpretados
  const size = 2;          // 2 components per iteration
  const type = gl.FLOAT;   // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  // Usa o programa antes de desenhar
  gl.useProgram(program)
  clearCanvas(gl)

  draw(gl, 0, 3, gl.TRIANGLES)
}

const draw = (gl, offset, count, type) => gl.drawArrays(type, offset, count)

function clearCanvas(gl, clearColor = [0.0, 0.0, 0.0, 1.0]) {
  gl.clearColor(...clearColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

/**
 * Cria um shader, compila e retorna o shader compilado
 * @param {*} gl - contexto webgl
 * @param {*} type - tipo de shader
 * @param {*} source - código fonte do shader
 * @returns - shader compilado
 */
function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  // se deu bom
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  } else {
    console.log("deu ruim no create shader")
    console.log(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
  }
}

/**
 * Cria um programa, liga os shaders e retorna o programa
 * @param {*} gl - contexto webgl
 * @param {*} vertexShader - shader de vértice
 * @param {*} fragmentShader - shader de fragmento
 * @returns - programa ligado
 */
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  gl.linkProgram(program)

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program
  } else {
    console.log("deu ruim no programa")
    console.log(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
  }
}

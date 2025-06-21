const canvas = document.getElementById("myCanvas")
const gl = canvas.getContext("webgl")

const program = gl.createProgram()

// Cria objetos shader individuais
const vertexShader = gl.createShader(gl.VERTEX_SHADER)
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

const vertexShaderSource = document.getElementById("vertex-shader").innerText
const fragmentShaderSource = document.getElementById("fragment-shader").innerText

gl.shaderSource(vertexShader, vertexShaderSource)  // Associa o código fonte ao shader
gl.compileShader(vertexShader)  // Compila o código GLSL

gl.shaderSource(fragmentShader, fragmentShaderSource)  // Associa o código fonte ao shader
gl.compileShader(fragmentShader)  // Compila o código GLSL

// Anexa ambos os shaders ao programa
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)

// Liga o programa - conecta vertex shader com fragment shader
gl.linkProgram(program)
gl.useProgram(program)

// Obtém a localização do atributo "a_position" no vertex shader
const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
// Habilita o atributo para receber dados
gl.enableVertexAttribArray(positionAttributeLocation)

// Cria um buffer para armazenar dados de vértices na GPU
const buffer = gl.createBuffer()
// Define as coordenadas dos vértices para formar dois triângulos (um quadrado)
// Cada par de números representa uma coordenada (x, y) no espaço normalizado (-1 a 1)
const vertices = [
  -0.5, 0.5,   // Vértice superior esquerdo
  -0.5, -0.5,  // Vértice inferior esquerdo  
  0.5, 0.5,    // Vértice superior direito
  0.5, 0.5,    // Vértice superior direito (repetido para segundo triângulo)
  -0.5, -0.5,  // Vértice inferior esquerdo (repetido para segundo triângulo)
  0.5, -0.5,   // Vértice inferior direito
]

// Vincula o buffer como o buffer ativo para operações de array
gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
// Carrega os dados dos vértices no buffer da GPU
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

// Configura como o atributo a_position deve ler dados do buffer
// (localização, tamanho por vértice, tipo de dados, normalizar?, stride, offset)
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

// Desenha os triângulos usando os dados do buffer
// (tipo primitivo, primeiro vértice, número de vértices)
gl.drawArrays(gl.TRIANGLES, 0, 6)

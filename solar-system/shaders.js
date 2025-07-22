export const vertexShader = `#version 300 es
  in vec4 a_position;
  in vec4 a_color;

  uniform mat4 u_matrix;

  out vec4 v_color;

  void main() {
    gl_Position = u_matrix * a_position;

    v_color = a_color;
  }
`

export const fragmentShader = `#version 300 es
  precision highp float;

  in vec4 v_color;

  uniform vec4 u_colorMult;

  out vec4 outColor;

  void main() {
    outColor = v_color * u_colorMult;
  }
`

export const orbitVertexShader = `#version 300 es
  in vec4 a_position;

  uniform mat4 u_viewProjectionMatrix;

  void main() {
    gl_Position = u_viewProjectionMatrix * a_position;
  }
`;

export const orbitFragmentShader = `#version 300 es
  precision mediump float;

  uniform vec3 u_orbitColor;
  uniform float u_alpha;

  out vec4 outColor;

  void main() {
    outColor = vec4(u_orbitColor, u_alpha);
  }
`; 

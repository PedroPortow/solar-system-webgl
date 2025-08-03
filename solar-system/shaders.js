
export const texturedVertexShader = `#version 300 es
  in vec4 a_position;
  in vec4 a_color;
  in vec2 a_texcoord;

  uniform mat4 u_matrix;

  out vec4 v_color;
  out vec2 v_texcoord;

  void main() {
    gl_Position = u_matrix * a_position;
    v_color = a_color;
    v_texcoord = a_texcoord;
  }
`

export const texturedFragmentShader = `#version 300 es
  precision highp float;

  in vec4 v_color;
  in vec2 v_texcoord;

  uniform vec4 u_colorMult;
  uniform sampler2D u_texture;
  uniform bool u_useTexture;

  out vec4 outColor;

  void main() {
    vec4 texColor = texture(u_texture, v_texcoord);
    outColor = texColor;
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

export const skyboxVertexShader = `#version 300 es
  in vec4 a_position;
  in vec2 a_texcoord;

  uniform mat4 u_viewProjectionMatrix;

  out vec2 v_texcoord;

  void main() {
    gl_Position = u_viewProjectionMatrix * a_position;
    v_texcoord = a_texcoord;
  }
`;

export const skyboxFragmentShader = `#version 300 es
  precision highp float;

  uniform sampler2D u_texture;

  in vec2 v_texcoord;

  out vec4 outColor;

  void main() {
    outColor = texture(u_texture, v_texcoord);
  }
`

export const bodyVertexShader = `#version 300 es
  in vec4 a_position;
  in vec3 a_normal;
  in vec2 a_texcoord;

  uniform mat4 u_worldMatrix;
  uniform mat4 u_viewProjectionMatrix;
  uniform mat4 u_normalMatrix;

  out vec3 v_normal;
  out vec3 v_worldPosition;
  out vec2 v_texcoord;

  void main() {
    vec4 worldPosition = u_worldMatrix * a_position;
    v_worldPosition = worldPosition.xyz;

    v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);

    v_texcoord = a_texcoord;

    gl_Position = u_viewProjectionMatrix * worldPosition;
  }
`;

/**
 * Créditos efeito de fresnel: @see {https://www.youtube.com/watch?v=tR67QJsFiFo&ab_channel=SketchpunkLabs}
 */
export const bodyFragmentShader = `#version 300 es
  precision highp float;

  in vec3 v_normal;
  in vec3 v_worldPosition;
  in vec2 v_texcoord;

  uniform sampler2D u_texture;
  uniform vec3 u_lightPosition;
  uniform vec3 u_lightColor;
  uniform vec3 u_viewPosition;
  uniform bool u_isEmissive;

  out vec4 outColor;

  void main() {
    vec4 texColor = texture(u_texture, v_texcoord);

    if (u_isEmissive) {
      outColor = texColor;
      return;
    }

    vec3 normal = normalize(v_normal);
    vec3 viewDirection = normalize(u_viewPosition - v_worldPosition);

    vec3 lightDirection = normalize(u_lightPosition - v_worldPosition);

    vec3 ambient = 0.2 * u_lightColor;

    float dotProduct = dot(normal, lightDirection);
    float diffuseIntensity = max(dotProduct, 0.0);
    vec3 diffuse = diffuseIntensity * u_lightColor;

    float rimDot = 1.0 - dot(normal, viewDirection);
    float fresnel = smoothstep(0.6, 1.0, rimDot);
    vec3 rim = fresnel * u_lightColor * 0.5;

    vec3 finalColor = ambient + diffuse + rim;

    outColor = vec4(finalColor, 1.0) * texColor;
  }
`

export const cometTrailVertexShader = `#version 300 es
  in vec4 a_position;
  in vec3 a_normal;
  in vec2 a_texcoord;

  uniform mat4 u_worldMatrix;
  uniform mat4 u_viewProjectionMatrix;
  uniform mat4 u_normalMatrix;

  out vec3 v_normal;
  out vec3 v_worldPosition;
  out vec2 v_texcoord;

  void main() {
    vec4 worldPosition = u_worldMatrix * a_position;
    v_worldPosition = worldPosition.xyz;

    v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);

    v_texcoord = a_texcoord;

    gl_Position = u_viewProjectionMatrix * worldPosition;
  }
`;

export const cometTrailFragmentShader = `#version 300 es
  precision highp float;

  in vec3 v_normal;
  in vec3 v_worldPosition;
  in vec2 v_texcoord;

  uniform vec3 u_lightPosition;
  uniform vec3 u_lightColor;
  uniform vec4 u_trailColor;
  uniform float u_alpha;

  out vec4 outColor;

  void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDirection = normalize(u_lightPosition - v_worldPosition);

    vec3 ambient = 0.3 * u_lightColor;

    float dotProduct = dot(normal, lightDirection);
    float diffuseIntensity = max(dotProduct, 0.0);
    vec3 diffuse = diffuseIntensity * u_lightColor;

    vec3 finalColor = ambient + diffuse;

    outColor = vec4(finalColor * u_trailColor.rgb, u_alpha);
  }
`;

export const cometVertexShader = `#version 300 es
  in vec4 a_position;

  uniform mat4 u_worldMatrix;
  uniform mat4 u_viewProjectionMatrix;

  void main() {
    gl_Position = u_viewProjectionMatrix * u_worldMatrix * a_position;
  }
`;

export const cometFragmentShader = `#version 300 es
  precision mediump float;

  uniform vec3 u_cometColor;

  out vec4 outColor;

  void main() {
    vec3 finalColor = u_cometColor * 1.5;

    outColor = vec4(finalColor, 1.0);
  }
`;

export const coronaVertexShader = `#version 300 es
  in vec4 a_position;
  in vec2 a_texcoord;

  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;
  uniform vec3 u_sunPosition;
  uniform float u_coronaSize;

  out vec2 v_texcoord;

  void main() {
    // ficar sempre "olhando" pra camera
    vec3 cameraRight = vec3(u_viewMatrix[0][0], u_viewMatrix[1][0], u_viewMatrix[2][0]);
    vec3 cameraUp = vec3(u_viewMatrix[0][1], u_viewMatrix[1][1], u_viewMatrix[2][1]);

    vec3 worldPosition = u_sunPosition +
                        (cameraRight * a_position.x * u_coronaSize) +
                        (cameraUp * a_position.y * u_coronaSize);

    gl_Position = u_projectionMatrix * u_viewMatrix * vec4(worldPosition, 1.0);
    v_texcoord = a_texcoord;
  }
`;

/** @see {https://www.shadertoy.com/view/7dGGWw} */
export const coronaFragmentShader = `#version 300 es
  precision highp float;

  in vec2 v_texcoord;

  uniform float u_time;
  uniform vec3 u_coronaColor;

  out vec4 outColor;

  void main() {
    float star_radius = 0.1;
    float glow_strength = 0.01;

    vec4 sphere = vec4(u_coronaColor, 1.0);
    outColor = vec4(0.0, 0.0, 0.0, 0.0);

    // Distance to center in normalized coordinates
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(center, v_texcoord);

    // Draw sphere
    if (dist <= star_radius) {
        outColor = sphere;
    }
    // Draw Glow
    else if (dist <= star_radius * 4.0) {
        float distance_fallof = min(1.0/((dist - star_radius) * (dist - star_radius) * 1.0 / glow_strength), 1.0);
        outColor = sphere * distance_fallof;
    }
  }
`;

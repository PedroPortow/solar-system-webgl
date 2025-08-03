
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

export const bodyFragmentShader = `#version 300 es
  precision highp float;

  in vec3 v_normal;
  in vec3 v_worldPosition;
  in vec2 v_texcoord;

  uniform sampler2D u_texture;
  uniform vec3 u_lightPosition;
  uniform vec3 u_lightColor;
  uniform bool u_isEmissive;

  out vec4 outColor;

  void main() {
    vec4 texColor = texture(u_texture, v_texcoord);
    
    if (u_isEmissive) {
      outColor = texColor;
      return;
    }
    
    vec3 normal = normalize(v_normal);
    
    vec3 lightDirection = normalize(u_lightPosition - v_worldPosition);
    
    vec3 ambient = 0.2 * u_lightColor;
    
    float dotProduct = dot(normal, lightDirection);
    float diffuseIntensity = max(dotProduct, 0.0);
    vec3 diffuse = diffuseIntensity * u_lightColor;
    
    vec3 finalColor = ambient + diffuse;
    
    outColor = vec4(finalColor, 1.0) * texColor;
  }
`

export const sunVertexShader = `#version 300 es
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

export const sunFragmentShader = `#version 300 es
  precision highp float;

  in vec3 v_worldPosition;
  in vec2 v_texcoord;

  uniform float u_time;
  uniform sampler2D u_texture;

  // 3D Simplex Noise from Stefan Gustavson
  // https://github.com/stegu/webgl-noise/blob/master/src/noise3D.glsl
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -1.0+0.5 = -0.5 = -D.y

    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to 1 frequent use of a larger texture.
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,7)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  // FBM (Fractal Brownian Motion)
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
        value += amplitude * snoise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
  }

  out vec4 outColor;

  void main() {
    float displacement = snoise(v_worldPosition * 0.01 + u_time * 0.1);
    
    vec3 noisyCoords = v_worldPosition * (1.0 + displacement * 0.2);
    
    float noise = fbm(noisyCoords * 0.005 + u_time * 0.05);
    noise = (noise + 1.0) * 0.5; // map to 0-1 range

    vec3 color1 = vec3(0.8, 0.2, 0.0); // Dark red
    vec3 color2 = vec3(1.0, 0.5, 0.0); // Orange
    vec3 color3 = vec3(1.0, 0.9, 0.5); // Bright yellow

    vec3 color = mix(color1, color2, smoothstep(0.3, 0.6, noise));
    color = mix(color, color3, smoothstep(0.6, 0.8, noise));

    float turbulence = fbm(v_worldPosition * 0.001 + u_time * 0.2);
    vec4 texColor = texture(u_texture, v_texcoord + turbulence * 0.1);

    outColor = vec4(color, 1.0) * texColor;
  }
`;

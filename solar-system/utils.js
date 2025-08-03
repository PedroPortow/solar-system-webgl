export function degToRad(d) {
  return d * Math.PI / 180;
}

/**
  Problema: Como estou usando dados reais das trajetórias, algumas órbitas não ficaram fechadas completamente ou
  ficaram com alguns pontos a mais na ellipse, causando algumas inconsistências no desenho.

  Precisei de uma função para "suavizar" essa trajetória, não consegui encontrar uma função pronta para isso
  então pedi pro chatgpt. Pedi algumas referências de problemas parecidos

  @see {https://medium.com/@steineckertommy/an-accurate-model-free-path-smoothing-algorithm-890fe383d163}
*/
export function smoothTrajectory(trajectory, windowSize = 5) {
  const smoothed = [];
  if (!trajectory.length) return []

  for (let i = 0; i < trajectory.length; i++) {
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    let count = 0;

    for (let j = -windowSize; j <= windowSize; j++) {
      const index = (i + j + trajectory.length) % trajectory.length;

      if (trajectory[index]) {
        sumX += trajectory[index].x;
        sumY += trajectory[index].y;
        sumZ += trajectory[index].z;
        count++;
      }
    }

    smoothed.push({
      x: sumX / count,
      y: sumY / count,
      z: sumZ / count,
    });
  }

  smoothed.push(smoothed[0]);

  return smoothed;
}

export function formatDate(date) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} de ${month} de ${year}`
}

export function loadTextures(gl, textureUrls, onProgress = () => {}) {
  const textureKeys = Object.keys(textureUrls)
  const totalTextures = textureKeys.length

  let loadedTextures = 0

  const loadPromises = textureKeys.map(key => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = ''

      image.onload = () => {
        try {
          const texture = twgl.createTexture(gl, {
            src: image,
            crossOrigin: ''
          })

          loadedTextures++
          onProgress(loadedTextures, totalTextures)

          resolve({ key, texture })
        } catch (error) {
          reject(error)
        }
      }

      image.src = textureUrls[key]
    })
  })

  return Promise.all(loadPromises).then(results => {
    const textures = {}

    results.forEach(({ key, texture }) => {
      textures[key] = texture
    })
    return textures
  })
}

export function loadSingleTextureAsync(gl, url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = '';

    image.onload = () => {
      try {
        const texture = twgl.createTexture(gl, {
          src: image,
          crossOrigin: ''
        });
        resolve(texture);
      } catch (error) {
        reject(error);
      }
    };

    image.src = url;
  });
}

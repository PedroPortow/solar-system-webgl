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

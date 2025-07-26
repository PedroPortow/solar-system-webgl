export function degToRad(d) {
  return d * Math.PI / 180;
}


// créditos: chatgpt 🤖
export function convertHGIToCartesian(radAU, latDeg, lonDeg, AU_TO_UNITS = 50) {
  const radius = radAU * AU_TO_UNITS
  const latRad = degToRad(latDeg)
  const lonRad = degToRad(lonDeg)
  
  const x = radius * Math.cos(latRad) * Math.cos(lonRad)
  const y = radius * Math.sin(latRad)
  const z = radius * Math.cos(latRad) * Math.sin(lonRad)
  
  return [x, y, z]
}

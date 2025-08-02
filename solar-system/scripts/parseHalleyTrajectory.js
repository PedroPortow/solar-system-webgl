#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function parseHalleyData(text) {
  const lines = text.trim().split('\n')
  const trajectoryData = []
  
  for (let i = 0; i < lines.length - 1; i += 1) {
    const positionLine = lines[i + 1].trim()
    
    // skipar aquelas outras bosta
    const positionMatch = positionLine.match(/X =\s*([-+]?\d+\.?\d*E?[+-]?\d*)\s*Y =\s*([-+]?\d+\.?\d*E?[+-]?\d*)\s*Z =\s*([-+]?\d+\.?\d*E?[+-]?\d*)/)
    if (!positionMatch) continue
    
    const x = parseFloat(positionMatch[1])
    const y = parseFloat(positionMatch[2]) 
    const z = parseFloat(positionMatch[3])
    
    trajectoryData.push({ x, y, z })
  }
  
  return trajectoryData
}

function convertTrajectory(inputPath, outputPath) {
  const inputData = fs.readFileSync(inputPath, 'utf8')
  const trajectoryData = parseHalleyData(inputData)
  
  const jsCode = `export const HALLEY_TRAJECTORY = ${JSON.stringify(trajectoryData, null, 2)};`
  
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  fs.writeFileSync(outputPath, jsCode, 'utf8')
  console.log(`deu bom, tá no path de saida`)
}

const args = process.argv.slice(2)

if (args.length !== 2) {
  console.error('deu ruim, tem q ter 2 argumentos (arquivo de entrada e arquivo de saída)')
  process.exit(1)
}

const [inputPath, outputPath] = args
convertTrajectory(inputPath, outputPath)

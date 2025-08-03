#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function parseTextData(text) {
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

function convertFile(inputPath, outputPath) {
  const inputData = fs.readFileSync(inputPath, 'utf8')
  const trajectoryData = parseTextData(inputData)

  const jsCode = `export const ${name.toUpperCase()}_TRAJECTORY = ${JSON.stringify(trajectoryData, null, 2)};`

  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputPath, jsCode, 'utf8')
  console.log(`deu bom, tá no path de saida`)
}

const args = process.argv.slice(2)

if (args.length !== 3) {
  console.error('deu ruim, tem q ter3 argumentos (arquivo de entrada e arquivo de saída e nome da const)')
  process.exit(1)
}

const [inputPath, outputPath, name] = args
convertFile(inputPath, outputPath, name)

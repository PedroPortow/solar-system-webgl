#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function parseTextData(text) {
  const lines = text.trim().split('\n')
  const data = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // poulando aqueles cabecalhos
    if (!line || line.includes('YEAR') || line.includes('DAY')) continue

    const parts = line.split(/\s+/)

    if (parts.length >= 6) {
      const entry = {
        "YEAR": parseInt(parts[0]),
        "DAY": parseInt(parts[1]),
        "HR": parseInt(parts[2]),
        "RAD_AU": parseFloat(parts[3]),
        "HGI_LAT": parseFloat(parts[4]),
        "HGI_LON": parseFloat(parts[5])
      }

      data.push(entry)
    }
  }

  return data
}

function convertFile(inputPath, outputPath, planetName) {
  const inputData = fs.readFileSync(inputPath, 'utf8')

  const convertedData = parseTextData(inputData)

  if (convertedData.length === 0) {
    console.error('de ruim chefe, n tem nada no arquivo de entrada')
  }

  const jsCode = `export const ${planetName}_TRAJECTORY = ${JSON.stringify(convertedData, null, 2)};`

  const outputDir = path.dirname(outputPath)

  if (!fs.existsSync(outputDir)) { // botou uma pasta de saida mas ainda n tem
      fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputPath, jsCode, 'utf8')

  console.log('deu bom, tá no path de saida')
}

const args = process.argv.slice(2)
console.log(args)

if (args.length !== 3) {
  console.error(`tem q ter 3 argumentos (arquivo de entrada, arquivo de saída e nome do planeta em maisculo)`)
  process.exit(1)
}

const [inputPath, outputPath, planetName] = args

convertFile(inputPath, outputPath, planetName)

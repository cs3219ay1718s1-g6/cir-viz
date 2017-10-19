#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync, spawnSync } = require('child_process')
const argv = require('minimist')(process.argv.slice(2))

const DATA_FILE_NAME = 'papers.json'

if (!fs.existsSync(path.join(__dirname, DATA_FILE_NAME))) {
    console.error(`Data file named ${DATA_FILE_NAME} doesn't exist. Download before continuing`)
    process.exit()
}

const databasePath = argv.d || argv.database
if (typeof databasePath === 'undefined') {
    console.log('Database path must be specified, use -d or --database to specify')
    process.exit(0)
}

// Save the created files somewhere
let generatedFiles = []

// Start the script
console.log("Data file %s exists, processing...", DATA_FILE_NAME)

const CSV_GENERATORS = [
    { script: 'processAuthors.js',       output: 'authors.csv'      },
    { script: 'processVenues.js',        output: 'venues.csv'       },
    { script: 'processPapers.js',        output: 'papers.csv'       },
    { script: 'processCitations.js',     output: 'citations.csv'    },
    { script: 'processContributions.js', output: 'contributions.csv'}
]

// Output CSV files
let csvPromises = []
for (let generator of CSV_GENERATORS) {
    let generatedCsvPath = path.join(__dirname, generator.output)
    let writeStream = fs.createWriteStream(generatedCsvPath)

    csvPromises.push(new Promise(resolve => {
        writeStream.on('open', () => {
            console.log('[INFO] Generating %s...', generator.output)
            let command = 'node'
            let args = [path.join(__dirname, generator.script)]
            spawnSync(command, args, {
                stdio: ['pipe', writeStream, 'pipe']
            })

            generatedFiles.push(generatedCsvPath)
            resolve()
        })

    }))
}

Promise.all(csvPromises).then(() => {
    const CYPHER_SCRIPTS = [
        { template: 'import_authors.example.cypher', file: 'authors.csv' },
        { template: 'import_venues.example.cypher', file: 'venues.csv' },
        { template: 'import_papers.example.cypher', file: 'papers.csv' },
        { template: 'connect_papers_venues.example.cypher', file: 'papers.csv' },
        { template: 'connect_contributions.example.cypher', file: 'contributions.csv' },
        { template: 'connect_citations.example.cypher', file: 'citations.csv' }
    ]

    let promise = Promise.resolve()

    for (let cypherScript of CYPHER_SCRIPTS) {
        let scriptName = cypherScript.template.replace(".example", "")
        console.log('[INFO] Creating Cypher script %s...', scriptName)
        const templateContents = fs.readFileSync(path.join(__dirname, cypherScript.template), 'utf8')
        const scriptContents = templateContents.replace(
            '$FILENAME$',
            '//' + path.join(__dirname, cypherScript.file)
        )

        let scriptFilePath = path.join(__dirname, scriptName)
        fs.writeFileSync(scriptFilePath, scriptContents, 'utf8')

        generatedFiles.push(scriptFilePath)

        console.log('[INFO] Executing Cypher script %s...', scriptName)

        let command = 'neo4j-shell'
        let args = [
            '-path', databasePath,
            '-file', scriptFilePath,
            '-v'
            ]

        execSync(command + ' ' + args.join(' '))
    }

    // Clean up
    console.log('Cleaning up...')
    for (let filePath of generatedFiles) {
        console.log('Removing %s...', path.basename(filePath))
        fs.unlinkSync(filePath)
    }
})

require('dotenv').config()
const express = require('express')
const neo4j = require('neo4j-driver').v1

const databaseUri = process.env.DATABASE_URI || 'bolt://localhost:7687/'
const neo4jUser = process.env.NEO4J_USERNAME
const neo4jPass = process.env.NEO4J_PASSWORD

const app = express()
const driver = neo4j.driver(databaseUri, neo4j.auth.basic(neo4jUser, neo4jPass))
const session = driver.session()
const { getVenueId } = require('./processing/utils')

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(express.static('views'))

// Routes
app.get('/authors/top', (req, res) => {
    let count = parseInt(req.query.count) || 10
    let query = 'MATCH (a:Author)-[:CONTRIB_TO]->(p:Paper)'
    if (req.query.venue) {
        let venueId = getVenueId(req.query.venue.toString().trim())
        query += `-[:WITHIN]->(v:Venue) WHERE v.venueID = '${venueId}'`
    }
    query += ' WITH a.authorName AS AuthorName, COUNT(p) AS Papers'
    query += ' ORDER BY Papers DESC '
    query += ` RETURN AuthorName, Papers LIMIT ${count};`
    session.run(query).then(result => {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(result.records.map(r => ({
            author: r.get(0),
            count: Math.max(r.get(1).low, r.get(1).high)
        }))))
    }).catch(err => {
        res.send(err.message)
    })
})

app.get('/papers/top', (req, res) => {
    let count = parseInt(req.query.count) || 10
    let query = 'MATCH (p2:Paper)-[:CITES]->(p1:Paper)'
    if (req.query.venue) {
        let venueId = getVenueId(req.query.venue.toString().trim())
        query += `-[:WITHIN]->(v:Venue) WHERE v.venueID = '${venueId}'`
    }
    query += ' WITH p1.paperTitle AS Title, COUNT(p2) AS CitedIn'
    query += ' ORDER BY CitedIn DESC '
    query += ` RETURN Title, CitedIn LIMIT ${count};`

    session.run(query).then(result => {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(result.records.map(r => ({
            title: r.get(0),
            citedIn: Math.max(r.get(1).low, r.get(1).high)
        }))))
    }).catch(err => {
        res.send(err.message)
    })
})

app.get('/papers/trend', (req, res) => {
    let query = 'MATCH (p:Paper)'
    if (req.query.venue) {
        let venueId = getVenueId(req.query.venue.toString().trim())
        query += `-[:WITHIN]->(v:Venue) WHERE v.venueID = '${venueId}'`
    }
    query += ' WITH p.paperYear as Year, COUNT(p) AS Papers'
    query += ' ORDER BY Year ASC'
    query += ' RETURN Year, Papers;'

    session.run(query).then(result => {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(result.records.map(r => ({
            year: r.get(0).low,
            count: r.get(1).low
        }))))
    }).catch(err => {
        res.send(err.message)
    })
})

app.get('/phrases/top', (req, res) => {
    let count = parseInt(req.query.count) || 10
    let query = 'MATCH (ph:Phrase)<-[:CONTAINS]-(pa:Paper)'
    if (req.query.venue) {
        let venueId = getVenueId(req.query.venue.toString().trim())
        query += `-[:WITHIN]->(v:Venue) WHERE v.venueID = '${venueId}'`
    }
    query += ' WITH ph.phraseValue AS Phrase, COUNT(pa) AS Frequency'
    query += ' ORDER BY Frequency DESC'
    query += ` RETURN Phrase, Frequency LIMIT ${count};`

    session.run(query).then(result => {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(result.records.map(r => ({
            phrase: r.get(0),
            frequency: Math.max(r.get(1).low, r.get(1).high)
        }))))
    }).catch(err => {
        res.send(err.message)
    })
})

app.get('/papers/web', (req, res) => {
    let paperTitle = req.query.title
    if (!paperTitle) {
        res.send('params \'title\' is missing')
    } else {
        paperTitle = paperTitle.trim()
        let count = parseInt(req.query.count) || 2
        let query = `MATCH p = (p0:Paper)<-[:CITES*..${count}]-(px:Paper)`
        query += ` WHERE toLower(p0.paperTitle) = toLower('${paperTitle}')`
        query += ' RETURN p;'

        session.run(query).then(result => {
            let citations = new Set()
            let papers = {}

            const mergePaper = (paper, level) => {
                if (!papers.hasOwnProperty(paper.paperID)) {
                    papers[paper.paperID] = {
                        id: paper.paperID,
                        title: paper.paperTitle,
                        year: Math.max(
                            paper.paperYear.low,
                            paper.paperYear.high
                        ),
                        level: level
                    }
                } else if (papers.hasOwnProperty(paper.paperId) &&
                           papers[paper.paperId].level > level) {

                    papers[paper.paperId].level = level
                }
            }

            for (let r of result.records) {
                for (let i = 0; i < r.get(0).segments.length; ++i) {
                    let segment = r.get(0).segments[i]
                    // Resolve nodes
                    mergePaper(segment.start.properties, i)
                    mergePaper(segment.end.properties, i + 1)
                    let fromId = segment.start.properties.paperID
                    let toId = segment.end.properties.paperID
                    citations.add(`${fromId}->${toId}`)
                }
            }
            let data = {
                nodes: Object.values(papers),
                links: [...citations.values()].map(c => {
                    let [ source, target ] = c.split('->')
                    return { source, target }
                })
            }

            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify(data))
        }).catch(err => {
            res.send(err.message)
        })
    }
})

// Get authors for a particular paper
app.get('/papers/:paperid/authors', (req, res) => {
    let paperId = req.params.paperid.replace(/[^a-f0-9]+/g, '')
    let query = 'MATCH (p:Paper)<-[:CONTRIB_TO]-(a:Author)'
    query += ` WHERE p.paperID = '${paperId}'`
    query += ' RETURN a.authorName;'
    session.run(query).then(result => {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify({
            authors: result.records.map(r => r.get(0))
        }))
    }).catch(err => {
        res.send(err.message)
    })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log('CIR server listening on port ' + port))


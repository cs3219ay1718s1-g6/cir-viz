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

const port = process.env.PORT || 3000
app.listen(port, () => console.log('CIR server listening on port ' + port))


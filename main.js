require('dotenv').config()
const express = require('express')
const neo4j = require('neo4j-driver').v1

const databaseUri = process.env.DATABASE_URI || 'bolt://localhost:7687/'
const neo4jUser = process.env.NEO4J_USERNAME
const neo4jPass = process.env.NEO4J_PASSWORD

const app = express()
const driver = neo4j.driver(databaseUri, neo4j.auth.basic(neo4jUser, neo4jPass))
const session = driver.session()

session.run(
    'CREATE (a:Person {name: $name}) RETURN a',
    { name: 'Alice' }
).then(result => {
    session.close()
    const record = result.records[0]
    const node = record.get(0)
    console.log(node.properties.name)
    driver.close()
}).catch(error => {
    console.error(error)
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})



const port = process.env.PORT || 3000
app.listen(port, () => console.log('CIR server listening on port ' + port))


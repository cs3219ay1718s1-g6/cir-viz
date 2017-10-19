const lineReader = require('./lineReader')

const FILE_NAME = 'papers-sample.json'
const DELIM = ';'

const authorIds = new Set()
const lr = lineReader(FILE_NAME)

console.log(`id${DELIM}name`)
lr(line => {
    // Process line data
    let data = JSON.parse(line.trim())
    if (data.hasOwnProperty('authors') &&
        data.authors.length > 0) {

        data.authors.filter(a => a.ids.length > 0).forEach(author => {
            let authorId = author.ids[0]
            if (!authorIds.has(authorId)) {
                authorIds.add(authorId)
                console.log(authorId + DELIM + author.name)
            }
        })
    }
})


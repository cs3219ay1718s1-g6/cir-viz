const lineReader = require('./lineReader')

const FILE_NAME = 'papers.json'
const DELIM = ';'

const authorIds = new Set()
const lr = lineReader(FILE_NAME)

console.log('%s%s%s', 'AuthorID', DELIM, 'AuthorName')
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


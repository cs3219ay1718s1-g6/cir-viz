const lineReader = require('./lineReader')
const { getVenueId, csvStringify } = require('./utils')

const FILE_NAME = 'papers.json'
const DELIM = ';'
const KEYS = ['FromPaperID', 'ToAuthorID']

const contribMap = {}
const lr = lineReader(FILE_NAME)

console.log(KEYS.join(DELIM))
lr(line => {
    // Process line data
    let data = JSON.parse(line.trim())
    if (data.hasOwnProperty('id') &&
        data.hasOwnProperty('title') &&
        data.hasOwnProperty('authors') &&
        data.title.trim().length > 0) {

        let authors = data.authors.filter(a => a.ids.length > 0 && a.name.trim().length > 0)

        if (authors.length > 0) {
            // Create the base paper
            for (let authId of authors.map(a => a.ids[0])) {
                console.log("%s%s%s", data.id, DELIM, authId)
            }
        }
    }
})



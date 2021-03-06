const lineReader = require('./lineReader')
const { getVenueId, csvStringify } = require('./utils')

const FILE_NAME = 'papers.json'
const DELIM = ';'
const KEYS = ['PaperID', 'PaperTitle', 'PaperVenueID', 'PaperYear']

const papers = {}
const lr = lineReader(FILE_NAME)

console.log(KEYS.join(DELIM))
lr(line => {
    // Process line data
    let data = JSON.parse(line.trim())
    if (data.hasOwnProperty('id') &&
        data.hasOwnProperty('title') &&
        data.hasOwnProperty('authors') &&
        data.title.trim().length > 0 &&
        data.authors.filter(a => a.ids.length > 0 && a.name.trim().length > 0).length > 0) {

        papers[data.id] = {
            PaperID: data.id,
            PaperAbstract: data.paperAbstract,
            PaperTitle: data.title.replace(/[\r\n"]+/g, ''),
            PaperVenueID: getVenueId(data.venue.trim()),
            PaperYear: data.year
        }
    }
}, () => {
    for (let key in papers) {
        let paper = papers[key]
        let row = KEYS.map(key => paper[key] || '')
        console.log(csvStringify(row, DELIM))
    }
})



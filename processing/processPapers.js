const lineReader = require('./lineReader')
const { getVenueId, csvSanitize } = require('./utils')

const FILE_NAME = 'papers-sample.json'
const DELIM = ';'
const KEYS = ['PaperID', 'PaperAbstract', 'PaperTitle', 'PaperVenueID', 'PaperYear']

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
            PaperAbstract: csvSanitize(data.paperAbstract, DELIM),
            PaperTitle: csvSanitize(data.title, DELIM),
            PaperVenueID: getVenueId(data.venue.trim()),
            PaperYear: data.year
        }
    }
}, () => {
    for (let key in papers) {
        let paper = papers[key]
        let row = [key]
        Array.prototype.push.apply(row, KEYS.map(key => paper[key] || ''))
        console.log(row.join(DELIM))
    }
})



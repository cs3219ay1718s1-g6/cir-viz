const lineReader = require('./lineReader')
const { csvStringify } = require('./utils')

const FILE_NAME = 'papers.json'
const DELIM = ';'

const lr = lineReader(FILE_NAME)

console.log('%s%s%s', 'PaperID', 'Phrase')
lr(line => {
    let data = JSON.parse(line.trim())
    if (data.hasOwnProperty('id') &&
        data.hasOwnProperty('title') &&
        data.hasOwnProperty('authors') &&
        data.title.trim().length > 0 &&
        data.authors.filter(a => a.ids.length > 0 && a.name.trim().length > 0).length > 0 &&
        data.keyPhrases && 
        data.keyPhrases.length) {

        data.keyPhrases.forEach(phrase => {
            console.log("%s%s%s", data.id, DELIM, csvStringify(phrase))
        })
    }
})

const lineReader = require('./lineReader')
const { getVenueId, csvStringify } = require('./utils')

const FILE_NAME = 'papers.json'
const DELIM = ';'
const KEYS = ['FromPaperID', 'ToPaperID']

const citationMap = {}
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

        // Create the base paper
        if (!citationMap.hasOwnProperty(data.id)) {
            citationMap[data.id] = new Set()
        }

        // Add out-citations
        for (let outId of data.outCitations) {
            citationMap[data.id].add(outId)
        }
    }

}, () => {
    for (let key in citationMap) {
        let outIds = [...citationMap[key].values()]
        let presentIds = outIds.filter(id => citationMap.hasOwnProperty(id))
        presentIds.forEach(outId => {
            console.log("%s%s%s", key, DELIM, outId)
        })
    }
})



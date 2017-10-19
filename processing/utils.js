const { Stringifier } = require('csv-stringify')

module.exports = {
    getVenueId (venue) {
        return venue.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w]+/g, '')
            .replace(/_{2,}/g, '_')
    },

    csvStringify (data, delim) {
        let stringifier = new Stringifier({
            delimiter: delim
        })
        return stringifier.stringify(data)
    }

}


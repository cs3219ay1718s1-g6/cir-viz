const stringify = require('csv-stringify')
i
module.exports = {
    getVenueId (venue) {
        return venue.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w]+/g, '')
            .replace(/_{2,}/g, '_')
    },

    csvSanitize (string, delim) {
    }

}


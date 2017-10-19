const lineReader = require('./lineReader')
const { getVenueId, csvSanitize } = require('./utils')

const FILE_NAME = 'papers-sample.json'
const DELIM = ';'

const venueIds = {}
const lr = lineReader(FILE_NAME)

console.log(`VenueID${DELIM}VenueName`)
lr(line => {
    // Process line data
    let data = JSON.parse(line.trim())
    if (data.hasOwnProperty('venue')) {

        let venue = csvSanitize(data.venue.trim(), DELIM)

        // If there is indeed a venue
        if (venue.length > 0) {
            // Calculate its ID
            let venueId = getVenueId(venue)
            if (!venueIds.hasOwnProperty(venueId)) {
                venueIds[venueId] = venue
            } else if (venueIds[venueId] != venue) {
                // Update new venue name
                let prevCount = (venueIds[venueId].match(/\b[A-Z]/g) || []).length
                let currCount = (venue.match(/\b[A-Z]/g) || []).length
                if (currCount > prevCount) {
                    venueIds[venueId] = venue
                }
            }
        }
    }
}, () => {
    for (let key in venueIds) {
        console.log(key + DELIM + venueIds[key])
    }
})



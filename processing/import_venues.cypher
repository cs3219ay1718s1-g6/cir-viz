USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:///Users/maianhvu/Development/javascript/cir-viz/processing/venues.csv" AS row
CREATE (:Venue {venueID: row.VenueID, venueName: row.venueName});

CREATE INDEX ON :Venue(venueID);
CREATE INDEX ON :Venue(venueName);

schema await;

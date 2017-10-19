DROP INDEX ON :Venue(venueID);
DROP INDEX ON :Venue(venueName);

MATCH (v: Venue)
DETACH DELETE v;

USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:$FILENAME$" AS row FIELDTERMINATOR ';'
CREATE (:Venue {venueID: row.VenueID, venueName: row.VenueName});

CREATE INDEX ON :Venue(venueID);
CREATE INDEX ON :Venue(venueName);

schema await

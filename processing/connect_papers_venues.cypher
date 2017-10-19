USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:///Users/maianhvu/Development/javascript/cir-viz/processing/papers.csv" AS row FIELDTERMINATOR ';'
MATCH (paper:Paper {paperID: row.PaperID})
MATCH (venue:Venue {venueID: row.PaperVenueID})
MERGE (paper)-[:WITHIN]->(venue);

USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:///Users/maianhvu/Development/javascript/cir-viz/processing/citations.csv" AS row FIELDTERMINATOR ';'
MATCH (pfrom:Paper {paperID: row.FromPaperID})
MATCH (pto:Paper {paperID: row.ToPaperID})
MERGE (pfrom)-[:CITES]->(pto);


USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:$FILENAME$" AS row FIELDTERMINATOR ';'
MATCH (paper:Paper {paperID: row.FromPaperID})
MATCH (author:Author {authorID: row.ToAuthorID})
MERGE (author)-[:CONTRIB_TO]->(paper);


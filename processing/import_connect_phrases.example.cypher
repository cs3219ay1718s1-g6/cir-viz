CREATE INDEX ON :Phrase(phraseValue);

schema await

USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:$FILENAME$" AS row FIELDTERMINATOR ';'
MERGE (:Phrase {phraseValue: row.Phrase});

USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:$FILENAME$" AS row FIELDTERMINATOR ';'
MATCH (paper:Paper {paperID: row.PaperID})
MATCH (phrase:Phrase {phraseValue: row.Phrase})
MERGE (paper)-[:CONTAINS]->(phrase);

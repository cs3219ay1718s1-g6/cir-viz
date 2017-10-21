USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:$FILENAME$" AS row FIELDTERMINATOR ';'
MERGE (:Word {wordValue: row.Word});

CREATE INDEX ON :Word(wordValue);

schema await

USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:$FILENAME$" AS row FIELDTERMINATOR ';'
MATCH (paper:Paper {paperID: row.PaperID})
MATCH (word:Word {wordValue: row.Word})
MERGE (paper)-[:CONTAINS]->(word);

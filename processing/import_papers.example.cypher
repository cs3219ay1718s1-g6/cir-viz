DROP INDEX ON :Paper(paperID);
DROP INDEX ON :Paper(paperTitle);

MATCH (p: Paper)
DETACH DELETE p;

USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:$FILENAME$" AS row FIELDTERMINATOR ';'
CREATE (:Paper {paperID: row.PaperID, paperTitle: row.PaperTitle, paperYear: toInt(row.PaperYear) });

CREATE INDEX ON :Paper(paperID);
CREATE INDEX ON :Paper(paperTitle);

schema await


USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:///Users/maianhvu/Development/javascript/cir-viz/processing/papers.csv" AS row FIELDTERMINATOR ';'
CREATE (:Paper {paperID: row.PaperID, paperTitle: row.PaperTitle, paperYear: toInt(row.PaperYear) });

CREATE INDEX ON :Paper(paperID);
CREATE INDEX ON :Paper(paperTitle);

schema await


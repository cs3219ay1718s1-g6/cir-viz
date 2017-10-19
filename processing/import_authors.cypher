USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:///Users/maianhvu/Development/javascript/cir-viz/processing/authors.csv" AS row
CREATE (:Author {authorID: row.id, authorName: row.name});

CREATE INDEX ON :Author(authorID);
CREATE INDEX ON :Author(authorName);

schema await;

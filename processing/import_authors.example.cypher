USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM "file:$FILENAME$" AS row FIELDTERMINATOR ';'
CREATE (:Author {authorID: row.AuthorID, authorName: row.AuthorName});

CREATE INDEX ON :Author(authorID);
CREATE INDEX ON :Author(authorName);

schema await

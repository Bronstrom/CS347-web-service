const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
// Start up service & add middleware for unpackaging large JSON bodies
const service = express();
service.use(express.json());

// Read & deserialize credentials
const json = fs.readFileSync('credentials.json', 'utf8');
const credentials = JSON.parse(json);

// Establish connection with database
const connection = mysql.createConnection(credentials);
connection.connect(error => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});

// Provides a complete row for a photo
function rowToPhoto(row) {
  return {
    id: 	row.id,
    year:	row.year,
    month:	row.month,
    day:	row.day,
    imgName:	row.imgName,
    imgLink:	row.imgLink,
    imgDesc:	row.imgDesc,
    awesome:	row.awesome,
    nice:	row.nice,
    meh: 	row.meh,
    boo:	row.boo,
  }
}

/* TODO: REMOVE these samples below*/
// Grab photos in database if existant
/*const selectQuery = 'SELECT * FROM photo';
connection.query(selectQuery, (error, rows) => {
  if (error) {
    console.error(error);
  } else {
    const photos = rows.map(rowToPhoto);
    console.log(rows);
  }
});*/

// Insert a photo into database
/*const insertQuery = 'INSERT INTO photo(year, month, day, imgName, imgDesc, imgLink) VALUES (?, ?, ?, ?, ?, ?)';
connection.query(insertQuery, (error, rows) => {
  if (error) {
    console.error(error);
  } else {
    console.log(rows);
  }
});*/


/* Endpoints */

// Select/Get
service.get('/photos/:month/:day', (request, response) => {
  const parameters = [
    parseInt(request.params.month),
    parseInt(request.params.day),
  ];

  const query = 'SELECT * FROM photo WHERE month = ? AND day = ? AND is_deleted = 0 ORDER BY year DESC';
  // Grab photos in database if existant
  connection.query(query, parameters, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      const photos = rows.map(rowToPhoto);
      response.json({
        ok: true,
        results: rows.map(rowToPhoto),
      });
    }
  });
});

// Insert
service.post('/photos', (request, response) => {
  if (request.body.hasOwnProperty('year') &&
      request.body.hasOwnProperty('month') &&
      request.body.hasOwnProperty('day') &&
      request.body.hasOwnProperty('imgName') &&
      request.body.hasOwnProperty('imgLink') &&
      request.body.hasOwnProperty('imgDesc')) {

    const parameters = [
      request.body.year,
      request.body.month,
      request.body.day,
      request.body.imgName,
      request.body.imgLink,
      request.body.imgDesc,
    ];
    const query = 'INSERT INTO photo(year, month, day, imgName, imgLink, imgDesc) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, parameters, (error, result) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        response.json({
          ok: true,
          results: result.insertId,
        });
      }
    });

  } else {
    response.status(400);
    response.json({
      ok: false,
      results: 'Incomplete photo.',
    });
  }
});


// Listen to chosen port
const port = 8443;
service.listen(port, () => {
  console.log(`We're live on port: ${port}!`);
});

/* TODO: Remove, we don't want connection to close like this*/
// Close connection to database
/*connection.end();*/

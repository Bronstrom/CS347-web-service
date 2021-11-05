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

// Allow cross-origin resource sharing
service.use((request, response, next) => {
  response.set('Access-Control-Allow-Origin', '*');
  next();
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
    is_deleted: row.is_deleted,
  }
}



/* ENDPOINTS */


// Options wildcard
service.options('*', (request, response) => {
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  response.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  response.sendStatus(200);
});


// Select/Get ALL photos
service.get('/photos', (request, response) => {
  const query = 'SELECT * FROM photo WHERE is_deleted = 0 ORDER BY year DESC, month DESC, day DESC';
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

// Select/Get for a specific MONTH of a year
service.get('/photos/:month/:year', (request, response) => {
  const parameters = [
    parseInt(request.params.year),
    parseInt(request.params.month),
  ];

  const query = 'SELECT * FROM photo WHERE year = ? AND month = ? AND is_deleted = 0 ORDER BY day DESC';
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


// Select/Get for a specific DAY
service.get('/photos/:month/:day/:year', (request, response) => {
  const parameters = [
    parseInt(request.params.year),
    parseInt(request.params.month),
    parseInt(request.params.day),
  ];

  const query = 'SELECT * FROM photo WHERE year = ? AND month = ? AND day = ? AND is_deleted = 0';
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


// Insert/Post
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
      results: 'Incomplete photo. The following must be included for a photo: year (INT), '
	    + 'month (INT), day (INT), imgName (TXT), imgLink (TXT), imgDesc (TXT).',
    });
  }
});


// Update
service.patch('/photos/:id', (request, response) => {
  const parameters = [
    parseInt(request.params.id),
    request.body.year,
    request.body.month,
    request.body.day,
    request.body.imgName,
    request.body.imgLink,
    request.body.imgDesc,
  ];

  const query = 'UPDATE photo WHERE id = ? AND SET year = ?, month = ?, day = ?, imgName = ?, imgLink = ?, imgDesc = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(404);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});

// Soft delete
service.delete('/photos/:id', (request, response) => {
  const parameters = [parseInt(request.params.id)];

  const query = 'UPDATE photo SET is_deleted = 1 WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(404);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});

// Hard delete - requests month & day to ensure user wants to delete
service.delete('/photos/:id/:month/:day', (request, response) => {
  const parameters = [
	parseInt(request.params.id),
  	parseInt(request.params.month),
	parseInt(request.params.day),
  ];

  const query = 'DELETE FROM photo WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(404);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});


// Provide report through GET endpoint
service.get('/report.html', (request, response) => {
    response.sendFile("/home/brad/CS347-web-service/report.html");
});




// Listen to chosen port
const port = 5001;
service.listen(port, () => {
  console.log(`We're live on port: ${port}!`);
});


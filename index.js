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
    tag:	row.tag,
    amazing:	row.amazing,
    nice:	row.nice,
    meh: 	row.meh,
    boo:	row.boo,
    popRate:    row.popRate,
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
  const parameters = [];
  
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
        results: photos,
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
        results: photos,
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
        results: photos,
      });
    }
  });
});

// Get photo with ID
service.get('/photos/:id', (request, response) => {
  const parameters = [
    parseInt(request.params.id),
  ];

  const query = 'SELECT * FROM photo WHERE id = ? AND is_deleted = 0';
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
        results: photos,
      });
    }
  });
});

// Get all photos with a certain tag
service.get('/tag/:tag', (request, response) => {
  const parameters = [
    request.params.tag,
  ];

  const query = 'SELECT * FROM photo WHERE tag = ? AND is_deleted = 0';
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
        results: photos,
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
      request.body.hasOwnProperty('imgDesc') &&
      request.body.hasOwnProperty('tag')) {

    const parameters = [
      request.body.year,
      request.body.month,
      request.body.day,
      request.body.imgName,
      request.body.imgLink,
      request.body.imgDesc,
      request.body.tag,
    ];
    const query = 'INSERT INTO photo(year, month, day, imgName, imgLink, imgDesc, tag) VALUES (?, ?, ?, ?, ?, ?, ?)';
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
	    + 'month (INT), day (INT), imgName (TXT), imgLink (TXT), imgDesc (TXT), tag (TXT).',
    });
  }
});



// Update - Edit complete photo
service.patch('/photos/:id', (request, response) => {
  const parameters = [
    request.body.year,
    request.body.month,
    request.body.day,
    request.body.imgName,
    request.body.imgLink,
    request.body.imgDesc,
    request.body.tag,
    parseInt(request.params.id),
  ];

  const query = 'UPDATE photo SET year = ?, month = ?, day = ?, imgName = ?, imgLink = ?, imgDesc = ?, tag = ? WHERE id = ?';
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

// Update - Amazings
service.patch('/:id/amazing', (request, response) => {
  const parameters = [
    parseInt(request.params.id),
  ];

  const query = 'UPDATE photo SET amazing = amazing + 1, popRate = popRate + 2 WHERE id = ?';
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

// Update - Nices
service.patch('/:id/nice', (request, response) => {
  const parameters = [
    parseInt(request.params.id),
  ];

  const query = 'UPDATE photo SET nice = nice + 1, popRate = popRate + 1 WHERE id = ?';
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

// Update - Mehs
service.patch('/:id/meh', (request, response) => {
  const parameters = [
    parseInt(request.params.id),
  ];

  const query = 'UPDATE photo SET meh = meh + 1 WHERE id = ?';
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

// Update - Boos
service.patch('/:id/boo', (request, response) => {
  const parameters = [
    parseInt(request.params.id),
  ];

  const query = 'UPDATE photo SET boo = boo + 1, popRate = popRate - 2 WHERE id = ?';
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

// Hard delete - requests month, day & year to ensure user wants to delete
service.delete('/photos/:id/:month/:day/:year', (request, response) => {
  const parameters = [
	parseInt(request.params.id),
	parseInt(request.params.year),
  	parseInt(request.params.month),
	parseInt(request.params.day),
  ];

  const query = 'DELETE FROM photo WHERE id = ? AND year = ? AND month = ? AND day = ?';
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


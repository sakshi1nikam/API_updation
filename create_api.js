//Require module
const http = require('http');
const { Client } = require('pg');
const validation = require('./validation');
const { parse } = require('querystring');

//Port on which server will run 
const port = 3000;

const dbConfig = {
  user: 'postgres', // PostgreSQL username
  host: 'localhost', // PostgreSQL host
  database: 'postgres', // PostgreSQL database name
  password: 'SQL123', // PostgreSQL password
  port: 5432, // PostgreSQL port
};

//Table Query
const createTableQuery = `
CREATE TABLE IF NOT EXISTS public.student
(
    studid serial NOT NULL PRIMARY KEY,
    firstname character varying(255) ,
    lastname character varying(255) ,
    dateofbirth date NOT NULL,
    email character varying(255) ,
    address text ,
    feepaid numeric NOT NULL,
    grade character(1) ,
    physics integer ,
    maths integer ,
    chemistry integer ,
    total_marks numeric, 
    percentage numeric 
)
`;

//Create server 
const server = http.createServer(async (req, res) => {
  // Set CORS headers to allow requests from any origin 
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');


  // To fetch all records 
  if (req.method === 'GET' && req.url === '/api/students') {

    try {
  const client = new Client(dbConfig);
  await client.connect();

  const query = 'SELECT * FROM student';
  const result = await client.query(query);

  await client.end();

  if (result.rows.length === 0) {
    // No rows found for the query
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No record found' }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows));
  }
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    // Database connection refused
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Database connection refused' }));
  } else if (error.code === 'ENOTFOUND') {
    // Database host not found
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Database host not found' }));
  } else {
    // Other database errors
    console.error('Database error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }

  }
}

  // Fetch records on query parameters
  else if (req.method === 'GET' && req.url.startsWith('/api/students')) {

    const urlParams = new URLSearchParams(req.url.split('?')[1]);

// BY ID
    if (urlParams.has('id')) {
      // Fetch student by ID
      const studId = parseInt(urlParams.get('id'), 10);


      //Validating if id is number 
      if (Number.isNaN(studId)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Enter student ID . ID should be integer value');
        return;
      }

      if (studId < 0) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Student ID must be a non-negative number');
        return;
      }

      try {
        const client = new Client(dbConfig);
        await client.connect();

        const query = 'SELECT * FROM student WHERE studId = $1';
        const result = await client.query(query, [studId]);

        await client.end();

        if (result.rows.length === 0) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Student Id record not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result.rows[0]));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }

    //BY FIRSTNAME
    else if (urlParams.has('firstname')) {
      // Fetch student by first name
      const firstname = urlParams.get('firstname');


      if(firstname === "")
      {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Enter firstname value');
        return;
      }

      else
      {
      //validate firstname should be alphabets only
      if(!validation.validateName(firstname)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Only alphabtes allowed');
        return;
      }
    }

      try {
        const client = new Client(dbConfig);
        await client.connect();
  
        const query = `
          SELECT * FROM student
          WHERE firstname ILIKE $1
        `;
        const result = await client.query(query, [`%${firstname}%`]);
  
        await client.end();
  
        if (result.rows.length === 0) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Student Id record not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result.rows[0]));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }


    //BY LASTNAME
    else if (urlParams.has('lastname')) {
      // Fetch student by last name
      const lastname = urlParams.get('lastname');

      //validate lastname should be alphabets only
      if(lastname === "")
      {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Enter lastname value');
        return;
      }
      else
      {
      if (!validation.validateName(lastname)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Only alphabates allowed');
        return;
      }
    }

      try {
        const client = new Client(dbConfig);
        await client.connect();
  
        const query = `
          SELECT * FROM student
          WHERE lastname ILIKE $1
        `;
        const result = await client.query(query, [`%${lastname}%`]);
  
        await client.end();
  
        if (result.rows.length === 0) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Student Id record not found');
          return;
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result.rows[0]));
          return;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }


    //BY DOB

    else if (urlParams.has('dateofbirth')) {
      // Fetch student by birthdate year
      const birthYear = urlParams.get('dateofbirth');

      if(birthYear === "")
      {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Please provide Date Of Birth');
      }
  
      //validate birthYear should be a valid year
      if (!/^\d{4}$/.test(birthYear)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Invalid birth year format. Please provide a valid 4-digit year.');
      }
  
      try {
        const client = new Client(dbConfig);
        await client.connect();
  
        const query = `
          SELECT * FROM student
          WHERE EXTRACT(YEAR FROM dateofbirth) = $1
        `;
        const result = await client.query(query, [birthYear]);
  
        await client.end();
  
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }


    // BY EMAIL
    else if (urlParams.has('email')) {
      // Fetch student by email
      const email = urlParams.get('email');
  
      //validate email should be a valid email format
      if (!validation.validateEmail(email)) {
        res.end('Invalid email format. Please provide a valid email address.');
      }
  
      try {
        const client = new Client(dbConfig);
        await client.connect();
  
        const query = `
          SELECT * FROM student
          WHERE email ILIKE $1
        `;
        const result = await client.query(query, [`%${email}%`]);
  
        await client.end();
  
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }


    //BY ADDRESS
    else if (urlParams.has('address')) {
      // Fetch student by address
      const address = urlParams.get('address');

      if(address==="")
      {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Enter the address');
      }
  
      try {
        const client = new Client(dbConfig);
        await client.connect();
  
        const query = `
          SELECT * FROM student
          WHERE address ILIKE $1
        `;
        const result = await client.query(query, [`%${address}%`]);
  
        await client.end();
  
        if (result.rows.length === 0) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('No records found for the provided address');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result.rows));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }


    //BY FEEPAID
    else if (urlParams.has('feepaid')) {

      const fees = urlParams.get('feepaid');

      if(fees === "")
      {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Enter feepaid');
      }
      
      if (Number.isNaN(fees)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('fees should be in numbers');
        return;
      }

      if (fees < 0) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Feepaid must be a non-negative number');
        return;
      }

      try {
        const client = new Client(dbConfig);
        await client.connect();
  
        const query = `
          SELECT * FROM student
          WHERE feepaid = $1
        `;
        const result = await client.query(query, [fees]);
  
        await client.end();
  
        if (result.rows.length === 0) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('No records found ');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result.rows));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }}



      //BY GRADE
      else if (urlParams.has('grade')) {
        // Fetch students by grade
        const grade = urlParams.get('grade');


        if(grade === "")
      {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Enter grade value');
      }
    
        // Validate grade format
        if (!validation.validateGrade(grade)) {
          res.end('Invalid grade format. Only (A ,B ,C , D ) allowed . Please provide a valid grade.');
        }
    
        try {
          const client = new Client(dbConfig);
          await client.connect();
    
          const query = `
            SELECT * FROM student
            WHERE grade = $1
          `;
          const result = await client.query(query, [grade]);
    
          await client.end();
    
          if (result.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('No records found ');
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      }


      //BY PHYSICS MARKS
      else if (
        urlParams.has('physics') 
      ) {
        const physicsMarks = parseInt(urlParams.get('physics'))  ;

        if (!physicsMarks) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Physics marks parameter is missing');
          return;
        }
        if (Number.isNaN(physicsMarks)) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Physics marks must be a valid number');
          return;
        }
      
        if (physicsMarks < 0 || physicsMarks > 100) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Physics marks must be between 0 and 100');
          return;
        }
    
        try {
          const client = new Client(dbConfig);
          await client.connect();
    
          const query = `
            SELECT * FROM student
            WHERE physics > $1 
          `;
          const result = await client.query(query, [physicsMarks]);
    
          await client.end();
    
          if (result.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('No records found ');
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      }


      //BY CHEMISTRY MARKS
      else if (
        urlParams.has('chemistry') 
      ) {
        const chemistryMarks = parseInt(urlParams.get('chemistry'))  ;

        if (!chemistryMarks) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('chemistry marks parameter is missing');
          return;
        }
        if (Number.isNaN(chemistryMarks)) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('chemistry marks must be a valid number');
          return;
        }
      
        if (chemistryMarks < 0 || chemistryMarks > 100) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('chemistry marks must be between 0 and 100');
          return;
        }
    
        try {
          const client = new Client(dbConfig);
          await client.connect();
    
          const query = `
            SELECT * FROM student
            WHERE chemistry > $1 
          `;
          const result = await client.query(query, [chemistryMarks]);
    
          await client.end();
    
          if (result.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('No records found ');
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      }


//BY MATHS MARKS
      else if (
        urlParams.has('maths') 
      ) {
        const mathsMarks = parseInt(urlParams.get('maths'))  ;

        if (!mathsMarks) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('maths marks parameter is missing');
          return;
        }
        if (Number.isNaN(mathsMarks)) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('maths marks must be a valid number');
          return;
        }
      
        if (mathsMarks < 0 || mathsMarks > 100) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('maths marks must be between 0 and 100');
          return;
        }
    
        try {
          const client = new Client(dbConfig);
          await client.connect();
    
          const query = `
            SELECT * FROM student
            WHERE maths > $1 
          `;
          const result = await client.query(query, [mathsMarks]);
    
          await client.end();
    
          if (result.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('No records found ');
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      }


      //BY PERCENATGE 
      else if (urlParams.has('percentage')) {
        const percentage = parseFloat(urlParams.get('percentage')) || 0;

        if (!percentage) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('percentage parameter is missing');
          return;
        }

        if (percentage < 0 || percentage > 100) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('maths marks must be between 0 and 100');
          return;
        }
    
        try {
          const client = new Client(dbConfig);
          await client.connect();
    
          const query = `
            SELECT * FROM student
            WHERE percentage >= $1
          `;
          const result = await client.query(query, [percentage]);
    
          await client.end();
    
          if (result.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('No records found');
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      }

// Fetch records on query parameters
else if (req.method === 'GET' && req.url.startsWith('/api/students')) {
  const urlParams = new URLSearchParams(req.url.split('?')[1]);

  // Extract all query parameters and their values
  const queryParams = [];
  urlParams.forEach((value, key) => {
    queryParams.push({ key, value });
  });

  if (queryParams.length > 0) {
    try {
      const client = new Client(dbConfig);
      await client.connect();

      // Construct the SQL query with dynamic conditions
      let query = 'SELECT * FROM student WHERE ';
      const conditions = [];
      const values = [];

      queryParams.forEach((param, index) => {
        if (index > 0) {
          query += ' AND ';
        }
        conditions.push(`${param.key} ILIKE $${index + 1}`);
        values.push(`%${param.value}%`);
      });

      query += conditions.join(' AND ');

      const result = await client.query(query, values);

      await client.end();

      if (result.rows.length === 0) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('No records found ');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } 
}

    else {
      //pagination 
      // Extract pagination parameters
    const page = parseInt(urlParams.get('page')) || 1;
    const limit = parseInt(urlParams.get('limit')) || 10; // Default limit of 10 records per page
    const offset = (page - 1) * limit; // Default offset of 0

      try {
        const client = new Client(dbConfig);
        await client.connect();

        const query = 'SELECT * FROM student ORDER BY studId LIMIT $1 OFFSET $2';
        const result = await client.query(query, [limit, offset]);

        await client.end();

        if (result.rows.length === 0) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('No records found ');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result.rows));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');

      }
    }
  }

  // insert new data
  else if (req.method === 'POST' && req.url === '/api/students') {
    try {
      let requestBody = '';
      req.on('data', (chunk) => {
        requestBody += chunk.toString();
      });

      req.on('end', async () => {
        const studentData = JSON.parse(requestBody);

        // ... Validation code ...

        if (!studentData.physics) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for physics marks');
          return;
        }
        if(!studentData.maths)
        {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for maths marks');
          return;
        }
        if(!studentData.chemistry)
        {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for chemistry marks');
          return;
        }
        if(!studentData.firstname)
        {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for firstname');
          return;
        }
        if(!studentData.lastname)
        {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for lastname');
          return;
        }
        if(!studentData.dateofbirth)
        {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for dateofbirth');
          return;
        }
        if(!studentData.email)
        {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for email');
          return;
        }
        if(!studentData.address)
        {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for address');
          return;
        }
        if(!studentData.feepaid)
        {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for feepaid');
          return;
        }
        if(!studentData.grade)
        {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for grade');
          return;
        }
        if(!studentData.total_marks)
        {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for total_marks');
          return;
        }
        if(!studentData.percentage)
        {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for percentage');
          return;
        }
        

        else
        {
          if (!validation.validateName(studentData.firstname) || !validation.validateName(studentData.lastname))
          {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Only alphabets allowed for firstname and lastname');
          }
  
          else
          {
              //validate email address
           if (!validation.validateEmail(studentData.email)) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid email address');
  
          }
          else
          {
            if (Number.isNaN(studentData.feepaid) || Number.isNaN(studentData.physics) || Number.isNaN(studentData.maths) || Number.isNaN(studentData.chemistry) ) {
              res.writeHead(400, { 'Content-Type': 'text/plain' });
              res.end('Invalid Values');
              return;
            }
            else
            {
                  //validate grade
        if (!validation.validateGrade(studentData.grade)) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid Grade');
        }
            }
          }
        }
        }

        // Calculate total_marks and percentage
        const total_marks = studentData.physics + studentData.maths + studentData.chemistry;
        const percentage = (total_marks / 300) * 100;

        const client = new Client(dbConfig);
        await client.connect();

        const insertQuery = `
        INSERT INTO student (firstname, lastname, dateofbirth, email, address, feepaid, grade, physics, maths, chemistry, total_marks, percentage)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING studId
      `;

        const values = [
          studentData.firstname,
          studentData.lastname,
          studentData.dateofbirth,
          studentData.email,
          studentData.address,
          studentData.feepaid,
          studentData.grade,
          studentData.physics,
          studentData.maths,
          studentData.chemistry,
          total_marks,
          percentage,
        ];

        const result = await client.query(insertQuery, values);

        await client.end();

        const insertedStudId = result.rows[0].studId;
        res.writeHead(201, { 'Content-Type': 'text/plain' });
        res.end(`Student added successfully`);
      });
    } catch (error) {
      console.error('Error inserting student:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }

  }


  //Delete by id and name

  else if (req.method === 'DELETE' && req.url.startsWith('/api/students')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);

    if (urlParams.has('id')) {
      // Delete student by ID
      const studId = parseInt(urlParams.get('id'), 10);

      //Validate id value 
      if (Number.isNaN(studId)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid student ID');
        return;
      }

      try {
        const client = new Client(dbConfig);
        await client.connect();

        const deleteQuery = 'DELETE FROM student WHERE studId = $1';
        await client.query(deleteQuery, [studId]);

        await client.end();

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Student record deleted successfully');
      }
      catch (error) {
        console.error('Error deleting student:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }
    else if (urlParams.has('firstname')) {
      // DELETE student by first name
      const firstname = urlParams.get('firstname');

      //validate firstname should be alphabets only
      if (!validation.validateName(firstname)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid firstname . Please provide valid values.');
      }
      
      try {

        const client = new Client(dbConfig);
        await client.connect();

        const deleteQuery = 'DELETE FROM student WHERE firstname = $1';
        const result = await client.query(deleteQuery, [firstname]);

        await client.end();

        if (result.rowCount === 0) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('No students record found with the specified first name');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result.rows));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid request. Missing query parameters (id or firstname).');
    }
  }



  //update by id , firstname

  else if (req.method === 'PUT' && req.url.startsWith('/api/students')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);

    if (urlParams.has('id')) {
      // Update student by ID
      const studId = parseInt(urlParams.get('id'), 10);

      // ... Validation code ...
      if (Number.isNaN(studId)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid student ID');
        return;
      }

      try {
        let requestBody = '';
        req.on('data', (chunk) => {
          requestBody += chunk.toString();
        });

        req.on('end', async () => {
          const studentData = JSON.parse(requestBody);

          // Calculate total_marks and percentage
          const total_marks = studentData.physics + studentData.maths + studentData.chemistry;
          const percentage = (total_marks / 300) * 100;

          const client = new Client(dbConfig);
          await client.connect();

          const checkQuery = `
          SELECT * FROM student 
          WHERE studId = $1
        `;

        const checkResult = await client.query(checkQuery, [studId]);

        if (checkResult.rows.length === 0) {
          await client.end();
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end(`Student with ID ${studId} not found`);
          return;
        }

          const updateQuery = `
    UPDATE student 
    SET firstname = $1,
        lastname = $2,
        dateofbirth = $3,
        email = $4,
        address = $5,
        feepaid = $6,
        grade = $7,
        physics = $8,
        maths = $9,
        chemistry = $10,
        total_marks = $11,
        percentage = $12
    WHERE studId = $13
  `;

          const values = [
            studentData.firstname,
            studentData.lastname,
            studentData.dateofbirth,
            studentData.email,
            studentData.address,
            studentData.feepaid,
            studentData.grade,
            studentData.physics,
            studentData.maths,
            studentData.chemistry,
            total_marks,
            percentage,
            studId,
          ];

          await client.query(updateQuery, values);

          await client.end();

          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Student updated successfully');
        });
      } catch (error) {
        console.error('Error updating student:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }
    else if (urlParams.has('firstname')) {
      // Update student by first name
      const firstname = urlParams.get('firstname');

      //validate firstname should be alphabets only
      if (!validation.validateName(firstname)) {
        res.end('Invalid firstname . Please provide valid values.');
      }

      try {
        let requestBody = '';
        req.on('data', (chunk) => {
          requestBody += chunk.toString();
        });

        req.on('end', async () => {
          const studentData = JSON.parse(requestBody);

          // Calculate total_marks and percentage
          const total_marks = studentData.physics + studentData.maths + studentData.chemistry;
          const percentage = (total_marks / 300) * 100;

          const client = new Client(dbConfig);
          await client.connect();

          const updateQuery = `
          UPDATE student 
          SET firstname = $1,
              lastname = $2,
              dateofbirth = $3,
              email = $4,
              address = $5,
              feepaid = $6,
              grade = $7,
              physics = $8,
              maths = $9,
              chemistry = $10,
              total_marks = $11,
              percentage = $12
          WHERE firstname = $13
        `;

          const values = [
            studentData.firstname,
            studentData.lastname,
            studentData.dateofbirth,
            studentData.email,
            studentData.address,
            studentData.feepaid,
            studentData.grade,
            studentData.physics,
            studentData.maths,
            studentData.chemistry,
            total_marks,
            percentage,
            firstname, // Uses the original name to identify the student to be updated
          ];

          await client.query(updateQuery, values);

          await client.end();

          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Student(s) updated successfully');
        });
      } catch (error) {
        console.error('Error updating student:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' }); 
      res.end('Invalid request. Missing query parameters (id or firstname).');
    }}
});

// Function to create the "student" table if it doesn't exist
async function createTableIfNotExists() {
  try {
    const client = new Client(dbConfig);
    await client.connect();

    await client.query(createTableQuery);

    await client.end();

    console.log('Table "student" created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

createTableIfNotExists();

server.listen(port, () => {
  console.log(`API server running on port ${port}`);
});

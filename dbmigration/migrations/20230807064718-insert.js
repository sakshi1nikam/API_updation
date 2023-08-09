'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  try {
    const { Client } = require('pg');

    const dbConfig = {
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'SQL123',
      port: 5432,
    };

    const client = new Client(dbConfig);
    await client.connect();

    const studentsData = [
      {
        firstname: 'Sakshi',
        lastname: 'Nikam',
        dateofbirth: '2000-11-01',
        email: 'sakshi.nikam@example.com',
        address: '123 Main Street',
        feepaid: 1000,
        grade: 'A',
        physics: 80,
        maths: 95,
        chemistry: 86,
      },
      {
        firstname: 'Jim',
        lastname: 'Stuat',
        dateofbirth: '2001-02-12',
        email: 'jim.staut@example.com',
        address: '456 Oak Avenue',
        feepaid: 1200,
        grade: 'B',
        physics: 78,
        maths: 45,
        chemistry: 67,
      },
    ];

    // Calculate total_marks and percentage for each student data object
    studentsData.forEach((student) => {
      student.total_marks = student.physics + student.maths + student.chemistry;
      student.percentage = (student.total_marks / 300) * 100;
    });

    // Insert the student data into the "student" table
    const insertQuery = `
      INSERT INTO student (firstname, lastname, dateofbirth, email, address, feepaid, grade, physics, maths, chemistry, total_marks, percentage)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    for (const student of studentsData) {
      const values = [
        student.firstname,
        student.lastname,
        student.dateofbirth,
        student.email,
        student.address,
        student.feepaid,
        student.grade,
        student.physics,
        student.maths,
        student.chemistry,
        student.total_marks,
        student.percentage,
      ];

      await client.query(insertQuery, values);
    }

    await client.end();

    console.log('Migration successful. Data inserted into "student" table.');
  } catch (error) {
    console.error('Migration error:', error);
    throw error; // Rethrow the error to indicate migration failure
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};

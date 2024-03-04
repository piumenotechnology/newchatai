/* eslint-disable no-undef */
import mysql  from 'mysql2/promise';

const pool = mysql.createPool ({
  host: process.env.DB_HOSt,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default pool;
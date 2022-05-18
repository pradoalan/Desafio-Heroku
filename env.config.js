require('dotenv').config();

const {
  DB_PASSWORD,
  SESSION_SECRET
} = process.env;

module.exports = {
  DB_PASSWORD,
  SESSION_SECRET,
}
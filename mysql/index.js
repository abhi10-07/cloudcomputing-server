const mysql = require("mysql2/promise");
const { rdsConfig } = require("../config/keys");

const connectionDetails = {
  host: rdsConfig.host,
  user: rdsConfig.user,
  password: rdsConfig.password,
  database: rdsConfig.database,
};

let connection;

const initDatabase = async () => {
  try {
    connection = await mysql.createConnection(connectionDetails);

    await connection.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description LONGTEXT NOT NULL,
      original_media LONGTEXT NOT NULL,
      thumbnail LONGTEXT NOT NULL,
      PRIMARY KEY (id));
  `);
  } catch (error) {
    console.log(error);
  }

  return connection;
};

const addNewPost = (data) => {
  return connection.execute(
    `
    INSERT INTO posts (title, description, original_media, thumbnail, original_media_s3, thumbnail_s3)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    [
      data.title,
      data.description,
      data.original_media,
      data.thumbnail,
      data.original_media_s3,
      data.thumbnail_s3,
    ]
  );
};

const getPosts = async () => {
  const [rows] = await connection.execute(
    `SELECT * FROM posts ORDER BY id DESC`
  );
  return rows;
};

const getPost = async (id) => {
  const [rows] = await connection.execute(
    `
    SELECT id, title, description, original_media, thumbnail
    FROM posts
    WHERE id = ?
  `,
    [id]
  );

  const post = {
    id: rows[0].id,
    title: rows[0].title,
    desc: rows[0].desc,
    original_media: rows[0].original_media,
    thumbnail: rows[0].thumbnail,
  };

  return post;
};

module.exports = {
  initDatabase,
  getPost,
  getPosts,
  addNewPost,
};

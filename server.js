const express = require("express");
const { initDatabase } = require("./mysql");
const posts = require("./routes/api/posts");
const multer = require("multer");

const app = express();
const cors = require("cors");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Body parser middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// TODO: connect to db middleware

// use routes
app.use("/api/", upload.single("media"), posts);

const port = process.env.PORT || 3030;

initDatabase().then((connection) => {
  // console.log(`Database connection ${connection}`);
  if (connection) {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
});

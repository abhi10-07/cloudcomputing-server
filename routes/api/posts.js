const express = require("express");
const sharp = require("sharp");
const router = express.Router();
const uploadToS3 = require("../../s3/upload");
const { fetchData, fetchSignedData } = require("../../s3/fetch");
const { addNewPost, getPosts, getPost } = require("../../mysql");
const { redisClient } = require("../../Redis");

// @route GET api/stock/test
// @desc Test stocks route
// @access Public
router.get("/test", (req, res) => {
  res.json({
    status: 200,
    msg: "Test page",
  });
});

const getAllPosts = async (req, res) => {
  let posts;
  let isCached = false;
  const fetch = req.query.fetch === "true";
  const cacheResults = await redisClient.get(`posts`);

  if (cacheResults && !fetch) {
    isCached = true;
    posts = JSON.parse(cacheResults);
  } else {
    posts = await getPosts();
    await redisClient.set(`posts`, JSON.stringify(posts));
  }

  for (let post of posts) {
    post.original_media_s3 = await fetchSignedData(post.original_media);
    post.thumbnail_s3 = await fetchSignedData(post.thumbnail);
  }

  const data = {
    isCached,
    posts,
  };

  return data;
};

const getPostById = async (req, res) => {
  const id = req.params.id;
  const post = await getPost(id);
  return post;
};

router.get("/posts", async (req, res) => {
  try {
    data = await getAllPosts(req, res);
    res.status(200).json({ fromCache: data.isCached, data: data.posts });
  } catch (error) {
    res.status(404).json({ error });
  }
});

router.post("/addpost", async (req, res) => {
  const file = req.file;
  let fileBufferOriginal;

  switch (file.mimetype.toLowerCase()) {
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "jpeg":
    case "png": {
      fileBufferOriginal = await sharp(file.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer();
      break;
    }

    default:
      break;
  }

  const { title, description } = req.body;
  const randomTimestamp = Date.now();
  const fileS3 = `original/${randomTimestamp}_${file.originalname}`;
  const thumbnailS3 = `thumbnails/${randomTimestamp}_${file.originalname}`;
  const s3FileUrl = `https://abhi-10831908.s3.ap-southeast-2.amazonaws.com/${fileS3}`;
  const s3ThumbnailUrl = `https://abhi-10831908.s3.ap-southeast-2.amazonaws.com/${thumbnailS3}`;
  const data = {
    title,
    description,
    original_media: fileS3,
    thumbnail: thumbnailS3,
    original_media_s3: s3FileUrl,
    thumbnail_s3: s3ThumbnailUrl,
  };

  const response = await addNewPost(data);

  uploadToS3(fileBufferOriginal, fileS3, file.mimetype);

  res.status(200).json({ data: response });
});

router.get("/post/:id", async (req, res) => {
  try {
    const data = await getPostById(req, res);
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(404).json({ error });
  }
});

module.exports = router;

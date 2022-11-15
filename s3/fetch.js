const keys = require("../config/keys");
const AWS = require("aws-sdk");

AWS.config.update(keys.awsConfig);
const s3 = new AWS.S3();

const fetchSignedData = async (key) => {
  const bucketName = "abhi-10831908";
  const signedUrlExpireSeconds = 60 * 1;
  const params = { Bucket: bucketName, Key: key };
  try {
    await s3.headObject(params).promise();
    const url = s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: key,
      Expires: signedUrlExpireSeconds,
    });
    return url;
  } catch (error) {
    return null;
  }
};

const fetchData = async (key) => {
  const bucketName = "abhi-10831908";
  const params = { Bucket: bucketName, Key: key };
  try {
    const s3Result = await s3.getObject(params).promise();
    // Serve from S3
    const s3JSON = s3Result.Body;
    return JSON.parse(s3JSON);
  } catch (err) {
    console.log("No key error");
    if (err.statusCode === 404) {
      return;
    } else {
      return;
      // Something else went wrong when accessing S3
      console.log(err);
      //   res.json(err);
    }
  }
};

module.exports = { fetchData, fetchSignedData };

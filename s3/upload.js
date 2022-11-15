const keys = require("../config/keys");
const AWS = require("aws-sdk");

AWS.config.update(keys.awsConfig);
// S3 setup

const uploadToS3 = (fileBuffer, fileName, mimetype, key) => {
  const bucketName = "abhi-10831908";
  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

  //Create params for putObject call
  const objectParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype,
  };

  console.log(fileBuffer, fileName, mimetype);

  // console.log(objectParams);
  //Create object upload promise
  (async () => {
    try {
      await s3.putObject(objectParams).promise();
      console.log(`Successfully uploaded data to ${bucketName}/${fileName}`);
    } catch (err) {
      console.log(err, err.stack);
    }
  })();
};

module.exports = uploadToS3;

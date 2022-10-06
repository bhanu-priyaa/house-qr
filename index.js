const AWS = require("aws-sdk");
const QRcode = require("qrcode"); //for qrcode generation
var validate = require("uuid-validate"); //for validating the uuid

const S3_BUCKET = "vvplus";
const s3bucket = new AWS.S3({ params: { Bucket: S3_BUCKET } });
const s3 = new AWS.S3();

exports.handler = async (event) => {
  let response; //the response of the function
  const userUuid = event.uuid; 
  
  if(!validate(userUuid)){
    response = "Unvalid UUID";
    return response;
  }
  
  const generatedQR = await QRcode.toDataURL(userUuid, {
    errorCorrectionLevel: "H",
  });
  
  var filename = userUuid + ".png";
  
  const fileExists = await s3
    .headObject({
      Bucket: S3_BUCKET,
      Key: filename,
    })
    .promise()
    .then(
      () => true,
      (err) => {
        if (err.code == "NotFound") {
          return false;
        }
        throw err;
      }
    );
    
  if (fileExists) {
    response = "already existed! " + filename.toString();
  } 
  else {
    const params = {
      Bucket: S3_BUCKET,
      Key: filename,
      Body: generatedQR,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: "image/png",
    };
    
    s3bucket.upload(params, function (err, data) {
      if (err) {
        response = "Error in uploading";
      } else {
        response = "Uploaded! " + filename.toString();
      }
    });
  }
  
  
  return response;
};

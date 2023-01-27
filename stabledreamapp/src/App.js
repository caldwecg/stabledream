import React, { useState } from 'react';
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();


const App = () => {
  const [files, setFiles] = useState([]);

  const onChange = (e) => {
    setFiles(e.target.files);
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const bucketName = 'testing-image-upload-stabledream';
    const userId = Date.now(); //generate unique user id
    const dirName = `user-image-dir-${userId}`;
    try {
      // Create the bucket if it doesn't already exist
  
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const params = {
          Body: file,
          Bucket: bucketName,
          Key: dirName + "/" + file.name, // adds the "images" directory to the file's key
          ContentType: file.type,
        };
        await s3.putObject(params).promise();
        console.log("File uploaded successfully: ", file.name);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input type="file" multiple onChange={onChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default App;

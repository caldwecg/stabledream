import React, { useState } from 'react';
const AWS = require('aws-sdk');
const uuid = require('uuid');

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();
const sqs = new AWS.SQS();


const App = () => {
  const [files, setFiles] = useState([]);
  const [input, setInput] = useState("");

  const onChange = (e) => {
    setFiles(e.target.files);
  }
  const onChange2 = (e) => {
    setInput(e.target.value);
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const bucketName = 'testing-image-upload-stabledream';
    const userId = Date.now(); //generate unique user id
    const dirName = `user-dir-${userId}`;

    sendMessageToQueue(dirName, input);

    try {
      // Create the bucket if it doesn't already exist
  
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const params = {
          Body: file,
          Bucket: bucketName,
          Key: dirName + "/images/" + file.name, // adds the "images" directory to the file's key
          ContentType: file.type,
        };
        // await s3.putObject(params).promise();
        console.log("File uploaded successfully: ", file.name);
      }
    } catch (err) {
      console.log(err);
    }
  }

  const sendMessageToQueue = async (bucketPath, userInformation) => {
    // prepare the message to be sent to the queue
    console.log(JSON.stringify({
      bucketPath: bucketPath,
      userInformation: userInformation
    }));
    const messageDeduplicationId = uuid.v4();
    const params = {
      MessageBody: JSON.stringify({
        bucketPath: bucketPath,
        userInformation: userInformation
      }),
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/312398414861/StableDreamQueue.fifo',
      MessageGroupId: 'messageGroup1',
      MessageDeduplicationId: messageDeduplicationId,
    };
  
    // send the message to the queue
    try {
      // await sqs.sendMessage(params).promise();
      console.log('Message sent to the queue successfully.');
    } catch (err) {
      console.log('Error sending message to the queue:', err);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input type="file" multiple onChange={onChange} />
        <br />
        <input type="text" multiple onChange={onChange2} />
        <br />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default App;

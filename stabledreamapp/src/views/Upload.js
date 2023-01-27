import React, { useState } from 'react';
import { S3 } from 'aws-sdk';

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [input, setInput] = useState("");

  const onChange = (e) => {
    setFiles(e.target.files);
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const s3 = new S3();
    const userId = "user-dir-" + Date.now(); //generate unique user id
    const bucketName = `testing-image-upload-stabledream`;

    sendMessageToQueue(userId, input);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const params = {
          Body: file,
          Bucket: bucketName,
          Key: userId + "/images/" + file.name,
          ContentType: file.type,
        };
        await s3.putObject(params).promise();
      }
    } catch (err) {
      console.log(err);
    }
  }

  const sendMessageToQueue = async (bucketPath, userInformation) => {
    // prepare the message to be sent to the queue
    const params = {
      MessageBody: JSON.stringify({
        bucketPath: bucketPath,
        userInformation: userInformation
      }),
      QueueUrl: 'https://sqs.us-west-2.amazonaws.com/123456789012/MyQueue'
    };
  
    // send the message to the queue
    try {
      await sqs.sendMessage(params).promise();
      console.log('Message sent to the queue successfully.');
    } catch (err) {
      console.log('Error sending message to the queue:', err);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input type="file" multiple onChange={onChange} />
        <input type="text" multiple onChange={setInput(e.target.value)} />

        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Upload;

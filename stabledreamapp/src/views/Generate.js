import React, { useState } from 'react';
import {useLocation} from 'react-router-dom';
// import {
//   GetObjectCommand,
// } from "@aws-sdk/client-s3";
// import { s3Client } from "./libs/s3Client.js";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import fetch from "node-fetch";
const AWS = require('aws-sdk');
const uuid = require('uuid');


export const bucketParams = {
  Bucket: `testing-image-upload-stabledream/generated_images/`,
  Key: `img_1.png`,
};


AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();
const sqs = new AWS.SQS();


const Generate = () => {

  const location = useLocation();
  const [input, setInput] = useState("");
  const [bucket, setBucket] = useState("");
  const [numImages, setNumImages] = useState(0);
  const [nPrompt, setnPrompt] = useState("");
  const [batchSize, setBatchSize] = useState(4);
  const [inferenceSteps, setInferenceSteps] = useState(50);
  const [guidanceScale, setGuidanceScale] = useState(7.5);

  

  const onChange2 = (e) => {
    setInput(e.target.value);
  }
  const onChange3 = (e) => {
    setBucket(e.target.value);
  }
  const onChange4 = (e) => {
    setNumImages(e.target.value);
  }

  const onChange5 = (e) => {
    setnPrompt(e.target.value);
  }
  const onChange6 = (e) => {
    setBatchSize(e.target.value);
  }
  const onChange7 = (e) => {
    setInferenceSteps(e.target.value);
  }

  const onChange8 = (e) => {
    setGuidanceScale(e.target.value);
  }
  const onSubmit = async (e) => {
    e.preventDefault();;
    sendMessageToQueue(bucket, "unnecessary", input, numImages, nPrompt, batchSize, inferenceSteps, guidanceScale);
  }

  const sendMessageToQueue = async (bucketPath, userInformation, prompt, numFiles, nPrompt, batchSize, inferenceSteps, guidanceScale) => {
    // prepare the message to be sent to the queue

    const messageDeduplicationId = uuid.v4();
    const params = {
      MessageBody: JSON.stringify({
        bucketPath: bucketPath,
        userInformation: userInformation,
        prompt: prompt,
        numFiles: numFiles,
        nPrompt: nPrompt,
        batchSize: batchSize,
        inferenceSteps: inferenceSteps,
        guidanceScale: guidanceScale
      }),
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/312398414861/imagerequest.fifo',
      MessageGroupId: 'messageGroup1',
      MessageDeduplicationId: messageDeduplicationId
    };
  
    // send the message to the queue
    try {
      await sqs.sendMessage(params).promise();
      console.log('Message sent to the queue successfully.');
    } catch (err) {
      console.log('Error sending message to the queue:', err);
    }
  }


  // // Create a presigned URL.
  // try {
  //   // Create the command.
  //   const command = new GetObjectCommand(bucketParams);

  //   // Create the presigned URL.
  //   const signedUrl = await getSignedUrl(s3Client, command, {
  //     expiresIn: 3600,
  //   });
  //   console.log(
  //     `\nGetting "${bucketParams.Key}" using signedUrl`
  //   );
  //   console.log(signedUrl);
  //   const response = await fetch(signedUrl);
  //   console.log(
  //     `\nResponse returned by signed URL: ${await response.text()}\n`
  //   );
  // } catch (err) {
  //   console.log("Error creating presigned URL", err);
  // }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <h2>Enter your prompt: </h2>
        <input style={{width: 1200}} type="text" multiple onChange={onChange2} />
        <h2>Enter your bucket: </h2>
        <input type="text" multiple onChange={onChange3} />
        <h2>Enter your model num images /80: </h2>
        <input type="text" multiple onChange={onChange4} />
        <h2>Enter your negative prompt: </h2>
        <input type="text" multiple onChange={onChange5} />
        <h2>Enter your batch size (default: 4): </h2>
        <input type="text" multiple onChange={onChange6} />
        <h2>Enter your inference steps (default: 50): </h2>
        <input type="text" multiple onChange={onChange7} />
        <h2>Enter your guidance scale (defalut: 7.5)): </h2>
        <input type="text" multiple onChange={onChange8} />

        <br />
        <br />
        <button type="submit">generate</button>
      </form>
    </div>
  );
};

export default Generate;

"use strict";

const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const uuid = require("uuid");
const axios = require("axios");

// async  version
module.exports.create = async (event, context) => {
  // 1. Get request
  const requestBody = JSON.parse(event.body); // { "content": "1" }
  // 2. Operateion - Write to S3
  // 3. Send response
  try {
    const response = await axios.get(
      `https://jsonplaceholder.typicode.com/todos/${requestBody.content}`
    );
    const todo = response.data;
    await putFile(JSON.stringify(todo));
    return responseCreator(200, todo);
  } catch (err) {
    console.log(err);
    return responseCreator(500, err);
  }
};

async function putFile(content) {
  const params = {
    Bucket: "todos-dev-serverlessdeploymentbucket-1j8pcon3ico8i",
    Key: "texts/" + new Date().getTime() + ".txt",
    Body: content
  };
  return await s3.putObject(params).promise();
}

async function writeToDDB(requestBody) {
  const params = {
    TableName: "todos",
    Item: {
      ...requestBody,
      id: uuid.v1(),
      isCompleted: false,
      updatedAt: new Date().getTime()
    }
  };
  return await ddb.put(params).promise();
}

function responseCreator(statusCode, body) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body)
  };
}

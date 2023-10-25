"use strict";

import { APIGatewayEvent, Context } from "aws-lambda";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import commonMiddleware from "../lib/commonMiddleware";
import createAuctionSchema from "../lib/schemas/createAuctionsSchema";
import createError from "http-errors";
import { transpileSchema } from "@middy/validator/transpile";
import { v4 as uuid } from "uuid";
import validator from "@middy/validator";

const client = new DynamoDBClient({
  region: "eu-north-1",
  maxAttempts: 3,
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const createAuction = async (event: APIGatewayEvent, ctx: Context) => {
  // body is automaticall parsed by middy middleware
  const { title } = event.body as unknown as { title: string };

  const now = new Date();

  const auction = {
    Item: {
      Id: uuid(),
      Title: title,
      Status: "OPEN",
      CreatedAt: now.toISOString(),
      highestBidAmount: 0,
    },
    TableName: process.env.AUCTIONS_TABLE_NAME,
  };

  console.log({ auction });

  const command = new PutCommand(auction);
  let response;
  try {
    response = await ddbDocClient.send(command);
  } catch (err) {
    throw new createError.InternalServerError(err);
  }
  return {
    statusCode: 201,
    body: JSON.stringify(response),
  };
};

export const handler = commonMiddleware(createAuction).use(
  validator({
    eventSchema: transpileSchema(createAuctionSchema),
  })
);

/**
 * serverless logs -f createAuction
 * serverless deploy function --function createAuction
 */

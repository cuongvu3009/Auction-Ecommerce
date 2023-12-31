// each lambda defines allowed origins in each lambda functions
import cors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJSONBodyParser from "@middy/http-json-body-parser";
import middy from "@middy/core";

export default (handler: any) =>
  middy(handler).use([
    // automatically parse our stringified event body
    httpJSONBodyParser(),
    // will automatically adjust the API Gateway event objects
    // to prevent us from accidently having non existing object when
    // trying to access path parameters or query parameters
    httpEventNormalizer(),
    // handle errors smoothly
    httpErrorHandler(),
    // accept requests from all origins in the web not recommended in the frontend
    // specify specific urls both in serverless.yml and middy middleware
    cors(),
  ]);
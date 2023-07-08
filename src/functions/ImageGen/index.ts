import schema from "./schema";
import { handlerPath } from "@libs/handler-resolver";
import type { AWS } from "@serverless/typescript";

const config: AWS["functions"]["ImageGen"] = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 10,
  events: [
    {
      http: {
        method: "post",
        path: "ImageGen",
        request: {
          schemas: {
            "application/json": schema,
          },
        },
      },
    },
  ],
};

export default config;

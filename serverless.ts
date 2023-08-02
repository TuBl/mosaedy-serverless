import type { AWS } from "@serverless/typescript";

import completions from "@functions/completions";
import ImageGen from "@functions/ImageGen";

const serverlessConfiguration: AWS = {
  service: "mosaedy-serverless",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-dotenv-plugin",
    "serverless-offline",
    "serverless-domain-manager",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    deploymentMethod: "direct",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
  },
  // import the function via paths
  functions: {
    completions: {
      ...completions,
      events: [
        {
          http: {
            path: "completions",
            method: "post",
            cors: true,
          },
        },
      ],
    },
    ImageGen: {
      ...ImageGen,
      events: [
        {
          http: {
            path: "ImageGen",
            method: "post",
            cors: true,
          },
        },
      ],
    }
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node18",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    customDomain: {
      domainName: "api.mosaedy.com",
      certificateName: "*.mosaedy.com",
      basePath: "",
      stage: "dev",
      createRoute53Record: true,
      apiType: "rest",
    },
  },
};

module.exports = serverlessConfiguration;

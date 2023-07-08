import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";

// 3rd party
import { Configuration, ImagesResponse, OpenAIApi } from "openai";
import supabase from "@libs/supabaseClient";

import { User } from "@supabase/supabase-js";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

interface CreateCompletionResponseData {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: any[];
}

type SupabaseSession = {
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  user: User;
};

const ImageGen: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { prompt, session }: { prompt: string; session: SupabaseSession } =
    event.body as { prompt: string; session: SupabaseSession };

  if (!prompt) {
    return formatJSONResponse(
      {
        messsage: "A prompt was not provided! request aborted",
      },
      422
    );
  }

  if (!session) {
    return formatJSONResponse(
      {
        messsage: "Invalid session info, failed to authenticate!",
      },
      403
    );
  }

  const user = await supabase.auth.getUser(session.access_token);

  if (!user) {
    return formatJSONResponse(
      {
        messsage: "Unauthorized! User not found.",
      },
      403
    );
  }

  try {
    const { data } = await openai.createImage({
      prompt,
      n: 1,
      size: "1024x1024",
    });

    if (data) {
      const responseData: ImagesResponse = {
        created: data.created,
        data: data.data,
      };
      return formatJSONResponse({ data: responseData }, 200);
    } else {
      return formatJSONResponse(
        { message: "Error: No data received from OpenAI API" },
        500
      );
    }
  } catch (error) {
    return formatJSONResponse(
      {
        message: `Server error: Failed to fetch data from OpenAI API. ${error.message}`,
      },
      500
    );
  }
};

export const main = middyfy(ImageGen);

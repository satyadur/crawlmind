/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionEnvironment } from "@/types/executor";
import { ExtractDataWithAITask } from "../task/ExtractDataWithAI";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";

import Groq from "groq-sdk";
import type {
  ChatCompletion,
  ChatCompletionMessageParam,
} from "groq-sdk/resources/chat/completions";

export async function ExtractDataWithAiExecutor(
  environment: ExecutionEnvironment<typeof ExtractDataWithAITask>
): Promise<boolean> {
  try {
    const credentials = await environment.getInput("Credentials");
    if (!credentials) {
      environment.log.error("input=>credentials not defined");
      return false;
    }

    const prompt = await environment.getInput("Prompt");
    if (!prompt) {
      environment.log.error("input=>prompt not defined");
      return false;
    }

    const content = await environment.getInput("Content");
    if (!content) {
      environment.log.error("input=>content not defined");
      return false;
    }

    // 🔑 Get credentials (Groq API key) from DB
    const credential = await prisma.credential.findUnique({
      where: { id: credentials },
    });
    if (!credential) {
      environment.log.error("credential not found");
      return false;
    }

    const apiKey = symmetricDecrypt(credential.value);
    if (!apiKey) {
      environment.log.error("cannot decrypt credential");
      return false;
    }

    // 🤖 Groq client
    const groq = new Groq({ apiKey });

    const systemMsg =
      "You are a webscraper helper that ONLY outputs valid JSON. " +
      "Never include explanations, only return the JSON. " +
      "If no data is found, return []. " +
      "Output format must always be strict JSON without extra characters.";

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemMsg },
      { role: "user", content: String(content) },
      { role: "user", content: String(prompt) },
    ];

    // ✅ Updated model list
    const modelCandidates = [
      "llama-3.1-8b-instant",
      "llama3-70b-8192",
      "llama3-8b-8192",
    ];

    let response: ChatCompletion | null = null;
    let lastErr: any;

    for (const model of modelCandidates) {
      try {
        response = await groq.chat.completions.create({
          model,
          messages,
          temperature: 0,
        });
        break; // ✅ success
      } catch (e: any) {
        lastErr = e;
        environment.log.error?.(`Groq model "${model}" failed: ${e?.message}`);
      }
    }

    if (!response) {
      environment.log.error(
        lastErr?.message || "Groq request failed with all model candidates"
      );
      return false;
    }

    environment.log.info?.(
      `Prompt tokens: ${response.usage?.prompt_tokens}, ` +
        `Completion tokens: ${response.usage?.completion_tokens}`
    );

    let result = response.choices[0]?.message?.content?.trim();
    if (!result) {
      environment.log.error("Empty response from AI");
      return false;
    }

    // 🧹 Remove ```json blocks if present
    result = result
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 🧹 Extract only first JSON block if extra text sneaks in
    const jsonMatch = result.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      environment.log.error("No valid JSON object/array found in response");
      return false;
    }

    result = jsonMatch[0]; // take only JSON part

    // ✅ Validate JSON
    try {
      JSON.parse(result);
    } catch (e) {
      environment.log.error?.(
        `Invalid JSON after cleanup: ${(e as Error).message}`
      );
      return false;
    }

    environment.setOutput("Extracted data", result);
    return true;
  } catch (err: any) {
    environment.log.error(err.message);
    return false;
  }
}

// chatgpt setup
//  eslint-disable @typescript-eslint/no-explicit-any */
// import { ExecutionEnvironment } from "@/types/executor";
// import { ExtractDataWithAITask } from "../task/ExtractDataWithAI";
// import prisma from "@/lib/prisma";
// import { symmetricDecrypt } from "@/lib/encryption";
// import OpenAI from "openai";

// export async function ExtractDataWithAiExecutor(
//   environment: ExecutionEnvironment<typeof ExtractDataWithAITask>
// ): Promise<boolean> {
//   try {
//     const credentials = await environment.getInput("Credentials");
//     if (!credentials) {
//       environment.log.error("input=>credentials not defined");
//     }

//     const prompt = await environment.getInput("Prompt");
//     if (!prompt) {
//       environment.log.error("input=>prompt not defined");
//     }

//     const content = await environment.getInput("Content");
//     if (!content) {
//       environment.log.error("input=>content not defined");
//     }

//     // Get credentials from DB
//     const credential = await prisma.credential.findUnique({
//       where: { id: credentials },
//     });
//     if (!credential) {
//       environment.log.error("credential not found");
//       return false;
//     }

//     const plainCredentialsValue = symmetricDecrypt(credential.value);
//     if (!plainCredentialsValue) {
//       environment.log.error("cannot decrypt credential");
//       return false;
//     }
// console.log("@@OPen ai starts here",plainCredentialsValue);

//     const openai = new OpenAI({
//       apiKey: plainCredentialsValue,
//     });

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content: `You are a webscraper helper that extracts data form HTML or text. you will be given a piece of text or HTML content as input and also the prompt with the data you have to extract. The response should always be only the extracted data as a JSON array or object, without any additional words or explanations. Analyze the input carefully and extract data precisely based on the prompt. If no data is found, return an empty JSON array. Work only with the provided content and ensure the output is always a valid JSON array without any surrounding text`,
//         },
//         {
//           role: "user",
//           content: content,
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       temperature: 1,
//     });
//     console.log(`Prompt tokens: ${response.usage?.prompt_tokens}`);
//     console.log(`Completition tokens: ${response.usage?.completion_tokens}`);
//     const result = response.choices[0].message.content;
//     if (!result) {
//       environment.log.error("Empty response from AI");
//       return false;
//     }
//     environment.setOutput("Extracted data", result);

//     return true;
//   } catch (err: any) {
//     environment.log.error(err.message);
//     return false;
//   }
// }

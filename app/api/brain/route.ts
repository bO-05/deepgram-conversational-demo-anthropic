// import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Anthropic } from '@anthropic-ai/sdk';

// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const start = Date.now();

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const systemMessage = messages.find((message) => message.role === 'system');
    const userMessages = messages.filter(
      (message) => message.role !== 'system'
    );

    if (userMessages.length === 0) {
      // If there are no user messages, add a default user message
      userMessages.push({ role: 'user', content: 'Hello' });
    } else if (userMessages[0].role !== 'user') {
      // If the first message is not from the user, add a default user message at the beginning
      userMessages.unshift({ role: 'user', content: 'Hello' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      // model: 'claude-3-haiku-20240307',
      // model: 'claude-3-opus-20240229',
      messages: userMessages,
      max_tokens: 2000,
      temperature: 0.6,
      system: systemMessage?.content,
    });

    const content = response['content'][0]['text'];

    const text = content
      .replace(/\\n\\n/g, '. ')
      .replace(/\\n/g, '. ')
      .replace(/\n\n/g, '. ')
      .replace(/\n/g, '. ');

    // return new Response(JSON.stringify(response), {
    // return new Response(JSON.stringify(content), {
    return new Response(JSON.stringify(text), {
      headers: {
        'X-LLM-Start': `${start}`,
        'X-LLM-Response': `${Date.now()}`,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
    });
  }
}

// export async function POST(req: Request) {
//   const { messages } = await req.json();
//   const start = Date.now();

//   const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

//   try {
//     const systemMessage = messages.find((message) => message.role === 'system');
//     const userMessages = messages.filter(
//       (message) => message.role !== 'system'
//     );

//     if (userMessages.length === 0) {
//       // If there are no user messages, add a default user message
//       userMessages.push({ role: 'user', content: 'Hello' });
//     }

//     const response = await anthropic.messages.create({
//       model: 'claude-3-opus-20240229',
//       messages: userMessages,
//       max_tokens: 4000,
//       temperature: 0.6,
//       system: systemMessage?.content,
//     });

//     const content = response.content[0].text;

//     return new Response(JSON.stringify({ content }), {
//       headers: {
//         'X-LLM-Start': `${start}`,
//         'X-LLM-Response': `${Date.now()}`,
//       },
//     });
//   } catch (error) {
//     console.error('Error:', error);
//     return new Response(JSON.stringify({ error: 'An error occurred' }), {
//       status: 500,
//     });
//   }
// }

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

// export async function POST(req: Request) {
//   // Extract the `messages` from the body of the request
//   const { messages } = await req.json();
//   const start = Date.now();

//   // Request the OpenAI API for the response based on the prompt
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo-0125",
//       stream: true,
//       messages: messages,
//     });

//     const stream = OpenAIStream(response);

//     return new StreamingTextResponse(stream, {
//       headers: {
//         "X-LLM-Start": `${start}`,
//         "X-LLM-Response": `${Date.now()}`,
//       },
//     });
//   } catch (error) {
//     console.error("test", error);
//   }
// }

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // apiKey: "AIzaSyALXFB3NRuEcPxYqkfbrJ6UVEnCY0m4Img",
      // apiKey: "AIzaSyBE-ylW8NcRr-dsGqUG3XZlHrMLiMyxcHc",
      apiKey: process.env.GENKIT_API_KEY as string,
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});

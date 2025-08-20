import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
      apiKey: "AIzaSyBE-ylW8NcRr-dsGqUG3XZlHrMLiMyxcHc",
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});

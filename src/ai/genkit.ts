import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: "AIzaSyALXFB3NRuEcPxYqkfbrJ6UVEnCY0m4Img",
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});

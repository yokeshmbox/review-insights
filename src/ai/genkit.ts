import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // apiKey: "AIzaSyALXFB3NRuEcPxYqkfbrJ6UVEnCY0m4Img",
      // apiKey: "AIzaSyBE-ylW8NcRr-dsGqUG3XZlHrMLiMyxcHc",
      apiKey: "AIzaSyClLC1ec_MU7X2xira4DxzIcBbDREcpJwk",
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});


'use server';
/**
 * @fileOverview Generates a consolidated summary and key positives from reviews.
 *
 * - generateSummary - Generates the summary.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const GenerateSummaryInputSchema = z.object({
  reviews: z.array(z.string()).describe('An array of all customer review strings.'),
});
type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  consolidatedReview: z.string().describe('A consolidated summary of all reviews.'),
  keyPositives: z.string().describe('A summary of key positive aspects, formatted as a bulleted list. If none, return an empty string.'),
});
type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(
  input: GenerateSummaryInput
): Promise<GenerateSummaryOutput> {
  return await generateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: {schema: GenerateSummaryInputSchema},
  output: {schema: GenerateSummaryOutputSchema},
  model: googleAI.model('gemini-2.5-flash-lite'),
  system: `You are an expert hospitality analyst. Based on the provided reviews, generate:
1.  A concise summary (2-3 sentences) of the overall sentiment.
2.  A bulleted list of the main positive points. If there are no clear positive points, you MUST return an empty string.`,
  prompt: `
Reviews to analyze:
{{#each reviews}}
- {{{this}}}
{{/each}}
`,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to return a valid summary.');
    }
    return {
      consolidatedReview: output.consolidatedReview || 'No summary available.',
      keyPositives: output.keyPositives || '',
    };
  }
);

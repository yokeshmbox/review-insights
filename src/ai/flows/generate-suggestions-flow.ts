
'use server';
/**
 * @fileOverview Generates actionable suggestions based on customer reviews.
 *
 * - generateSuggestions - Generates suggestions.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  GroupedTopicSuggestionSchema
} from '@/ai/schemas';
import { googleAI } from '@genkit-ai/googleai';

const GenerateSuggestionsInputSchema = z.object({
  reviews: z.array(z.string()).describe('An array of all customer review strings.'),
});
type GenerateSuggestionsInput = z.infer<typeof GenerateSuggestionsInputSchema>;


const GenerateSuggestionsOutputSchema = z.object({
  suggestions: z.array(GroupedTopicSuggestionSchema).describe('A list of actionable suggestions for improvement, grouped by topic. If none, return an empty array.'),
});
type GenerateSuggestionsOutput = z.infer<typeof GenerateSuggestionsOutputSchema>;


export async function generateSuggestions(
  input: GenerateSuggestionsInput
): Promise<GenerateSuggestionsOutput> {
    return await generateSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSuggestionsPrompt',
  input: {schema: GenerateSuggestionsInputSchema},
  output: {schema: GenerateSuggestionsOutputSchema},
  model: googleAI.model('gemini-1.5-flash'),
  system: `Based on all reviews, provide a list of the most critical, actionable suggestions for improvement. 
  
  IMPORTANT: You MUST group all suggestions for the same topic into a single object with a 'suggestions' array. Do not create duplicate entries for the same topic.
  
  If no suggestions can be derived from the reviews, you MUST return an empty array.`,
  prompt: `
Reviews to analyze:
{{#each reviews}}
- {{{this}}}
{{/each}}
`,
});

const generateSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateSuggestionsFlow',
    inputSchema: GenerateSuggestionsInputSchema,
    outputSchema: GenerateSuggestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to return valid suggestions.');
    }
    return {
        suggestions: output.suggestions || []
    };
  }
);

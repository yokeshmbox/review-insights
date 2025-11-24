
'use server';
/**
 * @fileOverview Generates actionable suggestions based on customer reviews.
 *
 * - generateSuggestions - Generates suggestions.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  GroupedTopicSuggestionSchema,
  TopicSuggestion,
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
  model: googleAI.model('gemini-2.5-flash-lite'),
  system: `Based on all reviews, provide a list of the most critical, actionable suggestions for improvement. 
  
For each topic, you MUST synthesize the feedback into only 1 or 2 unique, high-impact suggestions. DO NOT list every possible suggestion.

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
    if (!output || !Array.isArray(output.suggestions)) {
      throw new Error('The AI model failed to return valid suggestions.');
    }

    // Post-process to merge suggestions for the same topic
    const suggestionsMap = new Map<string, string[]>();

    output.suggestions.forEach(item => {
      // Validate that the item has both topic and suggestions array
      const parsed = GroupedTopicSuggestionSchema.safeParse(item);
      if (parsed.success) {
        const { topic, suggestions } = parsed.data;
        if (!suggestionsMap.has(topic)) {
          suggestionsMap.set(topic, []);
        }
        suggestionsMap.get(topic)!.push(...suggestions);
      }
    });

    const groupedSuggestions = Array.from(suggestionsMap.entries()).map(([topic, suggestions]) => ({
      topic: topic as TopicSuggestion['topic'],
      suggestions: suggestions,
    }));
    
    return {
        suggestions: groupedSuggestions,
    };
  }
);

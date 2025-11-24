
'use server';
/**
 * @fileOverview Generates detailed analysis for each review topic.
 *
 * - generateTopicAnalysis - Generates the topic analysis.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  TopicAnalysisSchema,
} from '@/ai/schemas';
import { googleAI } from '@genkit-ai/googleai';

const GenerateTopicAnalysisInputSchema = z.object({
  reviews: z.array(z.string()).describe('An array of all customer review strings, potentially pre-grouped by topic.'),
});
type GenerateTopicAnalysisInput = z.infer<typeof GenerateTopicAnalysisInputSchema>;

const GenerateTopicAnalysisOutputSchema = z.object({
    detailedTopicAnalysis: z.array(TopicAnalysisSchema).describe('A detailed analysis for each topic category.')
});
type GenerateTopicAnalysisOutput = z.infer<typeof GenerateTopicAnalysisOutputSchema>;


export async function generateTopicAnalysis(
  input: GenerateTopicAnalysisInput
): Promise<GenerateTopicAnalysisOutput> {
    return await generateTopicAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTopicAnalysisPrompt',
  input: {schema: GenerateTopicAnalysisInputSchema},
  output: {schema: GenerateTopicAnalysisOutputSchema},
  model: googleAI.model('gemini-2.5-flash-lite'),
  system: `You are an expert hospitality analyst. The user will provide reviews, potentially grouped by topic.
For EACH topic ('Reservation', 'Management Service', 'Food', 'Payment', 'Other'), you MUST perform the following steps based *only* on the reviews provided for that specific topic:
1.  Derive the topic name.
2.  Create a 'positiveSummary': A SINGLE, BRIEF, AND CONCISE (max 10 words) sentence summarizing positive feedback.
3.  Create a 'negativeSummary': A SINGLE, BRIEF, AND CONCISE (max 10 words) sentence summarizing negative feedback.
4.  Create a 'suggestions' list: Provide 1-2 SHORT, CONCRETE, and PRACTICAL steps for improvement.

IMPORTANT RULES:
- If no reviews are provided for a topic, you MUST return "No feedback provided for this topic." for both summaries and an empty array for suggestions.
- If there is no positive feedback for a topic, the positiveSummary MUST be "No positive feedback provided.".
- If there is no negative feedback for a topic, the negativeSummary MUST be "No negative feedback provided.".
- If no actionable suggestions can be made, the suggestions array MUST be empty.
- Your entire output must conform to the JSON schema. Do not invent feedback.`,
  prompt: `
Reviews to analyze:
{{#each reviews}}
{{{this}}}
{{/each}}
`,
});

const generateTopicAnalysisFlow = ai.defineFlow(
  {
    name: 'generateTopicAnalysisFlow',
    inputSchema: GenerateTopicAnalysisInputSchema,
    outputSchema: GenerateTopicAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to return a valid topic analysis.');
    }
    return {
        detailedTopicAnalysis: output.detailedTopicAnalysis || []
    };
  }
);

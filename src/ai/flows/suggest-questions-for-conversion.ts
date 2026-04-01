'use server';

/**
 * @fileOverview A flow to suggest questions for increasing user conversion rates in a form.
 *
 * - suggestQuestionsForConversion - A function that suggests questions to increase conversion rates.
 * - SuggestQuestionsInput - The input type for the suggestQuestionsForConversion function.
 * - SuggestQuestionsOutput - The return type for the suggestQuestionsForConversion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestQuestionsInputSchema = z.object({
  formDescription: z
    .string()
    .describe('A description of the form and its purpose.'),
  currentQuestions: z
    .array(z.string())
    .describe('The list of questions currently in the form.'),
});
export type SuggestQuestionsInput = z.infer<typeof SuggestQuestionsInputSchema>;

const SuggestQuestionsOutputSchema = z.object({
  suggestedQuestions: z
    .array(z.string())
    .describe(
      'A list of suggested questions to improve user conversion rates for the form.'
    ),
});
export type SuggestQuestionsOutput = z.infer<typeof SuggestQuestionsOutputSchema>;

export async function suggestQuestionsForConversion(
  input: SuggestQuestionsInput
): Promise<SuggestQuestionsOutput> {
  return suggestQuestionsForConversionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestQuestionsForConversionPrompt',
  input: {schema: SuggestQuestionsInputSchema},
  output: {schema: SuggestQuestionsOutputSchema},
  prompt: `You are an expert in form design and user conversion optimization.

  Given the following form description and the current list of questions, suggest a list of questions that would improve user conversion rates.
  The suggested questions should be relevant to the form's purpose and designed to gather information that will increase the likelihood of users completing the form.
  Do not repeat existing questions.

  Form Description: {{{formDescription}}}
  Current Questions: {{#each currentQuestions}}{{{this}}}\n{{/each}}

  Suggested Questions:
  `, // Keep newlines as \n
});

const suggestQuestionsForConversionFlow = ai.defineFlow(
  {
    name: 'suggestQuestionsForConversionFlow',
    inputSchema: SuggestQuestionsInputSchema,
    outputSchema: SuggestQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


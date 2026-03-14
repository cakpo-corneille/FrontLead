'use server';

/**
 * @fileOverview Generates a captive portal form based on a description of the desired fields.
 *
 * - generateFormFromDescription - A function that generates the form.
 * - GenerateFormFromDescriptionInput - The input type for the generateFormFromDescription function.
 * - GenerateFormFromDescriptionOutput - The return type for the generateFormFromDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFormFromDescriptionInputSchema = z.object({
  description: z.string().describe('A description of the desired fields for the captive portal form.'),
});

export type GenerateFormFromDescriptionInput = z.infer<typeof GenerateFormFromDescriptionInputSchema>;

const GenerateFormFromDescriptionOutputSchema = z.object({
  formSchema: z.string().describe('A minified JSON string representing the generated form. The JSON object should have a single key "fields" which is an array of field objects.'),
  suggestedQuestions: z.array(z.string()).optional().describe('A list of suggested questions to increase user conversion rates.'),
});

export type GenerateFormFromDescriptionOutput = z.infer<typeof GenerateFormFromDescriptionOutputSchema>;

export async function generateFormFromDescription(input: GenerateFormFromDescriptionInput): Promise<GenerateFormFromDescriptionOutput> {
  return generateFormFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFormFromDescriptionPrompt',
  input: { schema: GenerateFormFromDescriptionInputSchema },
  output: { schema: GenerateFormFromDescriptionOutputSchema },
  prompt: `You are an expert in generating JSON schemas for captive portal forms.
Based on the user's description, create a valid JSON object that represents the form schema.

**Instructions for the JSON Schema:**

1.  The root of the JSON must be an object.
2.  This object must contain a key named "fields" which is an array of field objects.
3.  Each field object in the "fields" array must have the following properties:
    * "name": A string (lowercase, snake_case) used as a unique identifier.
    * "label": A string, the user-visible label for the form field (e.g., "Prénom").
    * "type": A string, must be one of the following values: 'text', 'email', 'phone', 'number', 'select', 'boolean'.
    * "placeholder": A string (optional), example text for the input.
    * "required": A boolean, true if the field is mandatory, false otherwise.
    * "options": An array of strings (only for type: "select"), representing the dropdown options.

**Strict Typing Rules:**

* If the user asks for an email field, the type **must** be 'email'.
* If the user asks for a phone number field, the type **must** be 'phone'.
* If the user asks for a WhatsApp number, the type **must** be 'phone'.
* If the user asks for a number field (like age), the type **must** be 'number'.
* For any other general text input (like name, city, etc.), the type **must** be 'text'.
* The type property can never be 'string'. Use 'text' for string-based inputs.

**Important Constraints:**

* The total number of fields generated **must not exceed 5**.
* The form **must** include at least one field of type 'email' or 'phone'. This is a mandatory requirement.

**Example of the expected JSON output format:**
\`\`\`json
{
  "fields": [
    {
      "name": "full_name",
      "label": "Nom complet",
      "type": "text",
      "placeholder": "Entrez votre nom complet",
      "required": true
    },
    {
      "name": "user_email",
      "label": "Adresse Email",
      "type": "email",
      "placeholder": "vous@exemple.com",
      "required": true
    }
  ]
}
\`\`\`

Now, generate a form schema and optionally some suggested questions based on the following user description.
Your output for the formSchema field must be a raw, minified JSON string, without any markdown formatting like \`\`\`json.
The suggestedQuestions field should be an array of strings.

User Description: {{description}}
`,
});

const generateFormFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateFormFromDescriptionFlow',
    inputSchema: GenerateFormFromDescriptionInputSchema,
    outputSchema: GenerateFormFromDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
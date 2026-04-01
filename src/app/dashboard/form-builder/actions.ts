'use server';

import { generateFormFromDescription } from '@/ai/flows/generate-form-from-description';
import { suggestQuestionsForConversion } from '@/ai/flows/suggest-questions-for-conversion';
import { z } from 'zod';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'phone' | 'select' | 'boolean' | 'whatsapp';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

interface FormSchema {
  title: string;
  description: string;
  fields: FormField[];
}

export async function generateForm(
  description: string
): Promise<{ formSchema: FormSchema | null; suggestedQuestions: string[]; error?: string }> {
  try {
    const result = await generateFormFromDescription({ description });
    
    // Attempt to parse the JSON schema string
    let parsedSchema: FormSchema;
    try {
      parsedSchema = JSON.parse(result.formSchema);
    } catch (e) {
      console.error('Failed to parse form schema:', e);
      throw new Error('L\'IA a renvoyé un format de formulaire non valide. Essayez de reformuler votre demande.');
    }

    return {
      formSchema: parsedSchema,
      suggestedQuestions: result.suggestedQuestions || [],
    };
  } catch (error) {
    console.error('Error generating form:', error);
    return {
      formSchema: null,
      suggestedQuestions: [],
      error: (error as Error).message,
    };
  }
}

const SuggestQuestionsInputSchema = z.object({
    formDescription: z.string(),
    currentQuestions: z.array(z.string()),
});

export async function suggestQuestions(
  input: z.infer<typeof SuggestQuestionsInputSchema>
): Promise<{ suggestedQuestions?: string[]; error?: string }> {
  try {
    const result = await suggestQuestionsForConversion(input);
    return {
      suggestedQuestions: result.suggestedQuestions,
    };
  } catch (error) {
    console.error('Error suggesting questions:', error);
    return {
      error: (error as Error).message,
    };
  }
}

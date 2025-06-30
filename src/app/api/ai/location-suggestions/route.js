import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || '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');

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a helpful travel assistant for a Romanian accommodation booking website. 
    Given a user's description of their ideal destination, suggest relevant locations in Romania.
    Format your response as a JSON array of objects with these properties:
    - location: The suggested location name
    - description: A brief description of why it matches their criteria
    - type: The type of destination (mountain, seaside, urban, rural)
    Limit to 3-5 suggestions.`;

    const userPrompt = `User request: "${prompt}"
    
    Respond only with the JSON array, no other text.`;

    // Using the facebook/opt-350m model which is free and good for text generation
    const response = await hf.textGeneration({
      model: 'facebook/opt-350m',
      inputs: `${systemPrompt}\n\n${userPrompt}`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.2,
      },
    });

    let suggestions;
    try {
      // Extract the JSON part from the response
      const jsonStr = response.generated_text.substring(
        response.generated_text.indexOf('['),
        response.generated_text.lastIndexOf(']') + 1
      );
      suggestions = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      suggestions = [];
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 
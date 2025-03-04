import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Convert image to base64
    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    
    // Call OpenAI Vision API to analyze the image
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract a cohesive color palette from this image. Provide exactly 5 colors: primary, secondary, accent, background, and text color. Return only a JSON object with hex color codes."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });
    
    // Parse the response
    const colorData = JSON.parse(response.choices[0].message.content || '{}');
    
    return NextResponse.json(colorData);
  } catch (error) {
    console.error('Error extracting colors:', error);
    return NextResponse.json(
      { error: 'Failed to extract colors' },
      { status: 500 }
    );
  }
} 
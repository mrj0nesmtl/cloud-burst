import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Only initialize OpenAI if API key is available
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Default color palette to use when OpenAI is not available
const defaultColorPalette = {
  primary: "#3B82F6",
  secondary: "#10B981",
  accent: "#F59E0B",
  background: "#F3F4F6",
  text: "#1F2937"
};

export async function POST(request: NextRequest) {
  try {
    // If OpenAI is not configured, return default colors
    if (!openai) {
      console.warn('OpenAI API key not configured, using default color palette');
      return NextResponse.json(defaultColorPalette);
    }
    
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
      defaultColorPalette,
      { status: 200 }
    );
  }
} 
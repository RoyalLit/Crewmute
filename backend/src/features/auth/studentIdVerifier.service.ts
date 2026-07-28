import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../../shared/logger';

export interface VerificationResult {
  isVerified: boolean;
  confidence: number;
  extractedName?: string;
  extractedCollege?: string;
  reason?: string;
}

export async function verifyStudentIdWithAI(
  photoUrlOrBase64: string,
  userName: string,
  collegeName: string
): Promise<VerificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if no API key is set yet — defaults to pending admin review safely
  if (!apiKey) {
    logger.warn('GEMINI_API_KEY not set. Defaulting Student ID verification to pending admin review.');
    return {
      isVerified: false,
      confidence: 0,
      reason: 'AI key unconfigured — flagged for admin dashboard review',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let imagePart: { inlineData: { data: string; mimeType: string } };

    if (photoUrlOrBase64.startsWith('data:image')) {
      const parts = photoUrlOrBase64.split(',');
      const mimeMatch = photoUrlOrBase64.match(/data:(.*?);base64/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = parts[1] || parts[0];

      imagePart = {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      };
    } else {
      // If it's a URL, fallback to manual verification safely
      return {
        isVerified: false,
        confidence: 0.5,
        reason: 'Image is hosted URL — queued for admin review',
      };
    }

    const prompt = `You are a strict security AI verifying student identity cards for a college ride-sharing app.
Target Student Name: "${userName}"
Target College/University Name: "${collegeName}"

Examine the uploaded image. Check if:
1. It is a genuine, valid physical Student ID Card or Campus Access Pass.
2. The name printed on the card matches or substantially matches "${userName}".
3. The college/university name matches or substantially matches "${collegeName}".

Respond ONLY with valid JSON in this exact structure:
{
  "isVerified": boolean,
  "confidence": number,
  "extractedName": string,
  "extractedCollege": string,
  "reason": string
}`;

    const response = await model.generateContent([prompt, imagePart]);
    const responseText = response.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as VerificationResult;
      logger.info(`AI Student ID verification result for ${userName}: verified=${parsed.isVerified}, confidence=${parsed.confidence}`);
      return parsed;
    }

    return {
      isVerified: false,
      confidence: 0,
      reason: 'Could not parse AI response',
    };
  } catch (error: any) {
    logger.error(`AI Student ID Verification error: ${error.message}`);
    return {
      isVerified: false,
      confidence: 0,
      reason: error.message,
    };
  }
}

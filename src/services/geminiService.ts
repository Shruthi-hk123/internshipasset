import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export function hasConfiguredGeminiKey(): boolean {
  return Boolean(apiKey);
}

export const geminiService = {
  /**
   * Predicts maintenance needs based on asset history
   */
  async predictMaintenance(asset: any, logs: any[]) {
    if (!ai) {
      return {
        riskScore: 0,
        recommendation: "AI Copilot is running in offline mode. Add VITE_GEMINI_API_KEY to enable live AI analysis.",
      };
    }
    const prompt = `
      Analyze the following asset and its maintenance history to predict potential future failures or maintenance needs.
      Asset: ${JSON.stringify(asset)}
      Logs: ${JSON.stringify(logs)}
      
      Provide a risk score (1-100) and a brief recommendation.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.NUMBER },
              recommendation: { type: Type.STRING },
              predictedFailureDate: { type: Type.STRING, description: "ISO date string or 'Unknown'" }
            },
            required: ["riskScore", "recommendation"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Maintenance Prediction Error:", error);
      return { riskScore: 0, recommendation: "AI analysis unavailable right now. Please try again shortly." };
    }
  },

  /**
   * Suggests asset allocation based on employee role and department
   */
  async suggestAllocation(employee: any, availableAssets: any[]) {
    if (!ai) {
      return { suggestions: [], message: "AI key missing. Using fallback mode." };
    }
    const prompt = `
      Suggest the best available assets for the following employee based on their role and department.
      Employee: ${JSON.stringify(employee)}
      Available Assets: ${JSON.stringify(availableAssets.slice(0, 10))}
      
      Return a list of suggested asset IDs with reasoning.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    assetId: { type: Type.STRING },
                    reasoning: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Allocation Suggestion Error:", error);
      return { suggestions: [] };
    }
  },

  /**
   * Detects suspicious activity in asset movements
   */
  async detectSuspiciousActivity(logs: any[]) {
    if (!ai) {
      return { flaggedActivities: [], message: "AI key missing. Using fallback mode." };
    }
    const prompt = `
      Analyze the following audit logs for any suspicious activity or patterns that might indicate asset misuse or theft.
      Logs: ${JSON.stringify(logs.slice(0, 20))}
      
      Return a list of flagged activities with a severity level.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flaggedActivities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    logId: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] }
                  }
                }
              }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Suspicious Activity Detection Error:", error);
      return { flaggedActivities: [] };
    }
  }
};

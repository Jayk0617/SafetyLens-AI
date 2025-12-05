import { GoogleGenAI, Type } from "@google/genai";
import { GenerationConfig, Question, QuestionType, UploadedMedia } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean base64 string for any mime type
const cleanBase64 = (data: string) => {
  const base64Index = data.indexOf(';base64,');
  if (base64Index !== -1) {
    return data.substring(base64Index + 8);
  }
  return data;
};

export const generateQuestionsFromMedia = async (
  mediaList: UploadedMedia[],
  config: GenerationConfig
): Promise<Question[]> => {
  
  if (mediaList.length === 0) throw new Error("Please upload at least one image or video.");

  const model = "gemini-2.5-flash"; // Supports image and video
  // Reduced batch size to ensure output token limits are not exceeded and counts are strict
  const BATCH_SIZE = 10;
  const totalNeeded = config.count;
  const batches = Math.ceil(totalNeeded / BATCH_SIZE);
  
  let allQuestions: Question[] = [];

  // Function to generate a single batch
  const generateBatch = async (count: number, batchIndex: number) => {
    // Construct the prompt
    const typeString = config.types.join(", ");
    const promptText = `
      你是一名资深企业安全专家。
      请分析上传的实景图片或视频内容，识别其中存在的安全隐患（或确认安全合规的点）。
      基于这些分析，生成一份企业安全培训题库。

      本批次任务严格要求：
      1. 必须准确生成 ${count} 道试题，数量不能多也不能少。
      2. 试题类型必须限定在：${typeString} 之中。
      3. 难度级别：${config.difficulty}。
      4. 题目内容必须与画面中的场景、设备、操作或环境紧密相关。
      5. **严禁引用**：题目文字中绝对不能出现“如图所示”、“根据图片”、“视频中”、“图1”、“上图”等任何引用素材的字样。题目必须是独立的场景描述，让考生仿佛置身于该场景中。
      6. **选项要求**：对于“单选题”和“多选题”，每道题**必须且只能**包含 A、B、C、D 四个选项。选项内容放在 options 数组中，顺序对应 A, B, C, D。**请注意：选项字符串内容本身不要包含 "A."、"B." 等前缀字母，只提供选项描述文字即可。**
      7. **完整性**：每道题必须包含题目内容、选项（数组）、正确答案（单选题为一个选项内容或字母，多选题为多个）、解析（解释为何这样做是安全/不安全的，引用相关通用安全规范）、以及该题目针对的具体隐患点。
      8. 输出格式必须是严格的JSON数组。
    `;

    const parts = [];
    
    // Add media
    for (const media of mediaList) {
      parts.push({
        inlineData: {
          mimeType: media.mimeType,
          data: cleanBase64(media.base64Data),
        },
      });
    }

    // Add prompt
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: `你是一个严格遵循输出格式的安全题库生成助手。
        1. 只输出标准的JSON数组格式。
        2. 生成的题目文字中绝对不要包含'图片'、'视频'、'如图'等字样。
        3. 单选题和多选题必须严格包含A、B、C、D四个选项。**选项字符串中不要包含A. B.等前缀。**
        4. 严格生成请求数量的题目。`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: [QuestionType.SINGLE_CHOICE, QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE] },
              content: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              hazardFocus: { type: Type.STRING }
            },
            required: ["type", "content", "answer", "explanation", "hazardFocus"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Map to add IDs
      return data.map((q: any, index: number) => ({
        ...q,
        id: `gen-${Date.now()}-${batchIndex}-${index}`
      }));
    } else {
      throw new Error("No data received from Gemini.");
    }
  };

  try {
    // Execute batches sequentially
    for (let i = 0; i < batches; i++) {
      const remaining = totalNeeded - allQuestions.length;
      const currentBatchCount = Math.min(BATCH_SIZE, remaining);
      
      if (currentBatchCount <= 0) break;

      const batchQuestions = await generateBatch(currentBatchCount, i);
      allQuestions = [...allQuestions, ...batchQuestions];
    }

    return allQuestions;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
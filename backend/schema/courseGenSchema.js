const { Type } = require('@google/genai');

const courseGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    level: { type: Type.STRING },
    imageUrl: { type: Type.STRING },
    chapters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          lessons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                xp: { type: Type.NUMBER },
                quiz: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    questions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          question: { type: Type.STRING },
                          options: { type: Type.ARRAY, items: { type: Type.STRING } },
                          correctAnswer: { type: Type.STRING },
                        },
                        required: ["question", "options", "correctAnswer"],
                      },
                    },
                  },
                  required: ["title", "questions"],
                },
              },
              required: ["title", "content", "xp", "quiz"],
            },
          },
        },
        required: ["title", "lessons"],
      },
    },
  },
  required: ["title", "description", "level", "imageUrl", "chapters"],
};

module.exports = courseGenerationSchema;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { difficulty, questionNumber, topics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const topicList = topics || [
      "Java basics",
      "OOPs concepts (Inheritance, Polymorphism, Abstraction, Encapsulation)",
      "Arrays",
      "Strings",
      "Stack",
      "Queue",
      "Linked List",
      "Binary Tree",
      "Time Complexity",
      "Exception Handling",
      "Collections Framework",
      "Multithreading basics"
    ];

    const randomTopic = topicList[Math.floor(Math.random() * topicList.length)];

    const difficultyGuide = {
      low: "simple, straightforward questions testing basic knowledge. Should be easy for beginners.",
      medium: "moderate difficulty requiring good understanding. Include some code snippets.",
      hard: "challenging questions requiring deep understanding. Include complex code or tricky concepts."
    };

    const systemPrompt = `You are a Java programming quiz question generator for a Christmas-themed quiz app. 
Generate ONE unique, engaging multiple-choice question about Java programming.

RULES:
1. Generate a question about: ${randomTopic}
2. Difficulty level: ${difficulty} - ${difficultyGuide[difficulty as keyof typeof difficultyGuide]}
3. Include 4 options (A, B, C, D)
4. Only ONE option should be correct
5. For code questions, use proper formatting
6. Make questions educational and interesting
7. Avoid ambiguous or trick questions
8. Each question should be unique and not repetitive

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "question": "The question text here. For code, use \\n for new lines.",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctIndex": 0,
  "explanation": "Brief explanation of why the correct answer is right",
  "topic": "${randomTopic}",
  "hasCode": false
}

If the question contains code, set hasCode to true and format code properly in the question string.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Generate question #${questionNumber} for the ${difficulty} difficulty Java quiz. Make it unique and interesting! Topic focus: ${randomTopic}` 
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let questionData;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a fallback question
      questionData = {
        question: "What is the correct way to declare a main method in Java?",
        options: [
          "public static void main(String[] args)",
          "public void main(String args)",
          "static public main(String[] args)",
          "void main(String args[])"
        ],
        correctIndex: 0,
        explanation: "The main method in Java must be public, static, return void, and accept a String array as parameter.",
        topic: "Java basics",
        hasCode: false
      };
    }

    // Validate the response structure
    if (!questionData.question || !Array.isArray(questionData.options) || 
        questionData.options.length !== 4 || typeof questionData.correctIndex !== 'number') {
      throw new Error("Invalid question structure");
    }

    console.log(`Generated question #${questionNumber} for ${difficulty} difficulty on topic: ${questionData.topic}`);

    return new Response(JSON.stringify(questionData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-question function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      // Fallback question in case of error
      fallback: {
        question: "Which keyword is used to inherit a class in Java?",
        options: ["extends", "implements", "inherits", "using"],
        correctIndex: 0,
        explanation: "The 'extends' keyword is used to inherit a class in Java.",
        topic: "OOPs - Inheritance",
        hasCode: false
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

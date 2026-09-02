import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Server-Side Gemini Initialization
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. AI Tutor & Socratic Dialogue Endpoint
app.post("/api/tutor/chat", async (req, res) => {
  try {
    const { message, history, grade, subject, mode, concept } = req.body;
    const ai = getGenAI();

    let systemInstruction = `You are SchoolGenius AI, the world's best personalized school tutor for Grade ${grade || "9"} student studying ${subject || "General Science & Mathematics"}.
Tone: Encouraging, ultra-clear, patient, structured with markdown, bullet points, and LaTeX-friendly equations where helpful. Avoid overwhelming jargon unless appropriate for Grade ${grade}.`;

    if (mode === "socratic") {
      systemInstruction += `\nMODE: SOCRATIC TUTOR. DO NOT immediately give away the final answer! Ask thought-provoking guiding questions, offer subtle hints, break the problem into bite-sized steps, and encourage the student to discover the solution themselves.`;
    } else if (mode === "explain-5-ways") {
      systemInstruction += `\nMODE: EXPLAIN-IT-DIFFERENTLY. Explain the concept "${concept || message}" in exactly 5 distinct styles:
1. 👶 ELI5 (Explain Like I'm 5 / Super Simple Everyday Analogy)
2. 🔬 Deep STEM Concept (Core Scientific/Mathematical principles & equations)
3. 🌍 Real-World Story / Everyday Application
4. 🧠 Visual Mind-Picture & Mental Model (Describing how to visualize it in your head)
5. ⚡ 30-Second Bullet Summary (Key formula/definition for exams). Format clearly with distinct markdown headers for each of the 5.`;
    } else if (mode === "teach-back") {
      systemInstruction += `\nMODE: TEACH-BACK EVALUATOR. The student is pretending to teach you the concept "${concept || "this topic"}". Evaluate how well they understood it. Highlight what they got right, gently correct any misconceptions, give a Clarity Score (out of 10), and suggest 1 clever extension question.`;
    } else if (mode === "viva") {
      systemInstruction += `\nMODE: VIVA / ORAL EXAM COACH. You are an encouraging external board examiner conducting an oral viva. Ask a precise conceptual question, evaluate the student's verbal answer, give constructive feedback on conceptual precision, and ask the next natural follow-up question.`;
    }

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text || h.content || "" }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "I'm thinking... Let's review that step!" });
  } catch (error: any) {
    console.error("Error in /api/tutor/chat:", error);
    res.status(500).json({ error: error.message || "Failed to generate tutor response" });
  }
});

// 3. Homework & Vision Doubt Solver Endpoint
app.post("/api/homework/solve", async (req, res) => {
  try {
    const { question, imageBase64, imageMimeType, grade, subject, studentAttempt } = req.body;
    const ai = getGenAI();

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType || "image/jpeg",
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        },
      });
    }

    let promptText = `Solve and explain this homework question for a Grade ${grade || "9"} student in ${subject || "General Studies"}.\n\n`;
    if (question) {
      promptText += `QUESTION TEXT: ${question}\n\n`;
    }
    if (studentAttempt) {
      promptText += `STUDENT'S CURRENT ATTEMPT / DRAFT WORK:\n${studentAttempt}\n\nTask: Analyze student's attempt, pinpoint any arithmetic or conceptual mistake gently, and explain how to fix it.\n\n`;
    }

    promptText += `Please provide a structured response with:
1. 🎯 **Core Concept & Formula Required**
2. 📝 **Complete Step-by-Step Solution** (with exact calculations and clear reasoning for WHY each step is done)
3. 💡 **Common Traps & Mistakes to Avoid**
4. 🧠 **Quick Pro-Tip / Verification Check**`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        systemInstruction: `You are an expert master teacher and step-by-step homework solver. You make everything easy to understand and explain the mathematical or scientific reason behind each step.`,
        temperature: 0.4,
      },
    });

    res.json({ solution: response.text });
  } catch (error: any) {
    console.error("Error in /api/homework/solve:", error);
    res.status(500).json({ error: error.message || "Failed to solve homework" });
  }
});

// 4. Lab Simulation & Reaction Predictor
app.post("/api/labs/simulate", async (req, res) => {
  try {
    const { labType, reactants, params, query } = req.body;
    const ai = getGenAI();

    const prompt = `Simulate this experiment for ${labType} lab:
Reactants/Inputs: ${JSON.stringify(reactants || {})}
Parameters: ${JSON.stringify(params || {})}
Query/Context: ${query || "Simulate the reaction, physical changes, state changes, balanced chemical equation, heat exchange, and visual observations."}

Provide clear structured JSON with fields:
- balancedEquation (string)
- reactionType (string, e.g. "Acid-Base Neutralization", "Redox", "Precipitation")
- observations (string description of color, bubbles, temperature, precipitate)
- molecularExplanation (step-by-step why the bonds break and form)
- safetyHazards (string with precautions)
- funFact (string related to everyday life)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior laboratory scientist and STEM educator. Respond in clean JSON or structured markdown.",
      },
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Error in /api/labs/simulate:", error);
    res.status(500).json({ error: error.message || "Failed to simulate lab experiment" });
  }
});

// 5. Exam Engine - Question Paper & Mock Test Generator
app.post("/api/exam/generate", async (req, res) => {
  try {
    const { grade, board, subject, topic, questionCount, difficulty, includeHOTS, includeCaseBased } = req.body;
    const ai = getGenAI();

    const count = questionCount || 5;
    const prompt = `Generate a realistic ${board || "CBSE"} Board-style question paper for Grade ${grade || "10"} ${subject || "Science"}, Topic: "${topic || "Core Curriculum"}" with ${count} questions.
Difficulty: ${difficulty || "Balanced (Board Level)"}.
Include HOTS: ${includeHOTS ? "Yes" : "Standard"}.
Include Case-Based Questions: ${includeCaseBased ? "Yes" : "Standard"}.

Format the output strictly as a valid JSON array of question objects, matching this exact TypeScript structure:
[
  {
    "id": "q1",
    "type": "mcq" | "assertion_reason" | "case_based" | "short_answer" | "hots",
    "question": "The question prompt...",
    "passage": "Optional case study passage if type is case_based",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."], // for mcq or assertion_reason
    "correctAnswer": "A", // or text for short answer
    "marks": 1, // 1, 2, 3, or 5
    "explanation": "Detailed step-by-step solution and marking scheme explanation",
    "difficulty": "Easy" | "Medium" | "Hard" | "HOTS"
  }
]
Return ONLY the raw JSON array, without markdown backticks if possible, or cleanly wrapped in standard JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a master CBSE / ICSE curriculum designer and board examination paper setter. Output valid JSON only.",
        responseMimeType: "application/json",
      },
    });

    try {
      const parsed = JSON.parse(response.text || "[]");
      res.json({ questions: parsed });
    } catch {
      res.json({ rawText: response.text });
    }
  } catch (error: any) {
    console.error("Error in /api/exam/generate:", error);
    res.status(500).json({ error: error.message || "Failed to generate exam questions" });
  }
});

// 6. Exam Answer Evaluator & Rubric Grader
app.post("/api/exam/evaluate", async (req, res) => {
  try {
    const { question, studentAnswer, idealAnswer, maxMarks, grade, subject } = req.body;
    const ai = getGenAI();

    const prompt = `You are a strict yet fair CBSE/ICSE board examiner evaluating a Grade ${grade || "10"} ${subject || "Subject"} student's answer.

QUESTION: ${question}
MAX MARKS: ${maxMarks || 3}
IDEAL MARKING SCHEME/SOLUTION: ${idealAnswer || "Standard board answer key"}
STUDENT'S WRITTEN ANSWER: ${studentAnswer}

Evaluate and return a structured JSON object with:
- scoreAwarded: number (between 0 and maxMarks)
- percentageScore: number
- feedback: string (overall evaluation)
- strongPoints: array of strings (what the student got right, key keywords matched)
- missingKeyTerms: array of strings (technical terms/diagrams/equations that were missed)
- modelAnswer: string (an exemplar answer that would get 100% full marks)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an official board examiner. Return your evaluation in JSON format.",
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/exam/evaluate:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate exam answer" });
  }
});

// 7. Revision Engine - One-Pagers, Mind Maps, Formula Sheets & Flashcards
app.post("/api/revision/generate", async (req, res) => {
  try {
    const { type, topic, grade, subject } = req.body;
    const ai = getGenAI();

    let prompt = "";
    if (type === "one-pager") {
      prompt = `Generate a high-yield, aesthetically structured One-Page Revision Sheet for Grade ${grade || "10"} ${subject || "Science"}, Topic: "${topic}".
Include:
1. 📌 Core Definitions (High-frequency exam definitions)
2. 📐 Essential Formulas & Units
3. 🔄 Key Processes / Laws / Reactions (Step-by-step summary)
4. ⚠️ 3 Most Common Exam Mistakes
5. ⚡ Rapid 5-Bullet Memory Recap`;
    } else if (type === "mind-map") {
      prompt = `Generate a hierarchical mind map structure for Grade ${grade} ${subject}, Topic: "${topic}".
Format as a JSON object with root node, and nested branches with title, summary, and key concepts.`;
    } else if (type === "flashcards") {
      prompt = `Generate 6 high-impact active recall flashcards for Grade ${grade} ${subject}, Topic: "${topic}".
Format as JSON array of objects: [{ "front": "Question/Term", "back": "Clear concise answer/definition", "category": "Formula | Concept | Diagram | Trick" }]`;
    } else if (type === "mnemonics") {
      prompt = `Generate 4 creative, sticky mnemonics and memory tricks to easily remember the key steps, order, or concepts of "${topic}" for Grade ${grade} ${subject}.`;
    } else {
      prompt = `Create a comprehensive quick formula & definition cheat sheet for Grade ${grade} ${subject}, Topic: "${topic}".`;
    }

    const isJson = type === "flashcards" || type === "mind-map";

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite academic revision specialist and memory coach.",
        ...(isJson ? { responseMimeType: "application/json" } : {}),
      },
    });

    if (isJson) {
      try {
        const parsed = JSON.parse(response.text || "[]");
        res.json({ data: parsed });
      } catch {
        res.json({ text: response.text });
      }
    } else {
      res.json({ text: response.text });
    }
  } catch (error: any) {
    console.error("Error in /api/revision/generate:", error);
    res.status(500).json({ error: error.message || "Failed to generate revision material" });
  }
});

// 8. Vision AI - Analyze diagrams, laboratory apparatus, charts & handwritten notes
app.post("/api/vision/analyze", async (req, res) => {
  try {
    const { imageBase64, imageMimeType, taskType, userPrompt } = req.body;
    const ai = getGenAI();

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType || "image/jpeg",
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        },
      });
    }

    let prompt = userPrompt || "Identify and explain all scientific, mathematical, or diagrammatic elements visible in this image in thorough detail.";
    if (taskType === "apparatus") {
      prompt = "Identify all laboratory apparatus, glassware, chemicals, and instruments in this image. Explain their names, functions, usage methods, and safety precautions.";
    } else if (taskType === "handwritten_notes") {
      prompt = "Transcribe these handwritten student notes into clean, well-formatted digital markdown notes. Correct any spelling or conceptual mistakes and add helpful explanatory sidebars.";
    } else if (taskType === "graph_diagram") {
      prompt = "Analyze this scientific/mathematical graph or anatomical diagram. Explain the axes, data trends, labelled parts, and key insights.";
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        systemInstruction: "You are a multimodal STEM vision expert. Explain diagrams, handwriting, apparatus, and graphs with clarity.",
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Error in /api/vision/analyze:", error);
    res.status(500).json({ error: error.message || "Failed to analyze image" });
  }
});

// 9. Teacher Mode - Worksheets, Lesson Plans, Rubrics & Question Papers
app.post("/api/teacher/generate", async (req, res) => {
  try {
    const { toolType, grade, subject, topic, duration, totalMarks } = req.body;
    const ai = getGenAI();

    let prompt = "";
    if (toolType === "lesson_plan") {
      prompt = `Generate a complete 45-minute structured Lesson Plan for Grade ${grade} ${subject}, Topic: "${topic}".
Include:
- Learning Objectives (Bloom's Taxonomy)
- Prior Knowledge Check (5 mins)
- Concept Introduction with Interactive Analogies (15 mins)
- Hands-on Activity / Virtual Lab Task (15 mins)
- Formative Assessment Exit Ticket (5 mins)
- Differentiated Homework (Standard + Advanced Challenge)`;
    } else if (toolType === "worksheet") {
      prompt = `Create a printable 2-page student worksheet for Grade ${grade} ${subject}, Topic: "${topic}".
Include Section A (Fill in blanks / 1-markers), Section B (Conceptual reasoning / 2-markers), Section C (Numerical / Long application problem / 3-markers), and an Answer Key with scoring rubric.`;
    } else if (toolType === "rubric") {
      prompt = `Create a comprehensive 4-level grading rubric (Exemplary, Proficient, Developing, Beginning) for a school project or essay on "${topic}" in Grade ${grade} ${subject}. Include criteria for Content Accuracy, Depth of Research, Presentation & Visual Clarity, and Critical Thinking.`;
    } else {
      prompt = `Generate an official School Question Paper (${totalMarks || 40} Marks, Duration: ${duration || "90 Minutes"}) with Complete Marking Scheme for Grade ${grade} ${subject}, Topic: "${topic}".`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an award-winning master educator and curriculum supervisor.",
      },
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Error in /api/teacher/generate:", error);
    res.status(500).json({ error: error.message || "Failed to generate teacher resource" });
  }
});

// 10. Voice Learning & Text-to-Speech (TTS)
app.post("/api/audio/tts", async (req, res) => {
  try {
    const { text, voiceName } = req.body;
    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: text || "Welcome to SchoolGenius AI!" }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || "Zephyr" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audioBase64: base64Audio });
    } else {
      res.json({ textFallback: true });
    }
  } catch (error: any) {
    console.warn("TTS API optional fallback:", error.message);
    res.json({ textFallback: true, error: error.message });
  }
});

// 11. Coding Lab - Code Debugger & Output Predictor
app.post("/api/coding/assist", async (req, res) => {
  try {
    const { language, code, task, question } = req.body;
    const ai = getGenAI();

    const prompt = `You are a friendly Coding Mentor for school students learning ${language || "Python"}.
STUDENT CODE:
\`\`\`${language || "python"}
${code}
\`\`\`

TASK/QUESTION: ${task || question || "Explain what this code does, debug any errors, show expected output, and explain step-by-step execution."}

Provide:
1. 💻 **Code Breakdown & Line-by-Line Flow**
2. 🐞 **Bugs Spotted & How to Fix Them**
3. 🚀 **Corrected Code with Comments**
4. 🔮 **Expected Output Simulation**
5. 💡 **Challenge / Extension Exercise for Student**`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a fun, clear computer science tutor for school students (Grades 5-12).",
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Error in /api/coding/assist:", error);
    res.status(500).json({ error: error.message || "Failed to analyze code" });
  }
});

// 12. Project Studio & Science Fair Ideator
app.post("/api/project/assist", async (req, res) => {
  try {
    const { grade, subject, interest, projectType } = req.body;
    const ai = getGenAI();

    const prompt = `Generate an award-winning School Project / Science Fair Blueprint for Grade ${grade || "9"} student interested in "${interest || "Renewable Energy / Robotics / Space / Biology"}".
Project Type: ${projectType || "Working Model & Science Fair Exhibition"}.

Include:
1. 🌟 **Project Title & Catchy Subtitle**
2. 🎯 **Scientific Aim, Hypothesis & Real-World Problem Addressed**
3. 📦 **Materials Required (Low cost, easily accessible household/school lab items)**
4. 🛠️ **Step-by-Step Construction / Experiment Procedure**
5. 📊 **Data Observation Table & Variables (Independent, Dependent, Controlled)**
6. 🎨 **Presentation Poster & 3-Slide Presentation Outline**
7. 🎤 **Sample Viva / Judge Questions & Impressive Answers**`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a master science fair mentor and innovation advisor for school students.",
      },
    });

    res.json({ blueprint: response.text });
  } catch (error: any) {
    console.error("Error in /api/project/assist:", error);
    res.status(500).json({ error: error.message || "Failed to assist project" });
  }
});

// 13. Career Explorer & Subject-to-Career Roadmap
app.post("/api/career/explore", async (req, res) => {
  try {
    const { grade, favoriteSubjects, interests, targetField } = req.body;
    const ai = getGenAI();

    const prompt = `Generate a personalized Career Roadmap for a Grade ${grade || "10"} student.
Favorite Subjects: ${favoriteSubjects || "Mathematics, Physics, Computer Science"}
Interests & Hobbies: ${interests || "Building games, space exploration, problem solving"}
Target Field (if any): ${targetField || "Open exploration"}

Include:
1. 🚀 **Top 4 Exciting Future Career Matches** (with simple explanation of what a person in this job actually does daily)
2. 🗺️ **Grade 11-12 Subject Stream Choice** (e.g. PCM with CS, PCB with Biotech, Commerce with Applied Math, Humanities)
3. 🎯 **Top College Entrance Exams & Pathways** (e.g., JEE, NEET, CUET, SAT, CLAT, NID)
4. 💡 **Skills to Start Building Today** (Free online tools, beginner projects, reading list)
5. 🏆 **Top Global & National Olympiads / Competitions to Target**`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an inspiring academic & career counselor helping school students explore their dreams.",
      },
    });

    res.json({ roadmap: response.text });
  } catch (error: any) {
    console.error("Error in /api/career/explore:", error);
    res.status(500).json({ error: error.message || "Failed to generate career roadmap" });
  }
});

// Vite middleware in development vs static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SchoolGenius AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

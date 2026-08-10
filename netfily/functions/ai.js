exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { prompt, currentCode } = JSON.parse(event.body || "{}");

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt kosong." })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "OPENAI_API_KEY belum diset di Netlify Environment Variables."
        })
      };
    }

    const systemPrompt = `
You are an AI coding assistant inside a web code sandbox.
Return ONLY valid JSON with exactly these keys:
{
  "html": "...",
  "css": "...",
  "js": "..."
}

Create or modify a self-contained HTML/CSS/JavaScript project.
Do not use markdown fences.
Do not include explanations outside the JSON.
Avoid external dependencies unless the user explicitly asks for them.
Current code:
HTML:
${currentCode?.html || ""}

CSS:
${currentCode?.css || ""}

JavaScript:
${currentCode?.js || ""}
`;

    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      return {
        statusCode: apiResponse.status,
        body: JSON.stringify({
          error: result?.error?.message || "OpenAI API error."
        })
      };
    }

    const content = result?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI tidak mengembalikan kode.");
    }

    const clean = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const code = JSON.parse(clean);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(code)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Internal server error."
      })
    };
  }
};

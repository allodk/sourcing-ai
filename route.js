export const runtime = "edge";

export async function POST(req) {
  try {
    const { messages, system } = await req.json();

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "MISTRAL_API_KEY not configured" }, { status: 500 });
    }

    // Prepend system message as first user message for Mistral
    const mistralMessages = [
      { role: "system", content: system },
      ...messages,
    ];

    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        max_tokens: 1024,
        messages: mistralMessages,
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "Erreur de réponse.";
    return Response.json({ text });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

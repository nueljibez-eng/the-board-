const MODEL = "@cf/moonshotai/kimi-k2.6";

const SYSTEM_PROMPT = `
You are Luna, the Chief of Staff for THE BOARD, an AI advisory platform.

Your job is to help the user think clearly, make practical decisions, and take useful next steps.
Be warm, direct, intelligent, and practical. Do not pretend to be a real person.
When useful, ask one or two focused questions, but give useful guidance immediately instead of only asking questions.

The user may be routed to a specialist advisor:
Business Advisor, Relationship Advisor, Spiritual Advisor, Marriage & Family Advisor,
Personal Development Advisor, or Health Advisor. Stay in that advisor's lane while
still behaving as Luna and making the advice coherent.

For business questions, consider the user's budget, location, skills, customers, costs,
pricing, risks, and a realistic first step. For Nigerian users, use naira and Nigerian
context when relevant.

For health questions, do not diagnose. Give general information, encourage appropriate
professional care for concerning symptoms, and clearly flag emergencies.

Never claim certainty when important information is missing.
`;

function json(data, status=200){
  return Response.json(data, {
    status,
    headers: {"Cache-Control":"no-store"}
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") {
        return json({error:"Method not allowed"}, 405);
      }

      try {
        const body = await request.json();
        const message = String(body.message || "").trim();
        const advisor = String(body.advisor || "Luna").trim();
        const history = Array.isArray(body.history) ? body.history : [];

        if (!message) return json({error:"Message is required"}, 400);
        if (message.length > 4000) return json({error:"Message is too long"}, 400);

        const safeHistory = history
          .filter(m => m && (m.role === "user" || m.role === "assistant"))
          .slice(-10)
          .map(m => ({
            role: m.role,
            content: String(m.content || "").slice(0, 4000)
          }));

        const messages = [
          {role:"system", content: SYSTEM_PROMPT + `\nCurrent specialist: ${advisor}.`},
          ...safeHistory,
          {role:"user", content: message}
        ];

        const result = await env.AI.run(MODEL, {
          messages,
          max_completion_tokens: 900,
          temperature: 0.7
        });

        const response =
          result?.response ||
          result?.choices?.[0]?.message?.content ||
          result?.result?.response;

        if (!response) {
          return json({error:"The AI returned an empty response"}, 502);
        }

        return json({response});
      } catch (error) {
        console.error(error);
        return json({error:"AI request failed"}, 500);
      }
    }

    // Serve the existing index.html and other static files.
    return env.ASSETS.fetch(request);
  }
};

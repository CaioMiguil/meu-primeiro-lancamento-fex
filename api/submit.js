const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.fexeducacao.com/webhook/claude-app-primeiro-lancamento-621IuJuiIoEqY2DK";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST."
    });
  }

  const payload = req.body || {};

  try {
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        evento: "primeiro_lancamento_formulario_concluido",
        origem: "Site FEX — Vercel",
        enviadoEm: new Date().toISOString(),
        respostas: payload
      })
    });

    return res.status(n8nResponse.ok ? 200 : 207).json({
      ok: n8nResponse.ok,
      status: n8nResponse.status
    });

  } catch (error) {
    console.error("Erro ao enviar para o n8n:", error);

    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}

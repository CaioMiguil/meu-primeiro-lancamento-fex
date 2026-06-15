const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL;
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

  const results = {
    googleSheets: { skipped: !GOOGLE_SHEETS_URL },
    n8n: { skipped: !N8N_WEBHOOK_URL }
  };

  try {
    if (GOOGLE_SHEETS_URL) {
      const googleResponse = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      results.googleSheets = {
        ok: googleResponse.ok,
        status: googleResponse.status,
        response: await googleResponse.text()
      };
    }

    if (N8N_WEBHOOK_URL) {
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

      results.n8n = {
        ok: n8nResponse.ok,
        status: n8nResponse.status,
        response: await n8nResponse.text()
      };
    }

    const hasError =
      (results.googleSheets && results.googleSheets.ok === false) ||
      (results.n8n && results.n8n.ok === false);

    return res.status(hasError ? 207 : 200).json({
      ok: !hasError,
      results
    });

  } catch (error) {
    console.error("Erro ao enviar integrações:", error);

    return res.status(500).json({
      ok: false,
      error: error.message,
      results
    });
  }
}

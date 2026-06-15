const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://meu-primeiro-lancamento-fex.vercel.app";

const EXPECTED_STRING_FIELDS = [
  "nomeCompleto", "email", "whatsapp", "instagram",
  "tipoProduto", "nomeProduto", "sobre", "transformacao",
  "incluido", "preco", "publicoIdeal", "dorPrincipal",
  "quantidadeConvidados", "experienciaEvento", "prazoEvento",
  "contatoPresencial", "travaLancamento", "planoGerado", "origem"
];

const MAX_FIELD_LENGTH = 2000;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
  }

  if (!N8N_WEBHOOK_URL) {
    console.error("N8N_WEBHOOK_URL não configurada.");
    return res.status(500).json({ ok: false, error: "Serviço indisponível." });
  }

  const body = req.body || {};

  for (const field of EXPECTED_STRING_FIELDS) {
    const value = body[field];
    if (value !== undefined && (typeof value !== "string" || value.length > MAX_FIELD_LENGTH)) {
      return res.status(400).json({ ok: false, error: "Payload inválido." });
    }
  }

  const payload = Object.fromEntries(
    EXPECTED_STRING_FIELDS.map(f => [f, typeof body[f] === "string" ? body[f] : ""])
  );

  try {
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evento: "primeiro_lancamento_formulario_concluido",
        origem: "Site FEX — Vercel",
        enviadoEm: new Date().toISOString(),
        respostas: payload
      })
    });

    return res.status(n8nResponse.ok ? 200 : 207).json({ ok: n8nResponse.ok });

  } catch (error) {
    console.error("Erro ao enviar para o n8n:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao processar o envio." });
  }
}

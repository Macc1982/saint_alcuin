// =============================================================================
// Edge Function: inscricao-chile
// Recebe a inscrição do chile.html, grava em inscricoes_eventos (service_role,
// contorna RLS com seguranca) e dispara e-mail de confirmacao via Resend.
// A chave do Resend fica como SECRET no Supabase, NUNCA no cliente.
// Deploy: supabase functions deploy inscricao-chile --no-verify-jwt
// Secrets: supabase secrets set RESEND_API_KEY=... 
// =============================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const REMETENTE = 'Saint Alcuin <seminario@universidadsaintalcuin.com>';
const WHATS = '5575998403658';

function esc(s: string){ return String(s||'').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c] as string)); }

function emailHTML(nome: string){
  const primeiro = esc((nome||'').split(' ')[0] || 'participante');
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(10,37,64,.12);">
        <!-- cabecalho -->
        <tr><td style="background:#0a2540;padding:34px 30px;text-align:center;">
          <img src="https://www.universidadsaintalcuin.com/logo.jpeg" width="72" height="72" alt="Saint Alcuin" style="border-radius:50%;display:block;margin:0 auto 14px;border:3px solid rgba(255,255,255,.9);"/>
          <div style="color:#9fc2e8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">Saint Alcuin of York</div>
          <div style="color:#ffffff;font-size:22px;font-weight:bold;margin-top:8px;">Inscrição recebida</div>
        </td></tr>
        <!-- faixa vermelha -->
        <tr><td style="height:4px;background:#c1121f;"></td></tr>
        <!-- corpo -->
        <tr><td style="padding:34px 32px;color:#1a2b3c;font-size:15px;line-height:1.7;">
          <p style="margin:0 0 16px;">Olá, <strong>${primeiro}</strong>,</p>
          <p style="margin:0 0 16px;">Recebemos a sua inscrição para o <strong>Seminário Internacional Saint Alcuin, Chile 2027</strong>. Obrigado pelo seu interesse.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;border-radius:12px;margin:8px 0 20px;">
            <tr><td style="padding:18px 20px;font-size:14px;color:#1a2b3c;">
              <div style="margin-bottom:8px;"><span style="color:#6b7280;">Evento:</span> <strong>Seminário Internacional, Chile 2027</strong></div>
              <div style="margin-bottom:8px;"><span style="color:#6b7280;">Local:</span> Santiago, Chile</div>
              <div style="margin-bottom:8px;"><span style="color:#6b7280;">Datas:</span> 5 e 6 de janeiro de 2027</div>
              <div><span style="color:#6b7280;">Prazo de inscrição:</span> até 5 de dezembro de 2026</div>
            </td></tr>
          </table>
          <p style="margin:0 0 16px;"><strong>Aguarde o contato da nossa equipe acadêmica</strong>, que entrará em contato com você para orientar os próximos passos, confirmar a vaga e tratar do pagamento.</p>
          <p style="margin:0 0 24px;">Se tiver qualquer dúvida, fale com a gente:</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;"><tr><td style="background:#25d366;border-radius:10px;">
            <a href="https://wa.me/${WHATS}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">Falar no WhatsApp</a>
          </td></tr></table>
        </td></tr>
        <!-- rodape -->
        <tr><td style="background:#0e3357;padding:22px 30px;text-align:center;color:#aac3dd;font-size:12px;">
          <div style="color:#ffffff;font-size:15px;font-weight:bold;margin-bottom:4px;">Saint Alcuin of York</div>
          <div>Anglican College · universidadsaintalcuin.com</div>
          <div style="margin-top:10px;color:#7f9cb8;">Você recebeu este e-mail porque se inscreveu no seminário. Para sair da lista, responda pedindo a exclusão.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  try {
    const d = await req.json();

    // validacao server-side minima
    if (!d.nome || !d.email || !d.whatsapp || d.aceite_lgpd !== true) {
      return new Response(JSON.stringify({ error: 'Dados obrigatórios ausentes.' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email);
    if (!emailOk) return new Response(JSON.stringify({ error: 'E-mail inválido.' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });

    // grava no banco com service_role (seguro, so no servidor)
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const row = {
      evento: d.evento || 'chile-2027',
      nome: d.nome, email: d.email, whatsapp: d.whatsapp,
      cidade: d.cidade || null, estado: d.estado || null,
      area: d.area || null, nivel: d.nivel || null,
      situacao: d.situacao || null, duvida: d.duvida || null,
      aceite_lgpd: true, aceite_em: new Date().toISOString(),
      origem: d.origem || 'direto',
      utm_source: d.utm_source || null, utm_medium: d.utm_medium || null,
      utm_campaign: d.utm_campaign || null, utm_content: d.utm_content || null,
      status: 'nova',
    };

    const { data: inserted, error: dbErr } = await supa.from('inscricoes_eventos').insert(row).select('id').single();
    if (dbErr) {
      return new Response(JSON.stringify({ error: 'Erro ao salvar inscrição.' }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // dispara e-mail via Resend (chave protegida em secret)
    const RESEND = Deno.env.get('RESEND_API_KEY');
    let emailEnviado = false;
    if (RESEND) {
      try {
        const er = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + RESEND, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: REMETENTE,
            to: [d.email],
            subject: 'Inscrição recebida — Seminário Internacional Saint Alcuin, Chile 2027',
            html: emailHTML(d.nome),
          }),
        });
        emailEnviado = er.ok;
        if (emailEnviado && inserted?.id) {
          await supa.from('inscricoes_eventos').update({ email_enviado: true }).eq('id', inserted.id);
        }
      } catch (_) { /* e-mail falhou, mas inscricao foi salva: nao bloqueia */ }
    }

    return new Response(JSON.stringify({ ok: true, id: inserted?.id, email_enviado: emailEnviado }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Requisição inválida.' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});

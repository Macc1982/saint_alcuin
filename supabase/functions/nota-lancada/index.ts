// =============================================================================
// Edge Function: nota-lancada
// Dispara e-mail ao aluno quando uma nota de disciplina é lançada (média fechada).
// Chamada pelo admin em lancarNota(), só quando as 3 notas estão preenchidas.
// Busca e-mail/nome do aluno no banco (service_role), envia via Resend.
// Deploy: supabase functions deploy nota-lancada --no-verify-jwt
// Reaproveita o secret RESEND_API_KEY e o domínio já verificados.
// =============================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const REMETENTE = 'Saint Alcuin <seminario@universidadsaintalcuin.com>';
const PORTAL_URL = 'https://www.universidadsaintalcuin.com/area-do-aluno.html';

function esc(s: string){ return String(s||'').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c] as string)); }

// Régua do sistema: >=7 Aprovado, 5-6,9 Recuperação, <5 Reprovado
function situacaoDe(media: number){
  if (media >= 7) return { txt:'Aprovado', cor:'#166534', bg:'#dcfce7' };
  if (media >= 5) return { txt:'Recuperação', cor:'#854d0e', bg:'#fef9c3' };
  return { txt:'Reprovado', cor:'#991b1b', bg:'#fee2e2' };
}

function emailHTML(nome: string, disciplina: string, media: number, feedback?: string){
  const primeiro = esc((nome||'').split(' ')[0] || 'estudante');
  const sit = situacaoDe(media);
  const mediaFmt = Number.isInteger(media) ? String(media) : media.toFixed(1).replace('.', ',');
  const fbClean = (feedback||'').trim();
  const fbBloco = fbClean ? `
          <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:8px;padding:16px 18px;margin:0 0 22px;">
            <div style="font-size:12px;color:#15803d;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin-bottom:7px;">Observação do professor</div>
            <div style="font-size:14.5px;color:#1a2b3c;line-height:1.65;">${esc(fbClean)}</div>
          </div>` : '';
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(10,37,64,.12);">
        <tr><td style="background:#0a2540;padding:34px 30px;text-align:center;">
          <img src="https://www.universidadsaintalcuin.com/logo.jpeg" width="72" height="72" alt="Saint Alcuin" style="border-radius:50%;display:block;margin:0 auto 14px;border:3px solid rgba(255,255,255,.9);"/>
          <div style="color:#9fc2e8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">Saint Alcuin of York</div>
          <div style="color:#ffffff;font-size:22px;font-weight:bold;margin-top:8px;">Nota lançada</div>
        </td></tr>
        <tr><td style="height:4px;background:#c1121f;"></td></tr>
        <tr><td style="padding:34px 32px;color:#1a2b3c;font-size:15px;line-height:1.7;">
          <p style="margin:0 0 16px;">Olá, <strong>${primeiro}</strong>,</p>
          <p style="margin:0 0 20px;">A sua nota da disciplina <strong>${esc(disciplina)}</strong> foi lançada no portal acadêmico.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;border-radius:12px;margin:0 0 22px;">
            <tr><td style="padding:22px 24px;text-align:center;">
              <div style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Média final</div>
              <div style="font-size:46px;font-weight:bold;color:#0a2540;line-height:1;">${mediaFmt}</div>
              <div style="display:inline-block;margin-top:14px;padding:6px 18px;border-radius:30px;font-size:14px;font-weight:bold;color:${sit.cor};background:${sit.bg};">${sit.txt}</div>
            </td></tr>
          </table>
          ${fbBloco}
          <p style="margin:0 0 24px;">Acesse o portal para ver o detalhe das notas e o seu desempenho.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;"><tr><td style="background:#c1121f;border-radius:10px;">
            <a href="${PORTAL_URL}" style="display:inline-block;padding:13px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">Acessar o portal</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="background:#0e3357;padding:22px 30px;text-align:center;color:#aac3dd;font-size:12px;">
          <div style="color:#ffffff;font-size:15px;font-weight:bold;margin-bottom:4px;">Saint Alcuin of York</div>
          <div>Anglican College · universidadsaintalcuin.com</div>
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
    const aluno_id = d.aluno_id;
    const disciplina = d.disciplina || 'Disciplina';
    const media = typeof d.media === 'number' ? d.media : parseFloat(d.media);
    const feedback = (d.feedback || '').toString().slice(0, 500);

    if (!aluno_id || isNaN(media)) {
      return new Response(JSON.stringify({ error: 'aluno_id e media são obrigatórios.' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // busca e-mail/nome do aluno
    const { data: est, error: estErr } = await supa
      .from('estudantes').select('nome,email').eq('id', aluno_id).single();
    if (estErr || !est || !est.email) {
      return new Response(JSON.stringify({ error: 'Aluno sem e-mail cadastrado.' }), { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const RESEND = Deno.env.get('RESEND_API_KEY');
    if (!RESEND) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY ausente.' }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const er = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: REMETENTE,
        to: [est.email],
        subject: 'Nota lançada — ' + disciplina + ' · Saint Alcuin',
        html: emailHTML(est.nome, disciplina, media, feedback),
      }),
    });

    const okEmail = er.ok;
    return new Response(JSON.stringify({ ok: true, email_enviado: okEmail }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Requisição inválida.' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});

// ============================================================================
// Saint Alcuin — Configuração Supabase
// Edite os valores abaixo UMA vez com seus dados reais e faça commit.
// A anon_key é pública por design — não há risco em expô-la.
// ============================================================================

export const SUPABASE_URL  = 'https://foleplydhwxjyflejfjq.supabase.co';
export const SUPABASE_ANON = 'sb_publishable_VUa914gJ5JmZH8uEWiBgTw_Z4YroDiA';

// Importação dinâmica do supabase-js via CDN ESM (sem build step)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// ----------------------------------------------------------------------------
// i18n simples (PT-BR / EN)
// ----------------------------------------------------------------------------
export const I18N = {
  pt: {
    site_name: 'Saint Alcuin of York Anglican College',
    nav_home: 'Início',
    nav_programs: 'Programas',
    nav_repository: 'Repositório',
    nav_student_area: 'Área do Aluno',
    repo_title: 'Repositório Acadêmico',
    repo_subtitle: 'Dissertações de mestrado e teses de doutorado defendidas',
    search_placeholder: 'Buscar por título, autor ou orientador…',
    filter_all: 'Todos',
    filter_dissertacao: 'Dissertações',
    filter_tese: 'Teses',
    no_results: 'Nenhum trabalho encontrado.',
    loading: 'Carregando…',
    label_author: 'Autor',
    label_advisor: 'Orientador',
    label_committee: 'Banca examinadora',
    label_year: 'Ano de conclusão',
    label_type: 'Natureza do trabalho',
    label_abstract: 'Resumo',
    type_dissertacao: 'Dissertação de Mestrado',
    type_tese: 'Tese de Doutorado',
    download: 'Baixar PDF',
    open_pdf: 'Abrir documento',
    back_to_list: 'Voltar à listagem',
    not_found: 'Trabalho não encontrado',
    not_found_msg: 'O documento solicitado não está disponível neste repositório.',
    record_id: 'Registro',
    deposited_on: 'Depositado em',
    institutional_note: 'Cópia oficial depositada para fins de avaliação acadêmica.',
    footer: 'Instituição de ensino superior estrangeira regularmente constituída em seu país de origem.',
    // Admin
    admin_title: 'Painel Administrativo',
    admin_subtitle: 'Repositório Acadêmico',
    admin_email: 'E-mail',
    admin_password: 'Senha',
    admin_login: 'Entrar',
    admin_logout: 'Sair',
    admin_invalid: 'Credenciais inválidas.',
    admin_new: 'Novo depósito',
    admin_list: 'Trabalhos depositados',
    admin_field_title: 'Título do trabalho',
    admin_field_title_en: 'Título em inglês (opcional)',
    admin_field_year: 'Ano de conclusão',
    admin_field_author: 'Nome do autor (mestre/doutor)',
    admin_field_advisor: 'Nome do orientador',
    admin_field_committee: 'Banca examinadora (um nome por linha)',
    admin_field_type: 'Natureza',
    admin_field_pdf: 'Arquivo PDF',
    admin_field_abstract: 'Resumo (opcional)',
    // Documentos institucionais (links externos)
    documents_section: 'Documentos institucionais',
    doc_diploma: 'Diploma',
    doc_historico: 'Histórico escolar',
    doc_ata: 'Ata de defesa',
    admin_field_diploma: 'Link do diploma (apostilamento federal)',
    admin_field_historico: 'Link do histórico escolar',
    admin_field_ata: 'Link da ata de defesa',
    admin_submit: 'Depositar trabalho',
    admin_submitting: 'Enviando…',
    admin_success: 'Trabalho depositado com sucesso.',
    admin_error: 'Erro ao depositar:',
    admin_confirm_delete: 'Remover este trabalho permanentemente?',
    admin_no_records: 'Nenhum trabalho depositado ainda.',
  },
  en: {
    site_name: 'Saint Alcuin of York Anglican College',
    nav_home: 'Home',
    nav_programs: 'Programmes',
    nav_repository: 'Repository',
    nav_student_area: 'Student Area',
    repo_title: 'Academic Repository',
    repo_subtitle: 'Master\u2019s dissertations and doctoral theses on deposit',
    search_placeholder: 'Search by title, author or advisor…',
    filter_all: 'All',
    filter_dissertacao: 'Dissertations',
    filter_tese: 'Theses',
    no_results: 'No works found.',
    loading: 'Loading…',
    label_author: 'Author',
    label_advisor: 'Advisor',
    label_committee: 'Examining committee',
    label_year: 'Year of completion',
    label_type: 'Nature of work',
    label_abstract: 'Abstract',
    type_dissertacao: 'Master\u2019s Dissertation',
    type_tese: 'Doctoral Thesis',
    download: 'Download PDF',
    open_pdf: 'Open document',
    back_to_list: 'Back to listing',
    not_found: 'Work not found',
    not_found_msg: 'The requested document is not available in this repository.',
    record_id: 'Record',
    deposited_on: 'Deposited on',
    institutional_note: 'Official copy deposited for academic evaluation purposes.',
    footer: 'Foreign higher-education institution regularly constituted in its country of origin.',
    // Admin
    admin_title: 'Administrative Panel',
    admin_subtitle: 'Academic Repository',
    admin_email: 'Email',
    admin_password: 'Password',
    admin_login: 'Sign in',
    admin_logout: 'Sign out',
    admin_invalid: 'Invalid credentials.',
    admin_new: 'New deposit',
    admin_list: 'Deposited works',
    admin_field_title: 'Work title',
    admin_field_title_en: 'English title (optional)',
    admin_field_year: 'Year of completion',
    admin_field_author: 'Author name (master/doctor)',
    admin_field_advisor: 'Advisor name',
    admin_field_committee: 'Examining committee (one name per line)',
    admin_field_type: 'Nature',
    admin_field_pdf: 'PDF file',
    admin_field_abstract: 'Abstract (optional)',
    // Institutional documents (external links)
    documents_section: 'Institutional documents',
    doc_diploma: 'Diploma',
    doc_historico: 'Academic transcript',
    doc_ata: 'Defence minutes',
    admin_field_diploma: 'Diploma URL (federal apostille)',
    admin_field_historico: 'Academic transcript URL',
    admin_field_ata: 'Defence minutes URL',
    admin_submit: 'Deposit work',
    admin_submitting: 'Uploading…',
    admin_success: 'Work successfully deposited.',
    admin_error: 'Error depositing:',
    admin_confirm_delete: 'Permanently remove this work?',
    admin_no_records: 'No works deposited yet.',
  },
};

export function getLang() {
  const stored = localStorage.getItem('saint-lang');
  if (stored === 'pt' || stored === 'en') return stored;
  return navigator.language?.startsWith('en') ? 'en' : 'pt';
}

export function setLang(lang) {
  localStorage.setItem('saint-lang', lang);
}

export function t(key) {
  const lang = getLang();
  return I18N[lang]?.[key] ?? I18N.pt[key] ?? key;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
export function slugify(s) {
  return (s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function formatDate(iso, lang = getLang()) {
  try {
    return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  } catch { return iso; }
}

export function recordId(uuid) {
  // Pega os 8 primeiros chars do uuid e retorna em formato SAY-XXXXXXXX
  return 'SAY-' + (uuid || '').replace(/-/g, '').slice(0, 8).toUpperCase();
}

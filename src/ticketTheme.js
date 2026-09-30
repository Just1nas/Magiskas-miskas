// Parameters supported by Bilietai.lt's public widget theme loader (2026-09-30).
// Override mode skips the saved widget config, so preserve its event and shop provider.
export const ticketWidgetRouting = { eventId: '7VTPCXHIHO', sp: 'magiskas' };
export const ticketTheme = {
  '--widget-bg': '#05091b',
  '--widget-card-bg': '#0b1429',
  '--widget-text-color': '#FFFDF8',
  '--widget-date-color': '#FFFDF8',
  '--widget-location-color': '#a6b4c8',
  '--widget-link-color': '#FFFDF8',
  '--widget-btn-bg': '#FFFDF8',
  '--widget-btn-text': '#05091b',
  '--widget-btn-hover-bg': '#a6b4c8',
  '--widget-btn-hover-text': '#05091b',
};
export const ticketBase = { cardBorderWidth: 1, cardBorderColor: '#27334b', cardBorderRadius: 4, shadowEnabled: false, btnBorderRadius: 2 };
export const ticketFont = { family: 'Manrope' };
// Same user-provided fonts, pinned in the user's repo. GitHub serves cross-origin fonts;
// the current Hostinger font responses lack the CORS header required inside the widget.
const fontRoot = 'https://raw.githubusercontent.com/Just1nas/Magiskas-miskas/5f274e1496e62308d2ba596ab8d5ad8122944650/public/fonts';
export const ticketCustomStyles = `
@font-face{font-family:Manrope;src:url('${fontRoot}/Manrope-VariableFont_wght.woff2') format('woff2');font-weight:200 800;font-style:normal;font-display:swap}
@font-face{font-family:Magical;src:url('${fontRoot}/Magical-Regular.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}
.widget-embed{color-scheme:dark;--neutral-93:#172239;--neutral-95:#172239;--neutral-98:#0b1429;--neutral-30:#a6b4c8;--system-neutral-primary:#FFFDF8;--system-neutral-secondary:#a6b4c8}
.widget-embed :is(button,input,select,textarea){font-family:Manrope,sans-serif}
.widget-embed :is(h1,h2,h3),.widget-embed :is(h1,h2,h3).font-heading{font-family:Magical,sans-serif!important;font-weight:400!important;line-height:1.15;color:#FFFDF8!important}
.widget-embed h1{font-size:clamp(2rem,4vw,3rem)!important}
.widget-embed :is(h2,h3){font-size:1.8rem!important}
.widget-embed :is(a,button,input,select,textarea):focus-visible{outline:2px solid #FFFDF8;outline-offset:3px}
`;

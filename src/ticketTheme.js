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
// The vendor rejects literal angle brackets in customStyles (HTTP 400).
// Keep provider labels, prices, fees and checkout behavior; only adjust presentation.
export const ticketCustomStyles = `
.widget-embed:has(.ticket-selection) .event .flex.justify-center,.widget-embed:has(.ticket-selection) .event .basis-auto.grow,.widget-embed:has(.ticket-selection) .event ~ *,.widget-embed:has(.ticket-selection) .widget-layout .wrapper:not(:has(.event)){display:none!important}
.widget-embed:has(.ticket-selection) .ticket-selection{max-width:none!important;width:100%!important}
.widget-embed:has(.ticket-selection) .ticket-selection .white-rounded-block{display:block!important;position:static!important}
.widget-embed:has(.ticket-selection) .event-sectors button{min-height:48px}
.widget-embed:has(.ticket-selection) .event-series,.widget-embed:has(.ticket-selection) .price-info-mobile{display:none!important}
.widget-embed:has(.ticket-selection) .ticket-selection .pt-6.z-10{position:sticky;bottom:0;background:#0b1429;padding-block:12px}
.widget-embed:has(.ticket-selection) button[data-cy="increment-button"],.widget-embed:has(.ticket-selection) button[data-cy="decrement-button"]{min-width:44px;min-height:44px}
.widget-embed .ticket-selection .pt-6.z-10 button{min-height:48px;border-radius:12px;background:#fffdf8!important;color:#05091b!important;font-weight:700}
@media(min-width:768px){
.widget-embed .ticket-selection .border-border-neutral-primary.relative:has([data-cy="ticket-price"]){display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:24px;align-items:center;padding-block:12px}
.widget-embed .ticket-selection .border-border-neutral-primary.relative:has([data-cy="ticket-price"]) .align-middle{display:contents}
.widget-embed .ticket-selection .border-border-neutral-primary.relative:has([data-cy="ticket-price"]) .space-x-4.mt-4{margin-top:0;grid-column:3;grid-row:1}
.widget-embed .self-start:has(.text-18.font-bold){position:sticky;top:16px}
}
.widget-embed .self-start:has(.text-18.font-bold){border-color:#647289!important;background:#0b1429!important;box-shadow:0 0 24px #8696b018}
.widget-embed .self-start .text-18.font-bold{font-size:20px}
@font-face{font-family:Manrope;src:url('${fontRoot}/Manrope-VariableFont_wght.woff2') format('woff2');font-weight:200 800;font-style:normal;font-display:swap}
.widget-embed{color-scheme:dark;--neutral-93:#172239;--neutral-95:#172239;--neutral-98:#0b1429;--neutral-30:#a6b4c8;--system-neutral-primary:#FFFDF8;--system-neutral-secondary:#a6b4c8}
.widget-embed :is(button,input,select,textarea){font-family:Manrope,sans-serif}
.widget-embed :is(a,button,input,select,textarea):focus-visible{outline:2px solid #FFFDF8;outline-offset:3px}
`;

// Optional local preview: transparent canvas, readable translucent content cards.
export const transparentTicketTheme = {
  ...ticketTheme,
  '--widget-bg': 'transparent',
  '--widget-card-bg': 'rgba(11,20,41,.78)',
};
export const transparentTicketStyles = `${ticketCustomStyles}
html:has(body.widget-embed),body.widget-embed{background:transparent!important;color-scheme:normal}
body.widget-embed .widget-layout{background:transparent!important}
.widget-embed .white-rounded-block{background:rgba(11,20,41,.78)!important;box-shadow:none!important}
.widget-embed :is(input,select,textarea){background-color:#172239;color:#FFFDF8}
.widget-embed .slideover-content-panel,.widget-embed [role="dialog"] .bg-base-white{background:#0b1429!important}
`;

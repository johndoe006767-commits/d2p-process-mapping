// Display names can change independently of the keys and wording in the source HTML.
const names = {
  FPAO: {label: 'FP&A Operations', prefix: /^FP&A Ops\b/},
  CAPEX: {label: 'CAPEX / Fixed Assets', prefix: /^CAPEX\b/},
  R2R: {label: 'Record to Report Operations', prefix: /^(?:Record to Report|R2R)\b/},
};

export function towerDisplayTitle(key, title) {
  const name = names[key];
  if (!name || title.startsWith(name.label)) return title;
  return title.replace(name.prefix, name.label);
}

// Card content is supplied separately from the detailed process-map registers.
const response = await fetch('./data/tower-briefs.json?v=20261102-source-sync');
if (!response.ok) throw new Error('The tower card data could not be loaded.');
const workbook = await response.json();
export const CARD_BRIEFS = workbook.towers;
export const CARD_SOURCE = workbook.source;

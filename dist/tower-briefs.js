// Card content is supplied separately from the detailed process-map registers.
const response = await fetch('./data/tower-briefs.json?v=20261030');
if (!response.ok) throw new Error('The tower card data could not be loaded.');
const workbook = await response.json();
export const CARD_BRIEFS = workbook.towers;
export const CARD_SOURCE = workbook.source;

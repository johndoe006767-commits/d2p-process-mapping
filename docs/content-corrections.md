# User content corrections — 4 November 2026

These corrections were supplied directly by the user after the November 4 source refresh and supersede the original wording on the site. Supplied HTML and workbook files remain intact.

- **Controlling, Manual Journal Request (MJV), step 4 (`CTRL-01.01`)**: replace “Sub zero reference for specific reconciliations” with “Subzero validates key and non-key tests” in the description and Systems field. Apply to As Is and AI Suggested maps and activity records. The title, owner, activity type and workflow stay the same.
- **Controlling, Pre-Submission AI Checks (`MJV-07`)**: change “enhancements from Subzero” to “enhancements for Subzero” in the 2027 project card and both map scenarios' TPI callouts. The card's `sourceText` retains the verbatim workbook text (`Tower Input!E12`, item 2); its `description` carries the correction.

`scripts/import-source.py` reapplies the map and activity corrections during import. The source audits explicitly account for these exceptions while continuing to verify the original source records and all counts. A future import of the project cards must preserve the corrected MJV-07 display description above.

import pool from "../db/connection.js";

// Plain-code matching for now. The AI will take over this job later.
const CATEGORY_KEYWORDS = {
  pain_fever: ["fever", "headache", "body ache", "pain", "temperature"],
  rehydration: ["diarrhoea", "diarrhea", "vomiting", "dehydrated"],
  heartburn: ["heartburn", "indigestion", "acid"],
  allergy: ["sneezing", "runny nose", "itchy eyes", "allergy", "hay fever"],
  sore_throat: ["sore throat"],
};

export function guessCategories(symptomsText) {
  const text = symptomsText.toLowerCase();
  return Object.keys(CATEGORY_KEYWORDS).filter((category) =>
    CATEGORY_KEYWORDS[category].some((word) => text.includes(word))
  );
}

export async function findSafeMedicines({ categories, age, pregnant, conditions }) {
  // No category or no valid age means no suggestions
  if (categories.length === 0 || age === null || Number.isNaN(age)) return [];

  // Sample rows have no reviewer yet. Only show them when demo mode is on.
  const allowUnreviewed = process.env.ALLOW_UNREVIEWED_MEDICINES === "true";

  const { rows } = await pool.query(
    `SELECT generic_name, used_for, label_dosing, notes
     FROM medicines
     WHERE category = ANY($1::text[])
       AND min_age_years <= $2::numeric
       AND ($3::boolean = false OR avoid_pregnancy = false)
       AND NOT (avoid_conditions && $4::text[])
       AND ($5::boolean OR reviewed_by IS NOT NULL)`,
    [categories, age, pregnant, conditions, allowUnreviewed]
  );
  return rows;
}
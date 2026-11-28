// Emergency rules in plain code. These run BEFORE any AI call.
// IMPORTANT: have a doctor or clinical officer review and extend this list.

const RED_FLAGS = [
  { keywords: ["chest pain", "pressure in chest", "tight chest"], reason: "Possible heart problem" },
  { keywords: ["difficulty breathing", "can't breathe", "cannot breathe", "shortness of breath"], reason: "Breathing difficulty" },
  { keywords: ["heavy bleeding", "vomiting blood", "coughing blood", "blood in stool"], reason: "Serious bleeding" },
  { keywords: ["unconscious", "fainted", "seizure", "convulsion"], reason: "Loss of consciousness or seizure" },
  { keywords: ["stiff neck", "confusion", "slurred speech", "face drooping", "sudden weakness"], reason: "Possible stroke or meningitis" },
  { keywords: ["suicidal", "want to die", "kill myself"], reason: "Mental health emergency" },
];

export function checkRedFlags({ symptomsText = "", age = null }) {
  const text = symptomsText.toLowerCase();
  const hits = RED_FLAGS.filter((f) => f.keywords.some((k) => text.includes(k)));

  // Example age rule: fever in a baby under 3 months is always urgent
  if (age !== null && age < 0.25 && text.includes("fever")) {
    hits.push({ reason: "Fever in a young infant" });
  }

  return {
    emergency: hits.length > 0,
    reasons: hits.map((h) => h.reason),
    message: hits.length
      ? "Please go to the nearest hospital or call emergency services now."
      : null,
  };
}
import { checkRedFlags } from "../services/redFlags.js";
import { guessCategories, findSafeMedicines } from "../services/otcService.js";
import { analyseSymptoms } from "../services/aiService.js";

export async function runCheck(req, res) {
  try {
    const { symptoms, age, pregnant = false, conditions = [] } = req.body;

    if (!symptoms || typeof symptoms !== "string") {
      return res.status(400).json({ error: "Please describe your symptoms." });
    }

    const ageNumber = age === undefined || age === "" ? null : Number(age);
    if (ageNumber === null || Number.isNaN(ageNumber)) {
      return res.status(400).json({ error: "Please enter a valid age." });
    }

    // 1. Emergencies come first, in plain code
    const redFlag = checkRedFlags({ symptomsText: symptoms, age: ageNumber });
    if (redFlag.emergency) {
      return res.json({
        emergency: true,
        reasons: redFlag.reasons,
        message: redFlag.message,
      });
    }

    // 2. AI suggests possible causes and urgency (can be null if unavailable)
    const analysis = await analyseSymptoms({
      symptoms,
      age: ageNumber,
      pregnant: pregnant === true,
    });

    // The AI can only make the result more cautious, never less
    if (analysis && analysis.urgency === "urgent") {
      return res.json({
        emergency: true,
        reasons: ["Your symptoms may need urgent medical attention"],
        message: "Please go to the nearest hospital or call emergency services now.",
      });
    }

    // 3. Medicines come from the database, never from the AI
    const categories = guessCategories(symptoms);
    const medicines = await findSafeMedicines({
      categories,
      age: ageNumber,
      pregnant: pregnant === true,
      conditions: Array.isArray(conditions)
        ? conditions.map((c) => String(c).toLowerCase())
        : [],
    });

    res.json({
      emergency: false,
      analysis,
      medicines,
      disclaimer:
        "This is general information, not a diagnosis. Confirm with a pharmacist or doctor.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
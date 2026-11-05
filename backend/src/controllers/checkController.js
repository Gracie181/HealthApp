import { checkRedFlags } from "../services/redFlags.js";
import { guessCategories, findSafeMedicines } from "../services/otcService.js";

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

    // Emergencies come first, before anything else
    const redFlag = checkRedFlags({ symptomsText: symptoms, age: ageNumber });
    if (redFlag.emergency) {
      return res.json({
        emergency: true,
        reasons: redFlag.reasons,
        message: redFlag.message,
      });
    }

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
      medicines,
      disclaimer:
        "This is general information, not a diagnosis. Confirm with a pharmacist or doctor.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
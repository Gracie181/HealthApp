import { checkRedFlags } from "../services/redFlags.js";

export function runCheck(req, res) {
  const { symptoms, age } = req.body;

  if (!symptoms || typeof symptoms !== "string") {
    return res.status(400).json({ error: "Please describe your symptoms." });
  }

  const ageNumber = age === undefined || age === "" ? null : Number(age);
  const redFlag = checkRedFlags({ symptomsText: symptoms, age: ageNumber });

  if (redFlag.emergency) {
    return res.json({
      emergency: true,
      reasons: redFlag.reasons,
      message: redFlag.message,
    });
  }

  res.json({
    emergency: false,
    message: "No emergency signs found. More analysis will be added here.",
  });
}
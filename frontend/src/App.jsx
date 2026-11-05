import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/check";

export default function App() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [pregnant, setPregnant] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleCondition(name) {
    setConditions((current) =>
      current.includes(name)
        ? current.filter((c) => c !== name)
        : [...current, name]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, age, pregnant, conditions }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <h1>Symptom Checker</h1>
      <p className="notice">
        This tool gives general information only. It is not a diagnosis. In an
        emergency, call 999 or 112.
      </p>

      <form onSubmit={handleSubmit} className="card">
        <label>
          What symptoms do you have?
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="For example: fever and headache for two days"
            rows={4}
            required
          />
        </label>

        <label>
          Age (years)
          <input
            type="number"
            min="0"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={pregnant}
            onChange={(e) => setPregnant(e.target.checked)}
          />
          I am pregnant
        </label>

        <fieldset>
          <legend>Do you have any of these?</legend>
          <label className="check">
            <input
              type="checkbox"
              checked={conditions.includes("liver_disease")}
              onChange={() => toggleCondition("liver_disease")}
            />
            Liver disease
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={conditions.includes("kidney_disease")}
              onChange={() => toggleCondition("kidney_disease")}
            />
            Kidney disease
          </label>
        </fieldset>

        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Check symptoms"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && result.emergency && (
        <section className="emergency">
          <h2>Seek medical help now</h2>
          <p>{result.message}</p>
          <ul>
            {result.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
      )}

      {result && !result.emergency && (
        <section className="card">
          <h2>Possible relief options</h2>
          {result.medicines.length === 0 ? (
            <p>
              No over-the-counter suggestions for these details. If symptoms
              continue, please see a pharmacist or doctor.
            </p>
          ) : (
            <ul className="medicines">
              {result.medicines.map((m) => (
                <li key={m.generic_name}>
                  <strong>{m.generic_name}</strong>
                  <span>{m.used_for}</span>
                  <span>Dose: {m.label_dosing}</span>
                  <span className="small">{m.notes}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="small">{result.disclaimer}</p>
        </section>
      )}
    </main>
  );
}
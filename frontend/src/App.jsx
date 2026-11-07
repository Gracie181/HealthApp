import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/check";
const MAPS_FALLBACK_URL =
  "https://www.google.com/maps/search/?api=1&query=hospitals+near+me";
const CONSENT_KEY = "afya-check-consent-v1";

function readConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY) === "yes";
  } catch {
    return false;
  }
}

function saveConsent(agreed) {
  try {
    if (agreed) {
      localStorage.setItem(CONSENT_KEY, "yes");
    } else {
      localStorage.removeItem(CONSENT_KEY);
    }
  } catch {
    // Storage can be blocked. The app still works without it.
  }
}

function NearbyHospitals() {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [mapsUrl, setMapsUrl] = useState("");

  function findHospitals() {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const query = encodeURIComponent(`hospitals near ${latitude},${longitude}`);
        setMapsUrl(`https://www.google.com/maps/search/?api=1&query=${query}`);
        setStatus("ready");
      },
      () => setStatus("error"),
      { timeout: 10000 }
    );
  }

  return (
    <div className="nearby">
      <button
        type="button"
        className="btn btn-quiet"
        onClick={findHospitals}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Finding your location..." : "Find hospitals near me"}
      </button>

      {status === "ready" && (
        <a className="btn btn-sun" href={mapsUrl} target="_blank" rel="noopener noreferrer">
          Open hospitals in Google Maps
        </a>
      )}

      {status === "error" && (
        <p className="small">
          We could not get your location. Allow location access in your browser, or{" "}
          <a href={MAPS_FALLBACK_URL} target="_blank" rel="noopener noreferrer">
            search Google Maps directly
          </a>
          .
        </p>
      )}

      <p className="small">
        Your location is used only to build the Google Maps link. It is not sent
        to our server.
      </p>
    </div>
  );
}

function Consent({ onAgree }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <header className="rail">
        <p className="wordmark">Afya Check</p>
        <h1>Habari. How are you feeling today?</h1>
        <p className="lead">
          Tell us your symptoms. We check for emergencies first, then suggest
          safe relief options and help you find care nearby.
        </p>
      </header>

      <section className="panel" aria-labelledby="notice-title">
        <h2 id="notice-title">Before you start</h2>

        <dl className="facts">
          <div>
            <dt>This is not a diagnosis</dt>
            <dd>
              Afya Check gives general information. It cannot replace a doctor,
              a nurse or a pharmacist.
            </dd>
          </div>
          <div className="urgent">
            <dt>In an emergency, call 999 or 112</dt>
            <dd>
              Do not wait for results if you have chest pain, trouble
              breathing, heavy bleeding or a seizure.
            </dd>
          </div>
          <div>
            <dt>Your privacy</dt>
            <dd>
              We do not ask for your name. Your answers are used only to
              produce your results. If you share your location, it is used only
              to open Google Maps and is not sent to us.
            </dd>
          </div>
        </dl>

        <label className="agree">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            I understand this is general information, and I agree to share my
            symptoms for this check.
          </span>
        </label>

        <button type="button" className="btn" disabled={!agreed} onClick={onAgree}>
          Start my check
        </button>
      </section>
    </>
  );
}

function Checker({ onReview }) {
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
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not reach the server. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <aside className="rail">
        <p className="wordmark">Afya Check</p>
        <h1>Tell us how you feel</h1>
        <p className="lead">
          Be as specific as you can, and say how long it has lasted.
        </p>
        <p className="sos">
          In an emergency, call <a href="tel:999">999</a> or{" "}
          <a href="tel:112">112</a>. Do not wait for results.
        </p>
      </aside>

      <main>
        <form className="panel" onSubmit={handleSubmit}>
          <label className="field">
            <span>What are you feeling?</span>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="For example: fever and headache since yesterday"
              required
            />
          </label>

          <label className="field">
            <span>
              Your age <span className="hint">in years</span>
            </span>
            <input
              type="number"
              inputMode="numeric"
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
            <legend>Do you have any of these conditions?</legend>
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

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Checking..." : "Check my symptoms"}
          </button>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </form>

        <div aria-live="polite">
          {result && result.emergency && (
            <section className="alert reveal" role="alert">
              <h2>Get medical help now</h2>
              <p>{result.message}</p>
              <ul>
                {result.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <div className="alert-actions">
                <a className="btn btn-danger" href="tel:999">
                  Call 999
                </a>
                <NearbyHospitals />
              </div>
            </section>
          )}

          {result && !result.emergency && (
            <section className="panel reveal">
              <h2>Over-the-counter relief</h2>
              {result.medicines.length === 0 ? (
                <p>
                  No over-the-counter options match your details. If your
                  symptoms continue, see a pharmacist or a doctor.
                </p>
              ) : (
                <ul className="remedies">
                  {result.medicines.map((m) => (
                    <li key={m.generic_name}>
                      <h3>{m.generic_name}</h3>
                      <p>{m.used_for}</p>
                      <p>Label dose: {m.label_dosing}</p>
                      <p className="small">{m.notes}</p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="small disclaimer">{result.disclaimer}</p>
            </section>
          )}
        </div>

        {!(result && result.emergency) && (
          <section className="panel">
            <h2>Need to see someone in person?</h2>
            <NearbyHospitals />
          </section>
        )}

        <footer className="foot">
          <button type="button" className="linkish" onClick={onReview}>
            Review privacy notice
          </button>
        </footer>
      </main>
    </>
  );
}

export default function App() {
  const [consented, setConsented] = useState(readConsent);

  function agree() {
    saveConsent(true);
    setConsented(true);
    window.scrollTo(0, 0);
  }

  function reviewNotice() {
    saveConsent(false);
    setConsented(false);
    window.scrollTo(0, 0);
  }

  return (
    <>
      <div className="band" aria-hidden="true" />
      <div className="shell">
        {consented ? <Checker onReview={reviewNotice} /> : <Consent onAgree={agree} />}
      </div>
    </>
  );
}
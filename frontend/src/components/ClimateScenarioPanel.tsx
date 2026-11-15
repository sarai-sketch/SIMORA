import { useEffect, useState } from "react";
import type { ScenarioEvent, ScenarioRequest, ScenarioResult } from "../types/scenario";
import "./climate-scenarios.css";

type Props = {
  apiBaseUrl: string;
  parcelName?: string;
  parcelId?: string;
  crop?: string;
  latitude?: number;
  longitude?: number;
};

const eventLabels: Record<ScenarioEvent, string> = {
  drought: "Drought",
  heavy_rain: "Heavy rainfall",
  frost: "Frost",
  heatwave: "Heatwave",
  hail: "Hailstorm",
  enso: "El Niño / La Niña",
};

export default function ClimateScenarioPanel({
  apiBaseUrl,
  parcelName,
  parcelId,
  crop,
  latitude,
  longitude,
}: Props) {
  const [event, setEvent] = useState<ScenarioEvent>("drought");
  const [stage, setStage] = useState("Vegetative");
  const [duration, setDuration] = useState(3);
  const [rain, setRain] = useState(0);
  const [et, setEt] = useState(12);
  const [minTemp, setMinTemp] = useState(-2);
  const [maxTemp, setMaxTemp] = useState(38);
  const [hail, setHail] = useState(2);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nasaContext, setNasaContext] = useState<{status: string; meanTemperature?: number; totalRainfall?: number; period?: string}>({status: "idle"});
  const [ensoPhase, setEnsoPhase] = useState("El Nino");
  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;
    const controller = new AbortController();
    setNasaContext({status: "loading"});
    const q = new URLSearchParams({latitude: String(latitude), longitude: String(longitude)});
    fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/climate/power?${q}`, {signal: controller.signal})
      .then(r => {if (!r.ok) throw new Error(`NASA HTTP ${r.status}`); return r.json();})
      .then(d => {
        const params = d.values?.parameter || d.values || {};
        const numbers = (key: string) => Object.values(params[key] || {}).map(Number).filter(x => Number.isFinite(x) && x !== -999);
        const temps = numbers("T2M"); const rain = numbers("PRECTOTCORR");
        setNasaContext({status: "live", meanTemperature: temps.length ? temps.reduce((a,b)=>a+b,0)/temps.length : undefined,
          totalRainfall: rain.length ? rain.reduce((a,b)=>a+b,0) : undefined, period: `${d.start} to ${d.end}`});
      }).catch(e => {if (e.name !== "AbortError") setNasaContext({status: "unavailable"});});
    return () => controller.abort();
  }, [apiBaseUrl, latitude, longitude]);

  async function run() {
    setLoading(true);
    setError("");
    setResult(null);

    const body: ScenarioRequest = {
      event,
      parcel_id: parcelId,
      parcel_name: parcelName,
      crop: crop || "unspecified",
      growth_stage: stage,
      duration_days: duration,
    };

    if (event === "drought" || event === "heavy_rain") {
      body.precipitation_mm = rain;
      body.crop_et_mm = et;
    }
    if (event === "frost") body.minimum_temperature_c = minTemp;
    if (event === "heatwave") body.maximum_temperature_c = maxTemp;
    if (event === "hail") body.hail_diameter_cm = hail;
    if (event === "enso") body.enso_phase = ensoPhase;

    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/simulations/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`API error ${response.status}: ${await response.text()}`);
      setResult(await response.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not run scenario.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="simora-scenarios">
      <div className="simora-scenarios__heading">
        <div>
          <span className="simora-scenarios__eyebrow">PARCEL ANALYSIS</span>
          <h2>Climate scenarios</h2>
          <p>Explore hypothetical events and review the information needed to assess their impact.</p>
        </div>
        <span className="simora-scenarios__tag">What-if simulator</span>
      </div>

      <div className="simora-scenarios__context">
        <div><strong>NASA POWER climate baseline</strong><br/><small>{nasaContext.status === "live" ? `${nasaContext.period} · Mean temperature ${nasaContext.meanTemperature?.toFixed(1) ?? "—"} °C · Rainfall total ${nasaContext.totalRainfall?.toFixed(1) ?? "—"} mm` : nasaContext.status === "loading" ? "Loading historical NASA climate data…" : "NASA historical data not available"}</small><br/><small>Historical gridded climate context; not an event forecast or soil measurement.</small></div>
      </div>
      <div className="simora-scenarios__context">
        <strong>{parcelName || "Selected parcel"}</strong>
        <span>{crop || "Crop not specified"} · {stage}</span>
      </div>

      <label className="simora-scenarios__label" htmlFor="simora-event">Select an event</label>
      <select id="simora-event" value={event} onChange={e => setEvent(e.target.value as ScenarioEvent)}>
        {Object.entries(eventLabels).map(([key, label]) => (
          <option value={key} key={key}>{label}</option>
        ))}
      </select>

      <div className="simora-scenarios__fields">
        <label>
          Crop growth stage
          <select value={stage} onChange={e => setStage(e.target.value)}>
            {["Seedling", "Vegetative", "Flowering", "Grain filling", "Maturity"].map(x =>
              <option key={x}>{x}</option>
            )}
          </select>
        </label>
        <label>
          Scenario duration (days)
          <input type="number" min="0.1" max="365" step="0.5" value={duration}
            onChange={e => setDuration(Number(e.target.value))} />
        </label>

        {(event === "drought" || event === "heavy_rain") && <>
          <label>
            Scenario precipitation (mm)
            <input type="number" min="0" value={rain} onChange={e => setRain(Number(e.target.value))} />
          </label>
          <label>
            Crop water use ETc (mm / period)
            <input type="number" min="0" value={et} onChange={e => setEt(Number(e.target.value))} />
          </label>
        </>}

        {event === "frost" && <label>
          Minimum air temperature (°C)
          <input type="number" value={minTemp} onChange={e => setMinTemp(Number(e.target.value))} />
        </label>}
        {event === "heatwave" && <label>
          Maximum air temperature (°C)
          <input type="number" value={maxTemp} onChange={e => setMaxTemp(Number(e.target.value))} />
        </label>}
        {event === "enso" && <label>
          ENSO phase (hypothetical)
          <select value={ensoPhase} onChange={e => setEnsoPhase(e.target.value)}><option value="El Nino">El Niño</option><option value="La Nina">La Niña</option><option value="Neutral">Neutral</option></select>
        </label>}
        {event === "hail" && <label>
          Hailstone diameter (cm)
          <input type="number" min="0" max="15" step="0.5" value={hail}
            onChange={e => setHail(Number(e.target.value))} />
        </label>}
      </div>

      <button className="simora-scenarios__run" onClick={run} disabled={loading}>
        {loading ? "Calculating..." : "Run scenario"}
      </button>

      {error && <div className="simora-scenarios__error">{error}</div>}

      {result && <div className="simora-scenarios__result">
        <div className="simora-scenarios__result-title">
          <strong>{eventLabels[result.event]}</strong>
          <span>HYPOTHETICAL SCENARIO</span>
        </div>
        {result.calculation && <div className="simora-scenarios__calculation">
          {Object.entries(result.calculation).map(([key, value]) => (
            <div key={key}><span>{key.replaceAll("_", " ")}</span><strong>{value}</strong></div>
          ))}
        </div>}
        <h3>Interpretation</h3>
        {result.interpretation.map((line, i) => <p key={i}>{line}</p>)}
        {result.required_for_quantitative_impact.length > 0 && <>
          <h3>Required for a quantitative impact assessment</h3>
          <ul>{result.required_for_quantitative_impact.map(x => <li key={x}>{x}</li>)}</ul>
        </>}
        {result.adaptation_options && <><h3>Adaptation options to investigate</h3><ul>{result.adaptation_options.map(x=><li key={x}>{x}</li>)}</ul></>}
        <h3>Scientific limitations</h3>
        <ul>{result.limitations.map(x => <li key={x}>{x}</li>)}</ul>
      </div>}
    </section>
  );
}

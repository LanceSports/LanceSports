// src/pages/TestWidgetPage.jsx
import React, { useState } from "react";
import FootballStandingsWidget from "../components/common/FootbalStandingsWidget";

const TestWidgetPage = () => {
  const [googleId, setGoogleId] = useState("");
  const [sport, setSport] = useState("");
  const [league, setLeague] = useState("");
  const [response, setResponse] = useState(null);

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleId, sport, league }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setResponse({ error: "Failed to register" });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Football Widget & API</h1>

      <h2>Football Standings Widget</h2>
      <FootballStandingsWidget league="39" season="2023" theme="light" />

      <hr />

      <h2>Register User Test</h2>
      <input
        placeholder="Google ID"
        value={googleId}
        onChange={(e) => setGoogleId(e.target.value)}
      />
      <input
        placeholder="Sport"
        value={sport}
        onChange={(e) => setSport(e.target.value)}
      />
      <input
        placeholder="League"
        value={league}
        onChange={(e) => setLeague(e.target.value)}
      />
      <button onClick={handleRegister}>Register User</button>

      {response && (
        <pre style={{ background: "#eee", padding: "10px", marginTop: "10px" }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default TestWidgetPage;

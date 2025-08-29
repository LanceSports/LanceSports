// src/components/FootballStandingsWidget.jsx
import { useEffect } from "react";

const FootballStandingsWidget = ({ league = "39", team = "", season = "", theme = "" }) => {
  const apiKey = process.env.REACT_APP_API_FOOTBALL_KEY;

  useEffect(() => {
    // Dynamically load the widget script
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://widgets.api-sports.io/2.0.3/widgets.js";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      id="wg-api-football-standings"
      className="wg_loader"
      data-host="v3.football.api-sports.io"
      data-key={apiKey}
      data-league={league}
      data-team={team}
      data-season={season}
      data-theme={theme}
      data-show-errors="false"
      data-show-logos="true"
    ></div>
  );
};

export default FootballStandingsWidget;

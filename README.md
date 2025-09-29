| Completed Tasks | Uncompleted Tasks |
|-----------------|-------------------|
| Authentication | Full Match Viewer (game clock, possession, key events) |
| Home Page (basic UI) | Event Feed (live timeline, animations) |
| Premier League Page (partial) | Match Setup (UI and API) |
| Navigation and Routing | Live Input (manual event input, pause/resume) |
| Database (Users) | Live Update API |
| | Feed API |
| | Match Setup API |
| | Display API |
| | Live Scoreboard (UI) |
| | Event Timeline (UI) |
| | Match Setup Screen (UI) |
| | Manual Input Panel (UI) |
| | Database (Match Info) |
| | Database (Event Log) |
| | Database (Display State) |
| | Database (Player & Team Dataa) |
# Live Sports App


## 🌍 Base URL

```http
https://lance-fixtures-api.onrender.com


When running locally:

http://localhost:3000

⚙️ Environment Variables

Create a .env file in your root directory:

SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
API_SPORTS_KEY=<your_api_football_key>


🔒 Do not commit .env to GitHub.

🚀 Installation & Running Locally
git clone <repo-url>
cd LanceSports
npm install
npm start


Server runs on http://localhost:3000

Test endpoints with Postman or your browser

📡 Endpoints
GET /fixtures

Retrieve all fixtures for a given date.

Query Parameters
Parameter	Type	Required	Description
date	string	✅ Yes	Fixture date in YYYY-MM-DD format
Example Request
GET http://localhost:3000/fixtures?date=2025-09-01

Example Response
{
  "fixtures": [
    {
      "fixture_id": 1331490,
      "match_date": "2025-09-01T00:00:00+00:00",
      "referee": "Leandro Rey Hilfer",
      "status_long": "Match Finished",
      "status_short": "FT",
      "elapsed": 90,
      "extra": 1,
      "leagues": {
        "league_id": 129,
        "name": "Primera Nacional",
        "country": "Argentina",
        "logo_url": "...",
        "flag_url": "...",
        "season": 2025,
        "round": "Regular Season - 29",
        "standings": true
      },
      "venues": {
        "venue_id": 105,
        "name": "Estadio La Ciudadela",
        "city": "San Miguel de Tucumán"
      },
      "fixture_goals": {
        "home_goals": 0,
        "away_goals": 3
      },
      "fixture_scores": {
        "halftime_home": 0,
        "halftime_away": 2,
        "fulltime_home": 0,
        "fulltime_away": 3
      },
      "fixture_teams": [
        {
          "team_id": 485,
          "side": "home",
          "winner": false,
          "name": "San Martin Tucuman",
          "logo_url": "..."
        },
        {
          "team_id": 459,
          "side": "away",
          "winner": true,
          "name": "Arsenal Sarandi",
          "logo_url": "..."
        }
      ]
    }
  ]
}

Error Responses
Status	Example Message	Cause
400	"Invalid date format"	Date must be YYYY-MM-DD
403	"Request failed with status code 403"	Invalid API key / Supabase policy
500	"Internal server error"	Backend or database issues
🗄 Database Schema (Simplified)

The API writes and fetches data from Supabase with the following main tables:

fixtures → Links to leagues, venues, and teams

leagues → Competition info

venues → Stadium data

teams → Club info

Foreign key constraints ensure consistency (e.g., fixtures.league_id → leagues.league_id).

📝 Notes

All match_date values are in UTC.

Fixtures are stored automatically in Supabase when first requested.

Future roadmap: authentication, scheduled updates, more endpoints.

🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss your ideas.

📜 License

MIT License. See LICENSE for details.


---

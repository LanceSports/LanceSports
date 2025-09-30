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
[
  {
    "fixture": {
      "id": 123456,
      "match_date": "2025-09-30T15:00:00Z",
      "status": "FT",
      "elapsed": 90,
      "referee": "John Doe",
      "timezone": "UTC"
    },
    "league": {
      "id": 1,
      "name": "Premier League",
      "country": "England",
      "season": 2025,
      "round": "Week 7"
    },
    "teams": [
      {
        "id": 101,
        "name": "Team A",
        "logo_url": "...",
        "side": "home",
        "winner": true
      },
      {
        "id": 102,
        "name": "Team B",
        "logo_url": "...",
        "side": "away",
        "winner": false
      }
    ],
    "scores": {
      "halftime": { "home": 1, "away": 0 },
      "fulltime": { "home": 2, "away": 1 },
      "extratime": { "home": null, "away": null },
      "penalty": { "home": null, "away": null }
    },
    "events": [
      {
        "event_id": 1,
        "team_id": 101,
        "player_id": 201,
        "type": "Goal",
        "detail": "Normal Goal",
        "elapsed": 23
      }
    ],
    "stats": [
      {
        "team_id": 101,
        "type": "Possession",
        "value": "55%"
      }
    ],
    "players": [
      {
        "player_id": 201,
        "team_id": 101,
        "name": "Player One",
        "number": 10,
        "position": "Forward",
        "grid": "4-3-3"
      }
    ],
    "player_stats": [
      {
        "player_id": 201,
        "team_id": 101,
        "type": "Goals",
        "value": 1
      }
    ]
  }
]
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

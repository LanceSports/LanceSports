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
| | Database (Player & Team Data) |
# Live Sports App

npm install @supabase/supabase-js


This is the directory structure for LanceSports.

- ├── src/
- │   ├── components/
- │   │   ├── common/
- │   │   ├── live-games/
- │   │   ├── game-card/
- │   │   ├── scoreboard/
- │   │   └── countdown/
- │   ├── screens/
- │   │   ├── home/
- │   │   ├── live/
- │   │   ├── standings/
- │   │   ├── news/
- │   │   └── settings/
- │   ├── services/
- │   │   ├── api/
- │   │   ├── websocket/
- │   │   └── storage/
- │   ├── utils/
- │   │   ├── helpers/
- │   │   └── constants/
- │   ├── assets/
- │   │   ├── images/
- │   │   ├── icons/
- │   │   └── fonts/
- │   └── styles/
- │       ├── themes/
- │       └── components/
- ├── tests/
- │   ├── unit/
- │   └── integration/
- ├── docs/
- │   ├── api/
- │   └── deployment/
- ├── scripts/
- ├── config/
- ├── public/
- └── dist/

Root Level
/src/ (Src): The heart of the application. Contains all the human-written source code for the app.

/tests/: Contains all the automated tests to ensure the app works correctly. Separated into unit (tests for small, isolated functions) and integration (tests for how larger parts work together).

/docs/: Holds project documentation, like api specifications (how to interact with the backend) and deployment instructions (how to publish the app).

/scripts/: Contains utility scripts for developers (e.g., build automation, database setup, deployment tasks).

/config/: Stores configuration files for different environments (development, testing, production).

/public/: Holds static assets that are served directly to the browser without processing, like the main HTML file, favicon, or robots.txt.

/dist/ (Distributable): The output of the build process. Contains the minified, optimized, and bundled code ready to be deployed to a web server. (This is typically auto-generated and not edited directly).

Inside /src/
/src/components/: Contains reusable UI components (like Lego blocks).

common/: Very generic components used everywhere (Buttons, Headers, Loaders).

live-games/: Components for listing and selecting ongoing games.

game-card/: A component that displays a snapshot of a single game's status.

scoreboard/: A component that shows the detailed current score and game clock.

countdown/: A component for displaying time until a game starts.

/src/screens/ (or /src/pages/): Contains top-level components that represent entire pages/screens of the app.

home/: The main landing page of the app.

live/: The screen where a user watches a live game.

standings/: The screen showing league tables and rankings.

news/: The screen for displaying sports news articles.

settings/: The screen where a user configures app preferences.

/src/services/: Contains code for interacting with external systems and APIs.

api/: Handles all HTTP requests to the backend server (fetching scores, news, etc.).

websocket/: Manages the persistent connection for receiving real-time live updates (goals, scores, clock).

storage/: Handles saving and loading data from the device's local storage.

/src/utils/ (Utilities): Contains helper functions and constants.

helpers/: Reusable utility functions (e.g., formatting dates, calculating time differences).

constants/: Application-wide constant values (e.g., team names, API base URLs, game status types).

/src/assets/: Contains static media files used by the application.

images/: Pictures (logos, player photos, backgrounds).

icons/: Small icon files.

fonts/: Custom font files.

/src/styles/: Contains global styling and theming files.

themes/: Definitions of color palettes and styles for light/dark mode.

components/: Centralized styling that applies to specific components.

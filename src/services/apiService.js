// src/services/apiService.js
// src/services/apiService.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_SPORTS_KEY; 


export async function fetchFixturesByDate(date) {
  try {
    console.log("API Key being used:", API_KEY ? API_KEY.slice(0, 6) + "..." : "undefined");
    console.log("fetchFixturesByDate CALLED with date:", date);

    const res = await axios.get(`${API_BASE}/fixtures`, {
      params: { date },
      headers: {
        "x-apisports-key": API_KEY,  
      },
    });

    //console.log("Raw API response:", JSON.stringify(res.data, null, 2));
    return res.data.response;
  } catch (err) {
    console.error("Error fetching fixtures:", err.message);
    throw err;
  }
}







/*import axios from "axios";

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_SPORTS_KEY;

export async function fetchFixturesByDate(date) {
   //console.log("fetchFixturesByDate CALLED with date:", date);
  try {
      //console.log("Hello World!");
      const res = await axios.get(`${API_BASE}/fixtures`, {
      params: { date },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
      
    });
    //console.log("Hello World!");
    //console.log("Raw API response:", res.error);
    //console.log("Raw API response:", JSON.stringify(res.data, null, 2));
    return res.data.response; // only fixtures array
  } catch (err) {
    console.error("Error fetching fixtures:", err.message);
    throw err;
  }
}
*/




/*
import axios from "axios";

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_SPORTS_KEY;

export async function fetchFixturesByDate(date) {
  try {
      console.log("Hello World!");
      const res = await axios.get(`${API_BASE}/fixtures`, {
      params: { date },
      headers: { "x-apisports-key": API_KEY }
    });
    return res.data.response; // only fixtures array
  } catch (err) {
    console.error("Error fetching fixtures:", err.message);
    throw err;
  }
}
*/
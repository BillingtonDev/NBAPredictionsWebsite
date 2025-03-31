const axios = require('axios');
require('dotenv').config();
const teamLogos = require('./teamLogos');

// API constants
const API_KEY = process.env.SPORTRADAR_API_KEY;
const BASE_URL = 'https://api.sportradar.us/nba/trial/v8/en';
const API_FORMAT = 'json';

// API endpoints
const endpoints = {
  allTeams: `${BASE_URL}/league/hierarchy.${API_FORMAT}`,
  teams: `${BASE_URL}/league/teams.${API_FORMAT}`, // Simpler endpoint as backup
  teamProfile: (teamId) => `${BASE_URL}/teams/${teamId}/profile.${API_FORMAT}`,
  teamRoster: (teamId) => `${BASE_URL}/teams/${teamId}/profile.${API_FORMAT}`, // Using profile endpoint as it includes roster
  standings: `${BASE_URL}/seasons/2024/REG/standings.${API_FORMAT}` // Standing endpoint for regular season 2024
};

// Helper function for API requests with proper error handling
async function makeApiRequest(url) {
  try {
    // Add a timeout to prevent hanging requests
    const response = await axios.get(`${url}?api_key=${API_KEY}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      console.error(`Response data:`, error.response.data);
      
      if (error.response.status === 403) {
        console.error('Authentication error: Please check your API key or API access rights');
      } else if (error.response.status === 429) {
        console.error('Rate limit exceeded: The API request quota has been reached');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from API:', error.message);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
    }
    throw error;
  }
}

/**
 * Get all NBA teams using the teams endpoint
 * @returns {Promise} Promise object representing the API response
 */
async function getAllTeams() {
  try {
    let data;
    
    try {
      // Try the hierarchy endpoint first (gives more detailed info)
      data = await makeApiRequest(endpoints.allTeams);
      
      // Process the hierarchy (conferences -> divisions -> teams)
      const conferences = data.conferences;
      let teams = [];
      
      conferences.forEach(conference => {
        conference.divisions.forEach(division => {
          division.teams.forEach(team => {
            teams.push({
              id: team.id,
              name: team.name,
              market: team.market,
              fullName: `${team.market} ${team.name}`,
              conference: conference.name,
              division: division.name,
              logoUrl: teamLogos.getBestLogoUrl(team.id, `${team.market} ${team.name}`)
            });
          });
        });
      });
      
      return teams;
      
    } catch (hierarchyError) {
      console.log('Hierarchy endpoint failed, trying teams endpoint');
      
      // Fallback to the simpler teams endpoint if hierarchy fails
      data = await makeApiRequest(endpoints.teams);
      
      // Process the teams list directly
      return data.teams.map(team => ({
        id: team.id,
        name: team.name,
        market: team.market,
        fullName: `${team.market} ${team.name}`,
        // These fields won't be available from the teams endpoint
        conference: 'N/A',
        division: 'N/A',
        logoUrl: teamLogos.getBestLogoUrl(team.id, `${team.market} ${team.name}`)
      }));
    }
  } catch (error) {
    console.error('Error fetching teams:', error.message);
    
    // If all API calls fail, return mock data using our team logos utility
    console.log('API calls failed, returning mock data');
    return getMockTeams();
  }
}

/**
 * Get standings data for all teams
 * @returns {Promise} Promise object representing the standings data
 */
async function getStandings() {
  try {
    const data = await makeApiRequest(endpoints.standings);
    return data;
  } catch (error) {
    console.error('Error fetching standings:', error.message);
    return getMockStandings();
  }
}

/**
 * Get detailed profile for a specific team, enhanced with standings data
 * @param {string} teamId The team ID
 * @returns {Promise} Promise object representing the API response with standings
 */
async function getTeamProfile(teamId) {
  try {
    const [profileData, standingsData] = await Promise.all([
      makeApiRequest(endpoints.teamProfile(teamId)),
      getStandings()
    ]);

    // Find the team's standings in the data
    let teamStanding = null;
    if (standingsData && standingsData.conferences) {
      // Look through each conference
      for (const conference of standingsData.conferences) {
        // Look through each division
        for (const division of conference.divisions) {
          // Look through each team in the division
          for (const team of division.teams) {
            if (team.id === teamId) {
              teamStanding = {
                rank: team.calc_rank?.conf_rank || team.rank || null,
                won: team.wins || 0,
                lost: team.losses || 0,
                win_pct: team.win_pct || 0
              };
              break;
            }
          }
          if (teamStanding) break;
        }
        if (teamStanding) break;
      }
    }

    // Add standings to the profile data
    if (teamStanding) {
      profileData.standing = teamStanding;
    }

    return profileData;
  } catch (error) {
    console.error(`Error fetching team profile for ${teamId}:`, error.message);
    
    // Return mock team profile if API fails
    return getMockTeamProfile(teamId);
  }
}

/**
 * Get team data including roster
 * @param {string} teamId The team ID
 * @returns {Promise} Promise object representing the API response with roster data
 */
async function getTeamRoster(teamId) {
  try {
    // Use the profile endpoint as it includes roster data
    const profileData = await makeApiRequest(endpoints.teamProfile(teamId));
    return {
      players: profileData.players || []
    };
  } catch (error) {
    console.error(`Error fetching team roster for ${teamId}:`, error.message);
    
    // Return mock roster if API fails
    return {
      players: getMockTeamProfile(teamId).players || []
    };
  }
}

/**
 * Get a specific team by ID - for testing API connectivity
 * @param {string} teamId - The team ID to retrieve
 * @returns {Promise} Promise object representing the API response
 */
async function getTeamById(teamId) {
  try {
    return await makeApiRequest(endpoints.teamProfile(teamId));
  } catch (error) {
    console.error(`Error fetching team with ID ${teamId}:`, error.message);
    return getMockTeamProfile(teamId);
  }
}

/**
 * Generate a list of mock teams as a fallback when the API is unavailable
 * @returns {Array} Array of team objects
 */
function getMockTeams() {
  const conferences = [
    { name: 'Eastern Conference', divisions: ['Atlantic', 'Central', 'Southeast'] },
    { name: 'Western Conference', divisions: ['Northwest', 'Pacific', 'Southwest'] }
  ];
  
  // Map of team names to divisions and conferences
  const teamDivisions = {
    "Atlanta Hawks": { conference: "Eastern Conference", division: "Southeast" },
    "Boston Celtics": { conference: "Eastern Conference", division: "Atlantic" },
    "Brooklyn Nets": { conference: "Eastern Conference", division: "Atlantic" },
    "Charlotte Hornets": { conference: "Eastern Conference", division: "Southeast" },
    "Chicago Bulls": { conference: "Eastern Conference", division: "Central" },
    "Cleveland Cavaliers": { conference: "Eastern Conference", division: "Central" },
    "Dallas Mavericks": { conference: "Western Conference", division: "Southwest" },
    "Denver Nuggets": { conference: "Western Conference", division: "Northwest" },
    "Detroit Pistons": { conference: "Eastern Conference", division: "Central" },
    "Golden State Warriors": { conference: "Western Conference", division: "Pacific" },
    "Houston Rockets": { conference: "Western Conference", division: "Southwest" },
    "Indiana Pacers": { conference: "Eastern Conference", division: "Central" },
    "LA Clippers": { conference: "Western Conference", division: "Pacific" },
    "Los Angeles Lakers": { conference: "Western Conference", division: "Pacific" },
    "Memphis Grizzlies": { conference: "Western Conference", division: "Southwest" },
    "Miami Heat": { conference: "Eastern Conference", division: "Southeast" },
    "Milwaukee Bucks": { conference: "Eastern Conference", division: "Central" },
    "Minnesota Timberwolves": { conference: "Western Conference", division: "Northwest" },
    "New Orleans Pelicans": { conference: "Western Conference", division: "Southwest" },
    "New York Knicks": { conference: "Eastern Conference", division: "Atlantic" },
    "Oklahoma City Thunder": { conference: "Western Conference", division: "Northwest" },
    "Orlando Magic": { conference: "Eastern Conference", division: "Southeast" },
    "Philadelphia 76ers": { conference: "Eastern Conference", division: "Atlantic" },
    "Phoenix Suns": { conference: "Western Conference", division: "Pacific" },
    "Portland Trail Blazers": { conference: "Western Conference", division: "Northwest" },
    "Sacramento Kings": { conference: "Western Conference", division: "Pacific" },
    "San Antonio Spurs": { conference: "Western Conference", division: "Southwest" },
    "Toronto Raptors": { conference: "Eastern Conference", division: "Atlantic" },
    "Utah Jazz": { conference: "Western Conference", division: "Northwest" },
    "Washington Wizards": { conference: "Eastern Conference", division: "Southeast" }
  };
  
  return Object.keys(teamDivisions).map(teamName => {
    const parts = teamName.split(' ');
    const name = parts.pop();
    const market = parts.join(' ');
    
    // Generate a mock ID for fallback (using the team name)
    const mockId = teamName.toLowerCase().replace(/\s+/g, '-');
    
    return {
      id: mockId,
      name: name,
      market: market,
      fullName: teamName,
      conference: teamDivisions[teamName].conference,
      division: teamDivisions[teamName].division,
      logoUrl: teamLogos.getLogoByTeamName(teamName)
    };
  });
}

// Team venue mapping with real data
const teamVenues = {
  "Atlanta Hawks": { name: "State Farm Arena", address: "1 State Farm Dr", city: "Atlanta", state: "GA", capacity: 18118 },
  "Boston Celtics": { name: "TD Garden", address: "100 Legends Way", city: "Boston", state: "MA", capacity: 19156 },
  "Brooklyn Nets": { name: "Barclays Center", address: "620 Atlantic Ave", city: "Brooklyn", state: "NY", capacity: 17732 },
  "Charlotte Hornets": { name: "Spectrum Center", address: "333 East Trade St", city: "Charlotte", state: "NC", capacity: 19077 },
  "Chicago Bulls": { name: "United Center", address: "1901 W Madison St", city: "Chicago", state: "IL", capacity: 20917 },
  "Cleveland Cavaliers": { name: "Rocket Mortgage FieldHouse", address: "1 Center Court", city: "Cleveland", state: "OH", capacity: 19432 },
  "Dallas Mavericks": { name: "American Airlines Center", address: "2500 Victory Avenue", city: "Dallas", state: "TX", capacity: 19200 },
  "Denver Nuggets": { name: "Ball Arena", address: "1000 Chopper Cir", city: "Denver", state: "CO", capacity: 19520 },
  "Detroit Pistons": { name: "Little Caesars Arena", address: "2645 Woodward Ave", city: "Detroit", state: "MI", capacity: 20332 },
  "Golden State Warriors": { name: "Chase Center", address: "1 Warriors Way", city: "San Francisco", state: "CA", capacity: 18064 },
  "Houston Rockets": { name: "Toyota Center", address: "1510 Polk St", city: "Houston", state: "TX", capacity: 18055 },
  "Indiana Pacers": { name: "Gainbridge Fieldhouse", address: "125 S Pennsylvania St", city: "Indianapolis", state: "IN", capacity: 17923 },
  "LA Clippers": { name: "Intuit Dome", address: "3900 W Manchester Blvd", city: "Inglewood", state: "CA", capacity: 18000 },
  "Los Angeles Lakers": { name: "Crypto.com Arena", address: "1111 S Figueroa St", city: "Los Angeles", state: "CA", capacity: 19060 },
  "Memphis Grizzlies": { name: "FedExForum", address: "191 Beale St", city: "Memphis", state: "TN", capacity: 17794 },
  "Miami Heat": { name: "Kaseya Center", address: "601 Biscayne Blvd", city: "Miami", state: "FL", capacity: 19600 },
  "Milwaukee Bucks": { name: "Fiserv Forum", address: "1111 Vel R. Phillips Ave", city: "Milwaukee", state: "WI", capacity: 17341 },
  "Minnesota Timberwolves": { name: "Target Center", address: "600 First Ave N", city: "Minneapolis", state: "MN", capacity: 18978 },
  "New Orleans Pelicans": { name: "Smoothie King Center", address: "1501 Dave Dixon Dr", city: "New Orleans", state: "LA", capacity: 16867 },
  "New York Knicks": { name: "Madison Square Garden", address: "4 Pennsylvania Plaza", city: "New York", state: "NY", capacity: 19812 },
  "Oklahoma City Thunder": { name: "Paycom Center", address: "100 W Reno Ave", city: "Oklahoma City", state: "OK", capacity: 18203 },
  "Orlando Magic": { name: "Kia Center", address: "400 W Church St", city: "Orlando", state: "FL", capacity: 18846 },
  "Philadelphia 76ers": { name: "Wells Fargo Center", address: "3601 S Broad St", city: "Philadelphia", state: "PA", capacity: 20478 },
  "Phoenix Suns": { name: "Footprint Center", address: "201 E Jefferson St", city: "Phoenix", state: "AZ", capacity: 17071 },
  "Portland Trail Blazers": { name: "Moda Center", address: "1 N Center Court St", city: "Portland", state: "OR", capacity: 19441 },
  "Sacramento Kings": { name: "Golden 1 Center", address: "500 David J Stern Walk", city: "Sacramento", state: "CA", capacity: 17608 },
  "San Antonio Spurs": { name: "Frost Bank Center", address: "1 AT&T Center Pkwy", city: "San Antonio", state: "TX", capacity: 18418 },
  "Toronto Raptors": { name: "Scotiabank Arena", address: "40 Bay St", city: "Toronto", state: "ON", capacity: 19800 },
  "Utah Jazz": { name: "Delta Center", address: "301 W South Temple", city: "Salt Lake City", state: "UT", capacity: 18306 },
  "Washington Wizards": { name: "Capital One Arena", address: "601 F St NW", city: "Washington", state: "DC", capacity: 20356 }
};

/**
 * Generate mock standings data
 * @returns {Object} Mock standings object
 */
function getMockStandings() {
  // Create a structure similar to what the API would return
  const conferences = [
    { name: "Eastern Conference", divisions: [] },
    { name: "Western Conference", divisions: [] }
  ];
  
  // Division names
  const eastDivisions = ["Atlantic", "Central", "Southeast"];
  const westDivisions = ["Northwest", "Pacific", "Southwest"];
  
  // Add east divisions
  for (const divName of eastDivisions) {
    const teams = [];
    // Generate teams for this division
    for (let i = 0; i < 5; i++) {
      const wins = Math.floor(Math.random() * 60) + 10;
      const losses = 82 - wins;
      teams.push({
        id: `mock-${divName}-${i}`,
        wins: wins,
        losses: losses,
        win_pct: wins / (wins + losses),
        calc_rank: {
          conf_rank: Math.floor(Math.random() * 15) + 1
        }
      });
    }
    conferences[0].divisions.push({
      name: divName,
      teams: teams
    });
  }
  
  // Add west divisions
  for (const divName of westDivisions) {
    const teams = [];
    // Generate teams for this division
    for (let i = 0; i < 5; i++) {
      const wins = Math.floor(Math.random() * 60) + 10;
      const losses = 82 - wins;
      teams.push({
        id: `mock-${divName}-${i}`,
        wins: wins,
        losses: losses,
        win_pct: wins / (wins + losses),
        calc_rank: {
          conf_rank: Math.floor(Math.random() * 15) + 1
        }
      });
    }
    conferences[1].divisions.push({
      name: divName,
      teams: teams
    });
  }
  
  return { conferences: conferences };
}

/**
 * Generate a mock team profile as a fallback when the API is unavailable
 * @param {string} teamId - The team ID or name
 * @returns {Object} Mock team profile object
 */
function getMockTeamProfile(teamId) {
  // Try to find the team in our mock data
  const teams = getMockTeams();
  const team = teams.find(t => t.id === teamId) || teams[0];
  
  // Get venue data from our mapping or create a default one
  let venueData = null;
  if (teamVenues[team.fullName]) {
    venueData = teamVenues[team.fullName];
  } else {
    venueData = {
      name: `${team.market} Arena`,
      address: "123 Basketball St",
      city: team.market,
      state: "State",
      capacity: 20000
    };
  }
  
  // Generate more realistic mock standings data
  const wins = Math.floor(Math.random() * 55) + 15; // 15-70 wins
  const losses = 82 - wins; // NBA regular season has 82 games
  const winPct = wins / 82;
  const rank = Math.floor(Math.random() * 15) + 1; // 1-15 rank in conference
  
  return {
    id: team.id,
    name: team.name,
    market: team.market,
    conference: {
      id: "conference-id",
      name: team.conference
    },
    division: {
      id: "division-id",
      name: team.division
    },
    venues: [
      venueData
    ],
    players: generateMockPlayers(15, team.fullName),
    standing: {
      won: wins,
      lost: losses,
      win_pct: winPct,
      rank: rank
    }
  };
}

/**
 * Generate mock players for a team
 * @param {number} count - Number of players to generate
 * @param {string} teamName - Team name for context
 * @returns {Array} Array of player objects
 */
function generateMockPlayers(count, teamName) {
  const positions = ['G', 'F', 'C', 'F-C', 'G-F'];
  const firstNames = ['James', 'Michael', 'Kevin', 'John', 'David', 'Chris', 'Anthony', 'Stephen', 'Luka', 'Nikola'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
  
  const players = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    players.push({
      id: `player-${i}-${teamName.replace(/\s+/g, '-').toLowerCase()}`,
      full_name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      position: positions[Math.floor(Math.random() * positions.length)],
      jersey_number: Math.floor(Math.random() * 50) + 1,
      height: `${Math.floor(Math.random() * 16) + 72} in`,
      weight: Math.floor(Math.random() * 80) + 180,
      experience: Math.floor(Math.random() * 15)
    });
  }
  
  return players;
}

/**
 * Fetches NBA league leaders data
 * @returns {Promise<Object>} League leaders data
 */
async function getLeagueLeaders() {
    try {
        const apiKey = process.env.SPORTRADAR_API_KEY;
        if (!apiKey) {
            throw new Error('SPORTRADAR_API_KEY is not defined in environment variables');
        }
        
        const url = `https://api.sportradar.com/nba/trial/v8/en/seasons/2024/REG/leaders.json?api_key=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching league leaders:', error);
        throw error;
    }
}

module.exports = {
  getAllTeams,
  getTeamProfile,
  getTeamRoster,
  getTeamById,
  getStandings,
  getLeagueLeaders
}; 
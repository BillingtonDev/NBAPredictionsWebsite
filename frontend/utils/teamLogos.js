/**
 * This file contains NBA team data mappings for logo URLs and team identifiers.
 * These are used as fallbacks when the SportRadar API is unavailable.
 */

// Maps team name to logo URL
const teamLogoMap = {
  // These are placeholders - in a production app, you'd have proper URLs for each team
  "Atlanta Hawks": "https://cdn.nba.com/logos/nba/1610612737/global/L/logo.svg",
  "Boston Celtics": "https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg",
  "Brooklyn Nets": "https://cdn.nba.com/logos/nba/1610612751/global/L/logo.svg",
  "Charlotte Hornets": "https://cdn.nba.com/logos/nba/1610612766/global/L/logo.svg",
  "Chicago Bulls": "https://cdn.nba.com/logos/nba/1610612741/global/L/logo.svg",
  "Cleveland Cavaliers": "https://cdn.nba.com/logos/nba/1610612739/global/L/logo.svg",
  "Dallas Mavericks": "https://cdn.nba.com/logos/nba/1610612742/global/L/logo.svg",
  "Denver Nuggets": "https://cdn.nba.com/logos/nba/1610612743/global/L/logo.svg",
  "Detroit Pistons": "https://cdn.nba.com/logos/nba/1610612765/global/L/logo.svg",
  "Golden State Warriors": "https://cdn.nba.com/logos/nba/1610612744/global/L/logo.svg",
  "Houston Rockets": "https://cdn.nba.com/logos/nba/1610612745/global/L/logo.svg",
  "Indiana Pacers": "https://cdn.nba.com/logos/nba/1610612754/global/L/logo.svg",
  "LA Clippers": "https://cdn.nba.com/logos/nba/1610612746/global/L/logo.svg",
  "Los Angeles Lakers": "https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg",
  "Memphis Grizzlies": "https://cdn.nba.com/logos/nba/1610612763/global/L/logo.svg",
  "Miami Heat": "https://cdn.nba.com/logos/nba/1610612748/global/L/logo.svg",
  "Milwaukee Bucks": "https://cdn.nba.com/logos/nba/1610612749/global/L/logo.svg",
  "Minnesota Timberwolves": "https://cdn.nba.com/logos/nba/1610612750/global/L/logo.svg",
  "New Orleans Pelicans": "https://cdn.nba.com/logos/nba/1610612740/global/L/logo.svg",
  "New York Knicks": "https://cdn.nba.com/logos/nba/1610612752/global/L/logo.svg",
  "Oklahoma City Thunder": "https://cdn.nba.com/logos/nba/1610612760/global/L/logo.svg",
  "Orlando Magic": "https://cdn.nba.com/logos/nba/1610612753/global/L/logo.svg",
  "Philadelphia 76ers": "https://cdn.nba.com/logos/nba/1610612755/global/L/logo.svg",
  "Phoenix Suns": "https://cdn.nba.com/logos/nba/1610612756/global/L/logo.svg",
  "Portland Trail Blazers": "https://cdn.nba.com/logos/nba/1610612757/global/L/logo.svg",
  "Sacramento Kings": "https://cdn.nba.com/logos/nba/1610612758/global/L/logo.svg",
  "San Antonio Spurs": "https://cdn.nba.com/logos/nba/1610612759/global/L/logo.svg",
  "Toronto Raptors": "https://cdn.nba.com/logos/nba/1610612761/global/L/logo.svg",
  "Utah Jazz": "https://cdn.nba.com/logos/nba/1610612762/global/L/logo.svg",
  "Washington Wizards": "https://cdn.nba.com/logos/nba/1610612764/global/L/logo.svg"
};

// Complete mapping of SportRadar team IDs to NBA.com team IDs
const teamIdMapping = {
  // Atlantic Division
  "583eca2f-fb46-11e1-82cb-f4ce4684ea4c": "1610612738", // Boston Celtics
  "583ecda6-fb46-11e1-82cb-f4ce4684ea4c": "1610612751", // Brooklyn Nets
  "583ec70e-fb46-11e1-82cb-f4ce4684ea4c": "1610612752", // New York Knicks
  "583ec87d-fb46-11e1-82cb-f4ce4684ea4c": "1610612755", // Philadelphia 76ers
  "583ecf50-fb46-11e1-82cb-f4ce4684ea4c": "1610612761", // Toronto Raptors
  
  // Central Division
  "583ec773-fb46-11e1-82cb-f4ce4684ea4c": "1610612741", // Chicago Bulls
  "583ec7cd-fb46-11e1-82cb-f4ce4684ea4c": "1610612739", // Cleveland Cavaliers
  "583ec928-fb46-11e1-82cb-f4ce4684ea4c": "1610612765", // Detroit Pistons
  "583ecd4f-fb46-11e1-82cb-f4ce4684ea4c": "1610612754", // Indiana Pacers
  "583ecefd-fb46-11e1-82cb-f4ce4684ea4c": "1610612749", // Milwaukee Bucks
  
  // Southeast Division
  "583ecb8f-fb46-11e1-82cb-f4ce4684ea4c": "1610612737", // Atlanta Hawks
  "583ec97e-fb46-11e1-82cb-f4ce4684ea4c": "1610612766", // Charlotte Hornets
  "583ecea6-fb46-11e1-82cb-f4ce4684ea4c": "1610612748", // Miami Heat
  "583ed157-fb46-11e1-82cb-f4ce4684ea4c": "1610612753", // Orlando Magic
  "583ec8d4-fb46-11e1-82cb-f4ce4684ea4c": "1610612764", // Washington Wizards
  
  // Northwest Division
  "583eca88-fb46-11e1-82cb-f4ce4684ea4c": "1610612743", // Denver Nuggets
  "583ece50-fb46-11e1-82cb-f4ce4684ea4c": "1610612750", // Minnesota Timberwolves
  "583ecfff-fb46-11e1-82cb-f4ce4684ea4c": "1610612760", // Oklahoma City Thunder
  "583ed056-fb46-11e1-82cb-f4ce4684ea4c": "1610612757", // Portland Trail Blazers
  "583ece0a-fb46-11e1-82cb-f4ce4684ea4c": "1610612762", // Utah Jazz
  
  // Pacific Division
  "583ec825-fb46-11e1-82cb-f4ce4684ea4c": "1610612744", // Golden State Warriors
  "583ecdfb-fb46-11e1-82cb-f4ce4684ea4c": "1610612746", // LA Clippers
  "583ecae2-fb46-11e1-82cb-f4ce4684ea4c": "1610612747", // Los Angeles Lakers
  "583ecfa8-fb46-11e1-82cb-f4ce4684ea4c": "1610612756", // Phoenix Suns
  "583ed0ac-fb46-11e1-82cb-f4ce4684ea4c": "1610612758", // Sacramento Kings
  
  // Southwest Division
  "583ecf1e-fb46-11e1-82cb-f4ce4684ea4c": "1610612742", // Dallas Mavericks
  "583ccfa8-fb46-11e1-82cb-f4ce4684ea4c": "1610612745", // Houston Rockets
  "583ed102-fb46-11e1-82cb-f4ce4684ea4c": "1610612763", // Memphis Grizzlies
  "583ecc9a-fb46-11e1-82cb-f4ce4684ea4c": "1610612740", // New Orleans Pelicans
  "583ecd4f-fb46-11e1-82cb-f4ce4684ea4c": "1610612759"  // San Antonio Spurs
};

// Team name to SportRadar ID mapping for reverse lookup
const teamNameToId = {
  "Atlanta Hawks": "583ecb8f-fb46-11e1-82cb-f4ce4684ea4c",
  "Boston Celtics": "583eca2f-fb46-11e1-82cb-f4ce4684ea4c",
  "Brooklyn Nets": "583ecda6-fb46-11e1-82cb-f4ce4684ea4c",
  "Charlotte Hornets": "583ec97e-fb46-11e1-82cb-f4ce4684ea4c",
  "Chicago Bulls": "583ec773-fb46-11e1-82cb-f4ce4684ea4c",
  "Cleveland Cavaliers": "583ec7cd-fb46-11e1-82cb-f4ce4684ea4c",
  "Dallas Mavericks": "583ecf1e-fb46-11e1-82cb-f4ce4684ea4c",
  "Denver Nuggets": "583eca88-fb46-11e1-82cb-f4ce4684ea4c",
  "Detroit Pistons": "583ec928-fb46-11e1-82cb-f4ce4684ea4c",
  "Golden State Warriors": "583ec825-fb46-11e1-82cb-f4ce4684ea4c",
  "Houston Rockets": "583ccfa8-fb46-11e1-82cb-f4ce4684ea4c",
  "Indiana Pacers": "583ecd4f-fb46-11e1-82cb-f4ce4684ea4c",
  "LA Clippers": "583ecdfb-fb46-11e1-82cb-f4ce4684ea4c",
  "Los Angeles Lakers": "583ecae2-fb46-11e1-82cb-f4ce4684ea4c",
  "Memphis Grizzlies": "583ed102-fb46-11e1-82cb-f4ce4684ea4c",
  "Miami Heat": "583ecea6-fb46-11e1-82cb-f4ce4684ea4c",
  "Milwaukee Bucks": "583ecefd-fb46-11e1-82cb-f4ce4684ea4c",
  "Minnesota Timberwolves": "583ece50-fb46-11e1-82cb-f4ce4684ea4c",
  "New Orleans Pelicans": "583ecc9a-fb46-11e1-82cb-f4ce4684ea4c",
  "New York Knicks": "583ec70e-fb46-11e1-82cb-f4ce4684ea4c",
  "Oklahoma City Thunder": "583ecfff-fb46-11e1-82cb-f4ce4684ea4c",
  "Orlando Magic": "583ed157-fb46-11e1-82cb-f4ce4684ea4c",
  "Philadelphia 76ers": "583ec87d-fb46-11e1-82cb-f4ce4684ea4c",
  "Phoenix Suns": "583ecfa8-fb46-11e1-82cb-f4ce4684ea4c",
  "Portland Trail Blazers": "583ed056-fb46-11e1-82cb-f4ce4684ea4c",
  "Sacramento Kings": "583ed0ac-fb46-11e1-82cb-f4ce4684ea4c",
  "San Antonio Spurs": "583ecd4f-fb46-11e1-82cb-f4ce4684ea4c",
  "Toronto Raptors": "583ecf50-fb46-11e1-82cb-f4ce4684ea4c",
  "Utah Jazz": "583ece0a-fb46-11e1-82cb-f4ce4684ea4c",
  "Washington Wizards": "583ec8d4-fb46-11e1-82cb-f4ce4684ea4c"
};

/**
 * Gets logo URL for a team based on its name
 * @param {string} teamName - The team's full name
 * @returns {string} - URL to the team's logo
 */
function getLogoByTeamName(teamName) {
  // First check direct mapping
  if (teamLogoMap[teamName]) {
    return teamLogoMap[teamName];
  }
  
  // If not found directly, try to convert team name to ID and get logo
  const teamId = teamNameToId[teamName];
  if (teamId) {
    return getLogoByTeamId(teamId);
  }
  
  // Last resort - sanitize the name and construct a basic URL
  const sanitizedName = teamName.toLowerCase().replace(/\s+/g, '-');
  return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${sanitizedName}.png`;
}

/**
 * Gets NBA.com team ID from SportRadar team ID
 * @param {string} sportRadarId - The SportRadar team ID
 * @returns {string} - The NBA.com team ID or a fallback ID
 */
function getNbaTeamId(sportRadarId) {
  return teamIdMapping[sportRadarId] || '1610612700'; // Fallback ID
}

/**
 * Gets team logo URL based on SportRadar team ID
 * @param {string} sportRadarId - The SportRadar team ID
 * @returns {string} - URL to the team's logo on NBA.com
 */
function getLogoByTeamId(sportRadarId) {
  // First try the NBA.com ID mapping
  const nbaId = getNbaTeamId(sportRadarId);
  if (nbaId !== '1610612700') { // If not the fallback ID
    return `https://cdn.nba.com/logos/nba/${nbaId}/global/L/logo.svg`;
  }
  
  // If SportRadar ID isn't recognized, try a direct ESPN URL with the ID
  // This is a fallback as ESPN might have a different structure
  return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${sportRadarId}.png`;
}

/**
 * Attempt to get a working logo URL using multiple methods
 * @param {string} teamId - Team ID or name
 * @param {string} teamName - Full team name (backup)
 * @returns {string} - Best available logo URL
 */
function getBestLogoUrl(teamId, teamName) {
  // Try getting logo by ID first
  const logoByTeamId = getLogoByTeamId(teamId);
  
  // If we're not using the fallback ID, this is probably good
  if (getNbaTeamId(teamId) !== '1610612700') {
    return logoByTeamId;
  }
  
  // Try by team name as fallback
  if (teamName) {
    return getLogoByTeamName(teamName);
  }
  
  // Last resort, return a default NBA logo
  return 'https://cdn.nba.com/logos/nba/fallback-team-logo.png';
}

module.exports = {
  getLogoByTeamName,
  getLogoByTeamId,
  getNbaTeamId,
  getBestLogoUrl
}; 
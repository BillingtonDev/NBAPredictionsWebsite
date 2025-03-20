const axios = require('axios');
const teamLogos = require('./teamLogos');

const API_KEY = process.env.SPORTRADAR_API_KEY;

// Simple in-memory cache
const cache = {
  schedules: {},
  summaries: {}
};

// cache expiration time 
const CACHE_TTL = 60 * 60 * 1000;

// get the full season schedule with caching
async function getSeasonSchedule(year = '2024', season = 'REG') {
  const cacheKey = `${year}_${season}`;
  
  if (cache.schedules[cacheKey] && 
      cache.schedules[cacheKey].timestamp > Date.now() - CACHE_TTL) {
    return cache.schedules[cacheKey].data;
  }
  
  try {
    const url = `https://api.sportradar.com/nba/trial/v8/en/games/${year}/${season}/schedule.json?api_key=${API_KEY}`;
    const response = await axios.get(url);
    
    cache.schedules[cacheKey] = {
      timestamp: Date.now(),
      data: response.data.games || []
    };
    
    return response.data.games || [];
  } catch (error) {
    console.error('Error fetching season schedule:', error.message);
    return [];
  }
}

// Get game summary with caching
async function getGameSummary(gameId) {
  if (cache.summaries[gameId] && 
      cache.summaries[gameId].timestamp > Date.now() - CACHE_TTL) {
    return cache.summaries[gameId].data;
  }
  
  try {
    const url = `https://api.sportradar.com/nba/trial/v8/en/games/${gameId}/summary.json?api_key=${API_KEY}`;
    const response = await axios.get(url);
    
    cache.summaries[gameId] = {
      timestamp: Date.now(),
      data: response.data
    };
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching game summary for ${gameId}:`, error.message);
    return null;
  }
}

// Get games for a specific date
async function getGamesForDate(date) {
  try {
    // Get the full season schedule
    const allGames = await getSeasonSchedule();
    
    // filter games for the requested date
    const formattedDate = formatDateString(date);
    const gamesOnDate = allGames.filter(game => {
      const gameDate = new Date(game.scheduled);
      return formatDateString(gameDate) === formattedDate;
    });
    
    // For completed or in-progress games, get the summary to get accurate scores
    const gamesPromises = gamesOnDate.map(async (game) => {
      if (game.status === 'closed' || game.status === 'inprogress') {
        try {
          const summary = await getGameSummary(game.id);
          if (summary) {
            return {
              ...game,
              home: {
                ...game.home,
                points: summary.home.points,
                scoring: summary.home.scoring || []
              },
              away: {
                ...game.away,
                points: summary.away.points,
                scoring: summary.away.scoring || []
              }
            };
          }
        } catch (error) {
          console.error(`Error fetching summary for game ${game.id}:`, error.message);
        }
      }
      return game;
    });
    
    return Promise.all(gamesPromises);
  } catch (error) {
    console.error('Error fetching games for date:', error.message);
    return [];
  }
}

// format date as YYYY-MM-DD
function formatDateString(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

// format games data for display
function formatGamesData(games) {
  return games.map(game => {
    const homeTeam = game.home;
    const awayTeam = game.away;
    
    // determine game status
    let status = 'Scheduled';
    if (game.status === 'closed') {
      status = 'Final';
    } else if (game.status === 'inprogress') {
      status = 'Live';
    }
    
    // format date and time
    const gameDate = new Date(game.scheduled);
    const formattedDate = gameDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    const formattedTime = gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    //team logos
    const homeTeamLogo = teamLogos.getLogoByTeamName(homeTeam.name);
    const awayTeamLogo = teamLogos.getLogoByTeamName(awayTeam.name);
    
    // Format quarter scores if available
    const homeQuarters = homeTeam.scoring || [];
    const awayQuarters = awayTeam.scoring || [];
    
    return {
      id: game.id,
      date: formattedDate,
      time: formattedTime,
      status: status,
      homeTeam: homeTeam.name,
      homeTeamAbbreviation: homeTeam.alias,
      homeScore: homeTeam.points || 0,
      homeTeamLogo: homeTeamLogo,
      homeTeamWon: game.status === 'closed' && homeTeam.points > awayTeam.points,
      homeQuarters: homeQuarters,
      awayTeam: awayTeam.name,
      awayTeamAbbreviation: awayTeam.alias,
      awayScore: awayTeam.points || 0,
      awayTeamLogo: awayTeamLogo,
      awayTeamWon: game.status === 'closed' && awayTeam.points > awayTeam.points,
      awayQuarters: awayQuarters,
      venue: game.venue ? game.venue.name : '',
      location: game.venue ? `${game.venue.city}, ${game.venue.state}` : ''
    };
  });
}

// Make sure to export all functions
module.exports = {
  getGamesForDate,
  getSeasonSchedule,
  getGameSummary,
  formatGamesData
}; 
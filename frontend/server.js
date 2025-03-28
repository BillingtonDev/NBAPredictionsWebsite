const express = require('express');
const session = require('express-session');
const path = require('path');
// Require our NBA API utility
const nbaApi = require('./utils/nbaApi');
// Add the nbaScores utility
const nbaScores = require('./utils/nbaScores');
const app = express();
const port = process.env.PORT || 3000;

// All the Middleware

//Configure Session Middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set the correct MIME types for CSS files
app.use((req, res, next) => {
    if (req.path.endsWith('.css')) {
        res.type('text/css');
    }
    next();
});

// Serve static files (like images, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

//Track session Details
app.use((req, res, next) => {
    if (!req.session.startTime) {
        // Initialize session data
        req.session.startTime = Date.now();
        req.session.pageCount = 0;
        req.session.isLoggedIn = false;
    }
    // Increase page view count on each request
    req.session.pageCount++;
    next();
});

// Serve the homepage
app.get('/', (req, res) => {
    const sessionStart = new Date(req.session.startTime);
    res.render('homepage', {
        title: 'My Homepage',
        sessionStart: sessionStart.toLocaleTimeString(),
        pageCount: req.session.pageCount
    });
});

// Serve the login page
app.get('/loginpage', (req, res) => {
    res.render('loginpage', {
        title: 'Login'
    });
});

// Serve the teams page - Updated to use the SportRadar API
app.get('/teams', async (req, res) => {
    try {
        // Fetch teams from the API
        const teams = await nbaApi.getAllTeams();
        
        res.render('teams', {
            title: 'NBA Teams',
            teams: teams
        });
    } catch (error) {
        console.error('Error fetching teams data:', error);
        // Fallback to rendering the page without team data
        res.render('teams', {
            title: 'NBA Teams',
            teams: [],
            error: 'Unable to load team data. Please try again later.'
        });
    }
});

// Updated scores route without mock data
app.get('/scores', async (req, res) => {
    try {
        // Get date from query parameter or use current date
        let dateParam = req.query.date;
        let date;
        
        if (dateParam) {
            // Parse the date from the query parameter
            date = new Date(dateParam);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                date = new Date(); // Fallback to current date if invalid
            }
        } else {
            date = new Date(); // Default to current date
        }
        
        // Get games for the selected date
        let games = await nbaScores.getGamesForDate(date);
        games = nbaScores.formatGamesData(games);
        
        // Calculate previous and next day dates
        const prevDay = new Date(date);
        prevDay.setDate(prevDay.getDate() - 1);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Format date for display
        const displayDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Format dates for navigation
        const prevDayParam = prevDay.toISOString().split('T')[0];
        const nextDayParam = nextDay.toISOString().split('T')[0];
        
        res.render('scores', { 
            title: 'NBA Scores',
            scores: games,
            date: displayDate,
            prevDay: prevDayParam,
            nextDay: nextDayParam
        });
    } catch (error) {
        console.error('Error in scores route:', error);
        res.status(500).render('error', { 
            message: 'Failed to load scores',
            error: {
                status: 500,
                stack: process.env.NODE_ENV === 'development' ? error.stack : ''
            }
        });
    }
});

// serve the Trending Page
app.get('/trending', (req, res) => {
    res.render('news', {
        title: 'News'
    });
});

// serve the Statistics Page
app.get('/statistics', (req, res) => {
    res.render('statistics', {
        title: 'Statistics'
    });
});

// Serve the Predictions Page
app.get("/predictions", (req, res) => {
  res.render("predictions", {
    title: "Predictions",
  });
});

// Serve the Contact Us Page
app.get("/contactus", (req, res) => {
    res.render("contactus", {
      title: "Contact Us",
    });
  });

// Single route to handle all team pages - Updated to use team ID for API lookup
app.get('/teams/:teamId', async (req, res) => {
    try {
        const teamId = req.params.teamId;
        
        // Fetch team profile and roster data in parallel
        const [teamProfile, teamRoster] = await Promise.all([
            nbaApi.getTeamProfile(teamId),
            nbaApi.getTeamRoster(teamId)
        ]);
        
        // Generate the best possible logo URL for this team
        const fullName = `${teamProfile.market} ${teamProfile.name}`;
        const teamLogoUrl = require('./utils/teamLogos').getBestLogoUrl(teamId, fullName);
        
        res.render('team', { 
            teamName: fullName,
            teamId: teamId,
            teamLogoUrl: teamLogoUrl,
            team: teamProfile,
            roster: teamRoster.players
        });
    } catch (error) {
        console.error('Error fetching team data:', error);
        res.status(404).render('error', { 
            message: 'Team not found or unable to load team data',
            error: {
                status: 404,
                stack: process.env.NODE_ENV === 'development' ? error.stack : ''
            }
        });
    }
});

// Update the game details route to handle missing data
app.get('/game/:gameId', async (req, res) => {
    try {
        const gameId = req.params.gameId;
        
        // Get boxscore data only
        const boxscore = await nbaScores.getBoxscore(gameId);
        
        if (!boxscore) {
            return res.status(404).render('error', { 
                message: 'Game not found',
                error: { status: 404 }
            });
        }
        
        // Get team logos
        const homeTeamLogo = require('./utils/teamLogos').getLogoByTeamName(boxscore.home.name);
        const awayTeamLogo = require('./utils/teamLogos').getLogoByTeamName(boxscore.away.name);
        
        // Ensure venue information exists
        if (!boxscore.venue) {
            boxscore.venue = {
                name: 'Unknown Venue',
                city: '',
                state: ''
            };
        }
        
        res.render('game-details', {
            title: `${boxscore.away.name} @ ${boxscore.home.name}`,
            game: boxscore,
            homeTeamLogo: homeTeamLogo,
            awayTeamLogo: awayTeamLogo
        });
    } catch (error) {
        console.error('Error fetching game details:', error);
        res.status(500).render('error', { 
            message: 'Failed to load game details',
            error: {
                status: 500,
                stack: process.env.NODE_ENV === 'development' ? error.stack : ''
            }
        });
    }
});

// Add an API route to get all teams (for client-side JavaScript if needed)
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await nbaApi.getAllTeams();
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams data:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Add a test route for specific team ID
app.get('/test-team/:teamId', async (req, res) => {
  try {
    const teamId = req.params.teamId || '583eca2f-fb46-11e1-82cb-f4ce4684ea4c'; // Default to Boston Celtics
    
    console.log(`Testing team API with ID: ${teamId}`);
    // Use getTeamProfile instead of getTeamById to get standings data
    const teamData = await nbaApi.getTeamProfile(teamId);
    
    // Generate the best possible logo URL
    const fullName = `${teamData.market} ${teamData.name}`;
    const teamLogoUrl = require('./utils/teamLogos').getBestLogoUrl(teamId, fullName);
    
    res.render('team', { 
      teamName: fullName,
      teamId: teamId,
      teamLogoUrl: teamLogoUrl,
      team: teamData,
      roster: teamData.players || []
    });
  } catch (error) {
    console.error('Error in test-team route:', error);
    res.status(500).render('error', { 
      message: 'Failed to load team data',
      error: {
        status: 500,
        stack: process.env.NODE_ENV === 'development' ? error.stack : ''
      }
    });
  }
});


app.get('/api/nba-news', async (req, res) => {
    try {
      const response = await fetch('http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching NBA news:', error);
      res.status(500).json({ error: 'Failed to fetch NBA news' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }
  
  // Export the Express app for Vercel
  module.exports = app;
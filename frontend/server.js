const express = require('express');
const session = require('express-session');
const path = require('path');
// Require our NBA API utility
const nbaApi = require('./utils/nbaApi');
const app = express();
const port = 3000;

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

// Serve the scores page
app.get('/scores', (req, res) => {
    res.render('scores', {
        title: 'Scores'
    });
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

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

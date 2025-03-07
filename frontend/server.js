const express = require('express');
const session = require('express-session');
const path = require('path');
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

// Serve the teams page
app.get('/teams', (req, res) => {
    res.render('teams', {
        title: 'Nba teams'
    });
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


// Teams array for all teams
const teams = [
    "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets", "Chicago Bulls",
    "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons", "Golden State Warriors",
    "Houston Rockets", "Indiana Pacers", "LA Clippers", "Los Angeles Lakers", "Memphis Grizzlies",
    "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks",
    "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns", "Portland Trail Blazers",
    "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors", "Utah Jazz", "Washington Wizards"
];



// Single route to handle all team pages
app.get('/teams/:team', (req, res) => {
    const teamName = req.params.team;
    res.render('team', { 
        teamName: teamName,
      });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

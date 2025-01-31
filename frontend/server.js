const express = require('express');
const path = require('path');
const app = express();
const port = 3000;



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Serve static files (like images, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the homepage
app.get('/', (req, res) => {
    res.render('homepage', {
        title: 'My Homepage'
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
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});



// Listen for page to load
document.addEventListener("DOMContentLoaded", function () {
    // Get the HTML property by ID
    const teamsGrid = document.getElementById("teamsGrid");


    // Array of all NBA teams in the league
    const nbaTeams = [
        "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets", "Chicago Bulls",
        "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons", "Golden State Warriors",
        "Houston Rockets", "Indiana Pa  cers", "LA Clippers", "Los Angeles Lakers", "Memphis Grizzlies",
        "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks",
        "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns", "Portland Trail Blazers",
        "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors", "Utah Jazz", "Washington Wizards"
    ];

    // Create a team box for each team
    nbaTeams.forEach(team => {
        
        let teamBox = document.createElement("a");
        teamBox.classList.add("team-box");
        teamBox.href = `/teams/${team.replace(/\s/g, '')}`;
        teamBox.innerHTML = `
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmaICiarC4q11sHLfeN7nJKAWfCYZyaw9oFw&s" alt="${team} Logo">
            <h3>${team}</h3>
        `;
        console.log(team);
        teamsGrid.appendChild(teamBox);
    });
});

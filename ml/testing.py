from nba_api.stats.endpoints import playercareerstats

# Nikola Jokić
career = playercareerstats.PlayerCareerStats(player_id='203999') 

def get_current_team(player_data):
    for result_set in ["rowSet"]:
        if result_set["name"] == "SeasonTotalsRegularSeason":
            latest_season = max(result_set["rowSet"], key=lambda x: x[1])  # Get the latest season
            team_id = latest_season[3]  # TEAM_ID
            team_abbreviation = latest_season[4]  # TEAM_ABBREVIATION
            return {"TEAM_ID": team_id, "TEAM_ABBREVIATION": team_abbreviation}
 
current_team = get_current_team(career.get_json())
print(current_team)



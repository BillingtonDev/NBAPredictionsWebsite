from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.static import players
from nba_api.stats.endpoints import commonteamroster
import pandas as pd
import time

def calculate_player_rating(stats):
    weights = {'PTS': 1.0, 'REB': 0.8, 'AST': 0.7, 'STL': 1.2, 'BLK': 1.1, 'TOV': -1.0}
    rating = sum(stats[stat] * weight for stat, weight in weights.items() if stat in stats)
    return (round(rating, 2) * 10)

def get_player_id(player_name):
    players_dict = players.get_players()
    for p in players_dict:
        if p['full_name'].lower() == player_name.lower():
            return p['id']
    return None

def get_player_stats(player_id):
    career = playercareerstats.PlayerCareerStats(player_id=player_id)
    stats = career.get_dict()

    if stats['resultSets'][0]['rowSet']:
        latest_season = stats['resultSets'][0]['rowSet'][-1]
        headers = stats['resultSets'][0]['headers']
        return dict(zip(headers, latest_season))
    return None

def estimate_team_stats():
    df = pd.DataFrame()
    team_id = '1610612737'
    team_players = get_team_players(team_id)
    print("Loading...")
    try:
        for id in team_players['PLAYER_ID']:
            row = get_player_stats(player_id=id)
            time.sleep(1)
            df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
            
            
        print("Success!")
        print(df)
        
    except Exception as error:
        print(error)
    
def get_team_players(team_id):
    try:
        roster = commonteamroster.CommonTeamRoster(team_id=team_id)
        players_data = roster.get_dict()
    
        if 'resultSets' in players_data and players_data['resultSets'][0]['rowSet']:
            headers = players_data['resultSets'][0]['headers']
            players = players_data['resultSets'][0]['rowSet']
            
            # Convert to DataFrame
            df = pd.DataFrame(players, columns=headers)
            return df[['PLAYER_ID', 'PLAYER', 'POSITION', 'HEIGHT', 'WEIGHT']]
    
    except Exception as error:
        print(error)
        
# print(calculate_player_rating(get_player_stats(player_id='203999')))
estimate_team_stats()
from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.static import players
import pandas as pd

def calculate_player_rating(stats):
    weights = {'PTS': 1.0, 'REB': 0.8, 'AST': 0.7, 'STL': 1.2, 'BLK': 1.1, 'TOV': -1.0}
    #rating = stats['PTS'] * weights['PTS'] + stats['REB'] * weights['REB'] + stats['AST'] * weights['AST'] + stats['STL'] * weights['STL'] + stats['BLK'] * weights['BLK'] + stats['TOV'] * weights['TOV']
    rating = sum(stats[stat] * weight for stat, weight in weights.items())
    
    return round(rating, 2)

def get_player_id(player_name):
    players_dict = players.get_players()
    for p in players_dict:
        if p['full_name'].lower() == player_name.lower():
            return p['id']
    return None

def get_player_stats(player_id):
    career = playercareerstats.PlayerCareerStats(player_id=player_id)
    df = pd.DataFrame(career.get_data_frames()[0]).iloc[0]
    return df

print(calculate_player_rating(get_player_stats(player_id='203999')))
from nba_api.stats.static import teams, players
from players import get_player_stats, calculate_player_rating, estimate_team_stats
from nba_api.stats.endpoints import playercareerstats
import pandas as pd

def get_team_players(team_id):
    pl = players.get_players()
    return [p for p in pl if p['is_active'] and p.get('team_id') == team_id]

def calculate_team_score(team):
    team_id = team['id']
    team_name = team['full_name']
    
    print(f'Processing {team_name}...')
    stats = estimate_team_stats(team_id)
    if stats.empty is False:
        player_stats = stats['PLAYER_ID'].apply(lambda x: get_player_stats(x))
        team_score = player_stats.apply(calculate_player_rating).sum()
        player_count = stats.shape[0]
    else:
        print("Stats not found.")
        return None
    
    return team_name, team_score, player_count

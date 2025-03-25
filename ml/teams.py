from nba_api.stats.static import teams, players
from players import get_player_stats, calculate_player_rating, estimate_team_stats
import pandas as pd

# Precompute active players for faster lookups
ACTIVE_PLAYERS = {p['id']: p for p in players.get_players() if p['is_active']}

def get_team_players(team_id):
    """Fetch active players for a given team."""
    return [p for p in ACTIVE_PLAYERS.values() if p.get('team_id') == team_id]

def calculate_team_score(team):
    team_id = team['id']
    team_name = team['full_name']

    print(f'Processing {team_name}...')
    stats = estimate_team_stats(team_id)

    if stats.empty:
        print(f"Stats not found for {team_name}.")
        return None

    # Vectorized player rating calculation
    stats['Player_Rating'] = stats['PLAYER_ID'].map(lambda pid: calculate_player_rating(get_player_stats(pid)))
    
    team_score = stats['Player_Rating'].sum()
    player_count = len(stats)

    return team_name, team_score, player_count

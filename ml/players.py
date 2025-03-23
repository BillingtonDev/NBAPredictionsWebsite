from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.static import players

def calculate_player_rating(stats):
    weights = {'PTS': 1.0, 'REB': 0.8, 'AST': 0.7, 'STL': 1.2, 'BLK': 1.1, 'TOV': -1.0}
    rating = sum(stats[stat] * weight for stat, weight in weights.items())
    return (round(score, 2) * 10)

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

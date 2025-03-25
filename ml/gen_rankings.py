from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.endpoints import commonteamroster
import pandas as pd
import time
import requests

def retry_with_backoff(func, *args, max_retries=3, base_delay=1, **kwargs):
    """
    Retry a function with exp. backoff (should prevent network-related constraints.. I think)
    """
    retries = 0
    while retries < max_retries:
        try:
            return func(*args, **kwargs)
        except (requests.exceptions.RequestException, Exception) as e:
            print(f"Attempt {retries + 1} failed: {e}")
            retries += 1
            wait_time = base_delay * (2 ** retries)
            print(f"Waiting {wait_time} seconds before retry...")
            time.sleep(wait_time)
    return None

def calculate_player_rating(stats):
    # Check if stats is not None before processing
    if stats is None:
        return 0
    
    weights = {'PTS': 1.0, 'REB': 0.8, 'AST': 0.7, 'STL': 1.2, 'BLK': 1.1, 'TOV': -1.0}
    rating = sum(stats.get(stat, 0) * weight for stat, weight in weights.items())
    return round(rating * 10, 2)

def get_player_stats(player_id):
    def fetch_player_stats():
        career = playercareerstats.PlayerCareerStats(player_id=player_id)
        stats = career.get_dict()

        if stats['resultSets'][0]['rowSet']:
            latest_season = stats['resultSets'][0]['rowSet'][-1]
            headers = stats['resultSets'][0]['headers']
            return dict(zip(headers, latest_season))
        return None

    try:
        time.sleep(1)  # Rate limiting
        return retry_with_backoff(fetch_player_stats)
    except Exception as e:
        print(f"Persistent error fetching stats for player {player_id}: {e}")
    return None

def get_team_players(team_id):
    def fetch_team_roster():
        roster = commonteamroster.CommonTeamRoster(team_id=team_id)
        players_data = roster.get_dict()
    
        if 'resultSets' in players_data and players_data['resultSets'][0]['rowSet']:
            headers = players_data['resultSets'][0]['headers']
            players = players_data['resultSets'][0]['rowSet']
            
            # Convert to DataFrame
            df = pd.DataFrame(players, columns=headers)
            return df[['PLAYER_ID', 'PLAYER', 'POSITION', 'HEIGHT', 'WEIGHT']]
        return None

    try:
        return retry_with_backoff(fetch_team_roster)
    except Exception as error:
        print(f"Error getting team players: {error}")
    return None

def estimate_team_stats(team_id):
    df = pd.DataFrame()
    team_players_df = get_team_players(team_id)
    
    if team_players_df is None:
        return None
    
    print("Loading team stats...")
    try:
        for player_id in team_players_df['PLAYER_ID']:
            row = get_player_stats(player_id=player_id)
            if row is not None:
                df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
            time.sleep(1)
        
        print("Team stats loaded successfully!")
        return df
        
    except Exception as error:
        print(f"Error estimating team stats: {error}")
    return None

def calculate_team_score(team):
    team_id = team['id']
    team_name = team['full_name']
    
    print(f'Processing {team_name}...')
    stats = estimate_team_stats(team_id)
    
    if stats is not None and not stats.empty:
        player_ratings = []
        for player_id in stats['PLAYER_ID']:
            player_stats = get_player_stats(player_id)
            if player_stats:
                player_ratings.append(calculate_player_rating(player_stats))
        
        team_score = sum(player_ratings)
        player_count = len(player_ratings)
        
        return team_name, team_score, player_count
    else:
        print(f"No stats found for {team_name}")
        return None

def main():
    all_teams = teams.get_teams()
    team_ratings = []
    
    for team in all_teams:
        result = calculate_team_score(team)
        if result:
            team_ratings.append(result)
    
    team_ratings.sort(key=lambda x: x[1], reverse=True)
    
    with open('team_ratings.txt', 'w') as f:
        for team_name, team_rating, player_count in team_ratings:
            f.write(f'{team_name}: {team_rating:.2f} (Num Players: {player_count})\n')
    
    print('Team scores saved to team_ratings.txt')

if __name__ == '__main__':
    main()
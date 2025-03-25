from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.endpoints import commonteamroster
import pandas as pd
import time

def calculate_player_rating(stats):
    # Check if stats is not None before processing
    if stats is None:
        return 0
    
    weights = {'PTS': 1.0, 'REB': 0.8, 'AST': 0.7, 'STL': 1.2, 'BLK': 1.1, 'TOV': -1.0}
    rating = sum(stats.get(stat, 0) * weight for stat, weight in weights.items())
    return round(rating * 10, 2)

def get_player_id(player_name):
    players_dict = players.get_players()
    for p in players_dict:
        if p['full_name'].lower() == player_name.lower():
            return p['id']
    return None

def get_player_stats(player_id):
    try:
        time.sleep(1)  # Rate limiting
        career = playercareerstats.PlayerCareerStats(player_id=player_id)
        stats = career.get_dict()

        if stats['resultSets'][0]['rowSet']:
            latest_season = stats['resultSets'][0]['rowSet'][-1]
            headers = stats['resultSets'][0]['headers']
            return dict(zip(headers, latest_season))
    except Exception as e:
        print(f"Error fetching stats for player {player_id}: {e}")
    return None

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
        player_ratings = [calculate_player_rating(get_player_stats(player_id)) 
                          for player_id in stats['PLAYER_ID']]
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
        
        # Uncomment the break to process entire league, keep for testing
        # break 
    
    team_ratings.sort(key=lambda x: x[1], reverse=True)
    
    with open('team_ratings.txt', 'w') as f:
        for team_name, team_rating, player_count in team_ratings:
            f.write(f'{team_name}: {team_rating:.2f} (Num Players: {player_count})\n')
    
    print('Team scores saved to team_ratings.txt')

if __name__ == '__main__':
    main()
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../frontend/.env')

# API constants
API_KEY = os.environ.get('SPORTRADAR_API_KEY')
BASE_URL = 'https://api.sportradar.com/nba/trial/v8/en'

def get_daily_schedule(date_str=None):
    """
    Fetch the NBA schedule for a specific date from Sportradar API
    
    Args:
        date_str (str): Date in format 'YYYY-MM-DD' or None for today's games
    
    Returns:
        list: List of games with home and away team information
    """
    try:
        # Build the endpoint URL
        # For the full season schedule
        url = f"{BASE_URL}/games/2024/REG/schedule.json?api_key={API_KEY}"
        
        # If we want a specific date, we would use a different endpoint
        # Currently using full season schedule as it contains all games
        
        response = requests.get(url, timeout=30, headers={"accept": "application/json"})
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        
        data = response.json()
        
        # Extract games and team information
        games = []
        if 'games' in data:
            for game in data['games']:
                # Filter by date if date_str is provided
                if date_str and 'scheduled' in game:
                    game_date = game['scheduled'].split('T')[0]  # Extract YYYY-MM-DD part
                    if game_date != date_str:
                        continue
                        
                games.append({
                    'game_id': game.get('id'),
                    'status': game.get('status'),
                    'home_team': {
                        'id': game.get('home', {}).get('id'),
                        'name': game.get('home', {}).get('name'),
                        'alias': game.get('home', {}).get('alias')
                    },
                    'away_team': {
                        'id': game.get('away', {}).get('id'),
                        'name': game.get('away', {}).get('name'),
                        'alias': game.get('away', {}).get('alias')
                    },
                    'scheduled': game.get('scheduled')
                })
        
        return games
    
    except Exception as e:
        print(f"Error fetching NBA schedule: {e}")
        return []

def get_matchup_teams(game_id=None, date_str=None):
    """
    Get a list of teams for a specific game or the first game of the day
    
    Args:
        game_id (str): Specific game ID to get teams for
        date_str (str): Date in format 'YYYY-MM-DD' or None for today
    
    Returns:
        list: Two-item list with home and away team names
    """
    games = get_daily_schedule(date_str)
    
    print(f"DEBUG: Found {len(games)} games from Sportradar API")
    
    if not games:
        print("DEBUG: No games found, returning None")
        return None
    
    # If game_id is provided, find that specific game
    if game_id:
        for game in games:
            if game['game_id'] == game_id:
                return [game['home_team']['name'], game['away_team']['name']]
        return None
    
    # Otherwise return the first scheduled game
    return [games[0]['home_team']['name'], games[0]['away_team']['name']]

if __name__ == "__main__":
    # Test the functions
    print(get_daily_schedule())
    print(get_matchup_teams()) 
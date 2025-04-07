from langchain.prompts import ChatPromptTemplate
import json
from openai import OpenAI as c

# Import the schedule fetcher
from schedule_fetcher import get_matchup_teams

PROMPT_TEMPLATE = """
You are a statistical analyst for the NBA. Based on the following team ratings and the given team matchup, as well as the odds given, return your thoughts on the matchup. 
Mention which team has the higher team rating, and why the odds are unusual or not given the history (that you have access to) of the teams matchups and how a new roster could affect (or not) the historical outcome. 
IMPORTANT: RETURN NO MORE THAN A SINGLE PARAGRAPH OF ANALYSIS, CONSISTING OF, AT MOST, 4 SENTENCES. DO NOT TALK ABOUT THE BOOKMAKERS, THESE ODDS ARE ONES CALCULATED WITHIN THE PROGRAM

The matchup is: {matchup}
The odds are: {odds}
"""


def calculate_fractional_odds(team1_rating, team2_rating):
    # Normalize the ratings bc they are in the 6 figures, which doesn't work well with elo-based theory
    norm_team1_rating = team1_rating / 1000
    norm_team2_rating = team2_rating / 1000
    rating_difference = norm_team2_rating - norm_team1_rating

    # Swirch to logistic Elo-based probability mdoel
    probability = 1 / (1 + 10 ** (rating_difference / 50))
    if probability == 1:
        return "1000:1"  # jic extreme case

    odds = probability / (1 - probability)

    # Format as X:1 or 1:X
    return f"{odds:.1f}:1" if odds >= 1 else f"1:{(1 / odds):.1f}"


def predict(game_id=None, date_str=None, teams=None):
    """
    Predict the outcome of a game using team ratings

    Args:
        game_id (str): ID of the game to predict
        date_str (str): Date to get games from (YYYY-MM-DD)
        teams (list): Optional list of two team names to use instead of fetching from API

    Returns:
        str: Analysis paragraph
    """
    # Get teams from schedule API if not provided
    if not teams:
        teams = get_matchup_teams(game_id, date_str)
        if not teams:
            # Fallback to default teams if API fails
            teams = ["Bulls", "Raptors"]
            print("Warning: Using default teams because API request failed.")

    # Find and return the team name, score and number of players for each team as lists team1, team2
    with open("processed_teams.json", "r") as file:
        ratings_json = json.load(file)
    team_ratings_dict = {
        entry[0]: (entry[1], entry[2]) for entry in ratings_json["team_ratings"]
    }

    # Filter teams by keywords from the API team names
    ratings = {}
    for team_key in teams:
        for full_team_name in team_ratings_dict.keys():
            if team_key in full_team_name:
                ratings[full_team_name] = team_ratings_dict[full_team_name]
                break

    # If we don't have exactly two teams, something went wrong
    if len(ratings) != 2:
        team_names = [
            name
            for name in team_ratings_dict.keys()
            if any(team in name for team in teams)
        ]
        if len(team_names) >= 2:
            ratings = {
                team_names[0]: team_ratings_dict[team_names[0]],
                team_names[1]: team_ratings_dict[team_names[1]],
            }
        else:
            raise ValueError(
                f"Expected exactly two teams, but found: {list(ratings.keys())}. Searched for: {teams}"
            )

    (team1_name, team1_values), (team2_name, team2_values) = ratings.items()
    team1 = (team1_name, team1_values[0], team1_values[1])
    team2 = (team2_name, team2_values[0], team2_values[1])

    matchup = f"{team1[0]} with a score of {team1[1]} and {team1[2]} players VS {team2[0]} with a score of {team2[1]} and {team2[2]} players"
    # Calculate odds w/ team scores
    odds = calculate_fractional_odds(team1[1], team2[1])

    client = c()
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": ChatPromptTemplate.from_template(PROMPT_TEMPLATE).format(
                    matchup=matchup, odds=odds
                ),
            }
        ],
    )

    return completion.choices[0].message.content


if __name__ == "__main__":
    # Test prediction with today's first game
    analysis = predict()
    print(analysis)

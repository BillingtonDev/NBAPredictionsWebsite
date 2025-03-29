from openai import OpenAI
from langchain.prompts import ChatPromptTemplate
import json
from openai import OpenAI as c
import math

PROMPT_TEMPLATE = """
You are a statistical analyst for the NBA. Based on the following team ratings and the given team matchup, as well as the odds given, return your thoughts on the matchup. 
For example, if the score of the Magic is A and the score of the Bulls is B, and the given team matchup is Magic vs Bulls, and the odds are 2.5:1, mention which team has the higher team rating, and why the odds make sense.
IMPORTANT: RETURN NO MORE THAN A SINGLE PARAGRAPH OF ANALYSIS, CONSISTING OF, AT MOST, 4 SENTENCES

The matchup is: {matchup}
The odds are: {odds}
"""

def calculate_fractional_odds(team1_rating, team2_rating):
    team_rating_difference = abs(team1_rating-team2_rating)

    # Calculate odds using the fractional odds formula
    odds = (math.exp(team_rating_difference) / (1 + math.exp(team_rating_difference))) * 100
    
    # Format as X:1 if decimal_odds is greater than or equal to 1
    if odds >= 1:
        return f"{odds:.1f}:1"
    else:
        # For odds less than 1, invert to show as 1:X
        inverted_odds = 1 / odds if odds > 0 else float('inf')
        return f"1:{inverted_odds:.1f}"
    
def predict():
    # TODO: get teams array (of max 2 teams at a time) from the frontend
    teams = ['Bulls', 'Raptors']

    # Find and return the team name, score and number of players for each team as lists team1, team2
    with open('processed_teams.json', 'r') as file:
        ratings_json = json.load(file)
    team_ratings_dict = {entry[0]: (entry[1], entry[2]) for entry in ratings_json["team_ratings"]}
    ratings = {
        team_name: team_ratings_dict[team_name]
        for team_name in team_ratings_dict
        if any(keyword in team_name for keyword in teams)
    }
    if len(ratings) != 2:
        raise ValueError("Expected exactly two teams, but found: " + str(list(ratings.keys())))
    (team1_name, team1_values), (team2_name, team2_values) = ratings.items()
    team1 = (team1_name, team1_values[0], team1_values[1])
    team2 = (team2_name, team2_values[0], team2_values[1])

    matchup = "f{team1[0]} with a score of {team1[1]} and {team1[2]} players VS {team2[0]} with a score of {team2[1]} and {team2[2]} players"
    # Calculate odds w/ team scores
    odds = calculate_fractional_odds(team1[1], team2[1])

    client = c()
    completion = client.chat.completions.create(model="gpt-4o", messages=[{
                "role": "user",
                "content": ChatPromptTemplate.from_template(PROMPT_TEMPLATE).format(matchup=matchup, odds=odds)}])
    print(completion.choices[0].message.content)

if __name__ == "__main__":
    predict()

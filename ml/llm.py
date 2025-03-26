from openai import OpenAI
from langchain.prompts import ChatPromptTemplate
import json
from openai import OpenAI as c

PROMPT_TEMPLATE = """
You are a statistical analyst for the NBA. Based on the following team ratings and the given team matchup, return the odds of the match. 
For example: if the score of the Magic is A and the score of the Bulls is B, and the given team matchup is Magic vs Bulls, use the fractional odds formula to calulate the odds.
The formula is as follows: `fractional_odds = exp(team_score_difference) / (1 + exp(team_score_difference))` Then multiply by 100 to get a decimal value, and format it as `X:Y`.
For example: if the output is `2.5`, you can display it as `2.5:1`.

The team matchup is: {team_matchup}
The team ratings are as follows: {team_ratings}
"""
def main():
    client = c()
    with open('processed_teams.json', 'r') as file:
        ratings = json.load(file)
    completion = client.chat.completions.create(model="gpt-4o", messages=[{
                "role": "user",
                #TODO: need to find a way to get what matchup we want to predict from the frontend. ie. Raptors vs Bulls
                "content": ChatPromptTemplate.from_template(PROMPT_TEMPLATE).format(team_ratings=ratings, team_matchup=matchup)}])
    print(completion.choices[0].message.content)

if __name__ == "__main__":
    main()

from players import *
from teams import *
from nba_api.stats.static import teams

def main():
    all_teams = teams.get_teams()
    team_ratings = []
    count = 4
    i = 0
    for team in all_teams:
        team_name, team_rating, player_count = calculate_team_score(team)
        team_ratings.append((team_name, team_rating, player_count))
        i += 1
        if i == count:
            break
        print("Success!")
    team_ratings.sort(key=lambda x: x[1], reverse = True)
    
    with open('team_ratings.txt', 'w') as f:
        for team_name, team_rating, player_count in team_ratings:
            f.write(f'{team_name}: {team_rating:.2f} (Num Players: {player_count})\n')
    print('Team scores saved to team_ratings.txt')

if __name__ == '__main__':
    main()

from nba_api.stats.static import teams, players

def get_team_players(team_id):
    pl = players.get_players()
    return [p for p in pl if p['is_active'] and p.get('team_id') == team_id]

def calculate_team_score(team):
    team_id = team['id']
    team_name = team['full_name']
    team_score = 0
    player_count = 0
    print(f'Processing {team_name}...')
    for p in players.get_players():
        if player.get('team_id') == team_id:
            player_id = player['id']
            stats = get_player_stats(player_id)
            if stats:
                player_score = calculate_player_score(stats)
                team_score += player_score
                player_count += 1
    return team_name, team_score, player_count



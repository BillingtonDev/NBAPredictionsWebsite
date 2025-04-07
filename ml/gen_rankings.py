from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.endpoints import commonteamroster
import pandas as pd
import time
import requests
import json
import os


def save_progress(team_ratings, processed_teams_file="processed_teams.json"):
    """
    Save current progress instead of retry functoin
    """
    progress_data = {"team_ratings": team_ratings, "timestamp": time.time()}

    try:
        with open(processed_teams_file, "w") as f:
            json.dump(progress_data, f, indent=2)
        print(f"Progress saved to {processed_teams_file}")
    except Exception as e:
        print(f"Error saving progress: {e}")


def load_progress(processed_teams_file="processed_teams.json"):
    """
    Load previously saved progress to avoid restarting
    """
    if os.path.exists(processed_teams_file):
        try:
            with open(processed_teams_file, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading progress: {e}")
    return None


def calculate_player_rating(stats):
    if stats is None:
        return 0

    weights = {"PTS": 1.0, "REB": 0.8, "AST": 0.7, "STL": 1.2, "BLK": 1.1, "TOV": -1.0}
    rating = sum(stats.get(stat, 0) * weight for stat, weight in weights.items())
    return round(rating * 10, 2)


def get_player_stats(player_id):
    def fetch_player_stats():
        try:
            career = playercareerstats.PlayerCareerStats(player_id=player_id)
            stats = career.get_dict()

            if stats["resultSets"][0]["rowSet"]:
                latest_season = stats["resultSets"][0]["rowSet"][-1]
                headers = stats["resultSets"][0]["headers"]
                return dict(zip(headers, latest_season))
        except Exception as e:
            print(f"Error fetching stats for player {player_id}: {e}")
        return None

    try:
        time.sleep(0.5)  # Reduce the wait time
        return fetch_player_stats()
    except Exception as e:
        print(f"Persistent error fetching stats for player {player_id}: {e}")
    return None


def get_team_players(team_id):
    try:
        roster = commonteamroster.CommonTeamRoster(team_id=team_id)
        players_data = roster.get_dict()

        if "resultSets" in players_data and players_data["resultSets"][0]["rowSet"]:
            headers = players_data["resultSets"][0]["headers"]
            players = players_data["resultSets"][0]["rowSet"]

            # Convert to DataFrame
            df = pd.DataFrame(players, columns=headers)
            return df[["PLAYER_ID", "PLAYER", "POSITION", "HEIGHT", "WEIGHT"]]
    except Exception as error:
        print(f"Error getting team players: {error}")
    return None


def calculate_team_score(team):
    team_id = team["id"]
    team_name = team["full_name"]

    print(f"Processing {team_name}...")
    team_players = get_team_players(team_id)

    if team_players is None:
        print(f"No players found for {team_name}")
        return None

    player_ratings = []
    for _, player in team_players.iterrows():
        player_id = player["PLAYER_ID"]
        player_stats = get_player_stats(player_id)
        if player_stats:
            player_ratings.append(calculate_player_rating(player_stats))

    if player_ratings:
        team_score = sum(player_ratings)
        player_count = len(player_ratings)
        print(f"{team_name} processed successfully")
        return team_name, team_score, player_count
    else:
        print(f"No player stats found for {team_name}")
        return None


def main():
    # Load previous progress if exists
    previous_progress = load_progress()

    # Determine starting piont
    all_teams = teams.get_teams()
    team_ratings = previous_progress["team_ratings"] if previous_progress else []
    processed_team_names = set(rating[0] for rating in team_ratings)

    try:
        for team in all_teams:
            # Skip already processed teams
            if team["full_name"] in processed_team_names:
                print(f"Skipping already processed team: {team['full_name']}")
                continue

            try:
                result = calculate_team_score(team)
                if result:
                    team_ratings.append(result)
                    processed_team_names.add(result[0])

                # Save progress after each team
                save_progress(team_ratings)

            except Exception as team_error:
                print(f"Error processing team {team['full_name']}: {team_error}")
                # Still save progress even if a team fails
                save_progress(team_ratings)

        # Final sorting and file writing
        team_ratings.sort(key=lambda x: x[1], reverse=True)

        with open("team_ratings.txt", "w") as f:
            for team_name, team_rating, player_count in team_ratings:
                line = f"{team_name}: {team_rating:.2f} (Num Players: {player_count})\n"
                f.write(line)
                print(line.strip())

        print(
            f"Team scores saved to team_ratings.txt. Processed {len(team_ratings)} teams."
        )

    except KeyboardInterrupt:
        # Handle manual interruption, still save progress
        print("Process interrupted by user.")
        save_progress(team_ratings)


if __name__ == "__main__":
    main()

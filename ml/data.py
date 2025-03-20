import requests
import pandas as pd

API_URL = "https://your-api-url.com/games"  # Replace with actual API endpoint

def fetch_game_data():
    response = requests.get(API_URL)
    if response.status_code == 200:
        return response.json()
    else:
        print("Failed to fetch data")
        return None

def save_data_to_csv(data, filename="game_data.csv"):
    df = pd.DataFrame(data)
    df.to_csv(filename, index=False)

if __name__ == "__main__":
    data = fetch_game_data()
    if data:
        save_data_to_csv(data)

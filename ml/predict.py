import torch
from unsloth import FastLanguageModel
from transformers import AutoTokenizer

# Load trained model
model = FastLanguageModel.from_pretrained("./trained_model")
tokenizer = AutoTokenizer.from_pretrained("./trained_model")

# Example input data (Replace with actual match data)
match_data = {"team_A": 5, "team_B": 12, "stat1": 7.8, "stat2": 5.6}
input_text = f"Predict winner: {match_data}"

# Tokenize and predict
inputs = tokenizer(input_text, return_tensors="pt")
with torch.no_grad():
    output = model.generate(**inputs)

prediction = tokenizer.decode(output[0], skip_special_tokens=True)
print(f"Predicted Winner: {prediction}")

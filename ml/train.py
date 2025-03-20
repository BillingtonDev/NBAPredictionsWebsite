import pandas as pd
import torch
from unsloth import FastLanguageModel
from transformers import Trainer, TrainingArguments

# Load Data
df = pd.read_csv("game_data.csv")

# Preprocessing
# Convert team names to numerical values, normalize stats, and prepare inputs/outputs

def preprocess_data(df):
    df["team_A"] = df["team_A"].astype("category").cat.codes
    df["team_B"] = df["team_B"].astype("category").cat.codes
    df["winner"] = df["winner"].astype("category").cat.codes
    return df

df = preprocess_data(df)

# Define input and labels
X = df[["team_A", "team_B", "stat1", "stat2"]].values  # Replace with actual stats
y = df["winner"].values

# Load an Unsloth Model
model, tokenizer = FastLanguageModel.from_pretrained("unsloth/llama-3b")

# Fine-tune model
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    logging_dir="./logs",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=X,  # Convert to dataset format
    eval_dataset=y,  # Convert to dataset format
)

trainer.train()

# Save the fine-tuned model
model.save_pretrained("./trained_model")
tokenizer.save_pretrained("./trained_model")

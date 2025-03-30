#!/bin/bash

echo "Starting NBA Prediction Servers..."

# Check if we're in the right directory
if [ -d "ml" ]; then
    echo "Running from NBAPredictionsWebsite directory"
    BASE_DIR="."
elif [ -d "NBAPredictionsWebsite/ml" ]; then
    echo "Running from parent directory"
    BASE_DIR="NBAPredictionsWebsite"
else
    echo "Error: Cannot find the project directory"
    echo "Please run this script from either the NBAPredictionsWebsite directory or its parent directory"
    exit 1
fi

# Start the ML API server in the background
echo "Starting ML API server..."
cd "$BASE_DIR/ml" && python api.py &
ML_PID=$!

# Wait a moment to ensure ML API starts first
sleep 3

# Start the Express server in the background
echo "Starting Express server..."
cd "$BASE_DIR/frontend" && npm install && node server.js &
EXPRESS_PID=$!

echo "Both servers are running!"
echo "ML API server is running on http://localhost:5000"
echo "Express server is running on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Wait for SIGINT (Ctrl+C)
trap "kill $ML_PID $EXPRESS_PID; exit" INT
wait 
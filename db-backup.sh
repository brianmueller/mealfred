#!/bin/bash

# URL of the JSON file
URL="https://json.extendsclass.com/bin/6101bafd48bf"

# Get the current timestamp in the format YYMMDD-HHMM
timestamp=$(date +"%y%m%d-%H%M")

# Set the filename with the timestamp
filename="db-${timestamp}.json"

# Download the JSON file, prettify it with jq, and save it with the filename
curl -s "$URL" | jq . > "$filename"

echo "File saved as $filename"

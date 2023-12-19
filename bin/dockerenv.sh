#!/bin/bash

# Define the input and output file paths
input_file=".env"
output_file=".env.docker"

# Start with an empty output file
> "$output_file"

# Variable to keep track of multi-line config
inside_multiline_config=false

while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip comment lines and lines that are only whitespace or empty
    if [[ $line =~ ^# || $line =~ ^[[:space:]]*$ ]]; then
        continue
    fi

    # Check for the start of the multi-line config
    if [[ $line =~ NUXT_ENV_VIEWS_CONFIG && $line =~ \{ ]]; then
        inside_multiline_config=true
        echo -n "$line" >> "$output_file"
        continue
    fi

    # If inside the multi-line config
    if [[ $inside_multiline_config = true ]]; then
        # Replace multiple spaces with a single space
        line=$(echo $line | tr -s ' ')
        # Append the line without a newline
        echo -n "$line" >> "$output_file"
        # Check for the end of the multi-line config
        if [[ $line =~ \}.*\'$ ]]; then
            inside_multiline_config=false
        fi
    else
        # Write normal lines to the output file
        echo "$line" >> "$output_file"
    fi
done < "$input_file"

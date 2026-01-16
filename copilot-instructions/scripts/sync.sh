#!/bin/bash

# This script synchronizes the documentation files with the latest changes.

# Define the source and destination directories
SOURCE_DIR="../docs"
DEST_DIR="../docs/synced"

# Create the destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Copy the documentation files to the destination directory
cp -r "$SOURCE_DIR/"* "$DEST_DIR/"

# Print a message indicating the synchronization is complete
echo "Documentation files synchronized to $DEST_DIR."
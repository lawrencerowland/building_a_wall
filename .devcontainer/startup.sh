#!/bin/bash
# Startup script to prepare environment when container initializes
set -e

# Ensure Node dependencies are installed
npm install

# Start development server
npm start

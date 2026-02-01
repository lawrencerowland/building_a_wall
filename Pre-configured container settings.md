# Pre-configured Container Settings

You, Codex, are given a pre-configured container with the following settings.

## Code execution
Set up dependencies, lint, and tests.
Learn more

## Container image

universal

universal

## Preinstalled packages

Universal is an image based on Ubuntu 24.04 - see openai/codex-universal to learn more.
The repository will be cloned to /workspace/functors-for_projects. Edit workspace directory.

## Environment variables

Add

## Secrets

Add

## Setup script

```bash
#!/bin/bash
set -euo pipefail

npm install
npm start &  # runs Vite on port 3000

# Wait until the server responds on port 3000
while ! nc -z localhost 3000; do
  echo "Waiting for dev server..."
  sleep 1
done
```

The setup script is run at the start of every task, after the repo is cloned.
Network access is always enabled for this step.

## Agent internet access

### Domain allowlist


Common dependencies

Common dependencies
Domain details

### Additional allowed domains

lawrencerowland.github.io, example.com, github.com, npmjs.org,registry.npmjs.org
Enter domains, separated by commas

### Allowed HTTP Methods

All methods


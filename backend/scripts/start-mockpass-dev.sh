#!/bin/bash

# Start MockPass for CorpPass development simulation
# MockPass will run on http://localhost:5156

echo "Starting MockPass for CorpPass simulation..."
echo "MockPass will be available at http://localhost:5156"
echo ""
echo "CorpPass endpoints:"
echo "  - Authorization: http://localhost:5156/corppass/v2/authorize"
echo "  - Token:         http://localhost:5156/corppass/v2/token"
echo "  - JWKS:          http://localhost:5156/corppass/v2/.well-known/keys"
echo "  - Discovery:     http://localhost:5156/corppass/v2/.well-known/openid-configuration"
echo ""
echo "Client JWKS endpoint (for MockPass to verify our client assertions):"
echo "  - http://localhost:3344/v1/.well-known/jwks.json"
echo ""

# Set PORT explicitly and configure JWKS endpoint for client assertion verification
# SHOW_LOGIN_PAGE=true forces MockPass to show the login form instead of auto-login

# Ensure PORT=5156 is set in the environment and not overridden. This is for local dev use.
export PORT=5156
export SHOW_LOGIN_PAGE=true
export CP_RP_JWKS_ENDPOINT=http://localhost:3344/v1/.well-known/jwks.json

npx mockpass \
  --port 5156 \
  --corppass \
  --verbose


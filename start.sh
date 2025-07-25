#!/bin/bash

# VPS deployment script
echo "Starting Shiogama Timetable API deployment..."

# Install dependencies
echo "Installing dependencies..."
bun install

# Generate Prisma client
echo "Generating Prisma client..."
bun run db:generate

# Setup database
echo "Setting up database..."
bun run db:push

# Seed database if seed.ts exists
if [ -f "seed.ts" ]; then
    echo "Seeding database..."
    bun run db:seed
fi

# Start the server
echo "Starting server..."
bun run start
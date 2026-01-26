FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Copy game build
COPY game_build/ ./game_build/

# Expose port for matchmaker
EXPOSE 3000

# Expose port range for game instances (7000-7100)
EXPOSE 7000-7100

# Start the server
CMD ["npm", "start"]

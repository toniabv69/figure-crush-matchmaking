FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY src/ ./src/
COPY tsconfig.json ./

RUN apk update
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r1/glibc-2.35-r1.apk
RUN apk add --allow-untrusted glibc-2.35-r1.apk
RUN rm glibc-2.35-r1.apk
RUN mkdir /lib64
RUN ln -s /lib/ld-linux-x86-64.so.2 /lib64/ld-linux-x86-64.so.2

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

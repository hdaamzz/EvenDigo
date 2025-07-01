# Use Node.js LTS version
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and lock
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source
COPY . .

# Build TypeScript project
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server from dist
CMD ["node", "dist/server.js"]

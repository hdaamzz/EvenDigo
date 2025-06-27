# Use Node.js LTS version
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose backend port (e.g., 3000 or 5000)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]

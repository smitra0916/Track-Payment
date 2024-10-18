# Use the official Node.js 18 image
FROM node:18

# Create and set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the Node.js app
CMD ["node", "index.js"]

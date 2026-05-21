# WHY: Node.js 18 alpine — alpine is the smallest possible Linux image.
# Perfect for frontend builds.
FROM node:22-alpine

# WHY: Set working directory inside container.
WORKDIR /app

# WHY: Copy package files first for Docker layer caching.
# If package.json didn't change, npm install is skipped on rebuild.
COPY package*.json ./

# WHY: Install all npm packages inside the container.
RUN npm install

# WHY: Copy all frontend source code.
COPY . .

# WHY: Expose port 5173 — Vite dev server default port.
EXPOSE 5173

# WHY: Start Vite dev server.
# --host 0.0.0.0 is critical — without this, Vite only listens
# inside the container and your browser can't reach it.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
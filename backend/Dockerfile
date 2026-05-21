# WHY: This tells Docker which base image to use.
# We pick Python 3.11 slim — slim means smaller size, no extra bloat.
FROM python:3.11-slim

# WHY: Sets the working directory INSIDE the container.
# All commands from here run inside /app folder in the container.
WORKDIR /app

# WHY: Copy requirements.txt FIRST before copying all code.
# Docker caches each step — if requirements didn't change,
# it skips reinstalling packages. Saves time on rebuilds.
COPY requirements.txt .

# WHY: Install all Python packages inside the container.
# --no-cache-dir keeps the image size small.
RUN pip install --no-cache-dir -r requirements.txt

# WHY: Now copy all backend code into the container.
COPY . .

# WHY: Tell Docker this container uses port 5000.
# This is just documentation — actual port mapping is in docker-compose.
EXPOSE 5000

# WHY: This is the command that runs when the container starts.
# It starts the Flask server.
CMD ["python", "run.py"]
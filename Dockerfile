FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Hugging Face Spaces expects the app to listen on port 7860
ENV PORT=7860
EXPOSE 7860

CMD ["npm", "start"]

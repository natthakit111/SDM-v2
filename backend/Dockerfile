FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p uploads/meter-images uploads/payment-slips uploads/contracts uploads/profiles logs
EXPOSE 5000
CMD ["node", "server.js"]

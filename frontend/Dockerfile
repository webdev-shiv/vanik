FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --production=false

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]

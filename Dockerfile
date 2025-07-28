# Dockerfile for Next.js/Node.js app
FROM node:20

WORKDIR /app


    COPY package.json package-lock.json* ./
    RUN npm install --legacy-peer-deps || yarn install --frozen-lockfile
    COPY . .
    RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]

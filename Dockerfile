FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_DATASET_UPLOAD_ENABLED=false
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    NEXT_PUBLIC_DATASET_UPLOAD_ENABLED=${NEXT_PUBLIC_DATASET_UPLOAD_ENABLED}

RUN npm run build && chown -R node:node .next

USER node

EXPOSE 3000

CMD ["npm", "run", "start"]
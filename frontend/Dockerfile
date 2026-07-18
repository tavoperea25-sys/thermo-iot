FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host es necesario para que Vite acepte conexiones desde
# fuera del contenedor (por defecto solo escucha en localhost
# DENTRO del contenedor, lo cual no es alcanzable desde tu PC).

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

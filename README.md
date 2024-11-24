# Keizer Town
This is a metaverse like platform for people to come together interact in a physical-like environment

# Running the project
1. install packages
```bash
cd server
yarn
```

2. add a `.env` according to the `.env.example`

3. add db URL and generate the prisma client
```js
cd http-server/src/db/prisma
// add the DB URL as the environment variable here
npx prisma migrate dev
```
4. Build the entire code
```js
// return to /server
yarn build
yarn execute
```

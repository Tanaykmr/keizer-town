# Keizer Town
This is a virtual platform for people to come together interact in a physical-like environment

# Running the project
1. install packages
```bash
cd server
yarn
```

2. add a `.env` according to the `.env.example`
3. Run your postgres instance on docker
4. add db URL and generate the prisma client
```js
cd http-server/src/db/prisma
// add the DB URL as the environment variable here
npx prisma migrate dev
```
5. Build the entire code
```js
// return to /server
yarn build
yarn execute
```

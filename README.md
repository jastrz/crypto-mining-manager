## Crypto-mining-manager

Simple crypto mining and market trading text web game.

You can check it out here: [link](https://kjast.site/miningsimstart)


## How to run
Navigate to project's directory and type:

```
mkdir db
npm install
mongod --dbpath ./db
node index.js
```

app will be served at: localhost:3000/miningsimstart

## To do
- basically whole game design (add events, adjust devices / buildings / power generators values) to make game playable.
- add endgame constraints.
- possibly rewrite View to use some frontend library.
- move several classes to separate files

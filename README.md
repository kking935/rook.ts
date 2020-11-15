# Rook.io
An online multiplayer game based on the Kentucky-style of the classic southern card game, Rook.
Built with Node.js and Socket.io.

## Installation
```
git clone https://github.com/kking935/Rook.io.git
cd Rook.io
npm install
```

## Running multiplayer server
```
npm start
```

## Rules
I plan to add my own explaination of the rules based on how my family plays the game, but for now you can get a good run-down of the rules [here](https://www.pagat.com/kt5/rook.html)

### Credits
The code for this game was built off code from another project called [Card-Fu](https://github.com/tobloef/card-fu) developed by [@tobloef](https://github.com/tobloef)


# Node Typescript
A base app for developing node servers with typescript
## Development
To start for development:
```
# with npm
npm run dev

# or with yarn
yarn dev
```

During development, write your typescript code in the `app.ts` file.

## Production
To build for production:
```
# with npm
npm run build

# or with yarn
yarn build
```

This will compile the typescript code into javascript and add it to the `dist` folder
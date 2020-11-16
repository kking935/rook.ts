import express, { Application, Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
const app: Application = express();
const chalk = require('chalk');

// This file starts both the Express server, used to serve the
// actual webpage, and the Socket.io server, used to handle
// the realtime connection to the client.

var http = require("http").Server(app);
// var io = require("./libs/game_manager").listen(http);  // Start Socket.io server and let game_manager handle those connections

// Configure dotenv
dotenv.config();

const port = process.env.PORT || 3000;

app.use(express.static("public"));  // Statically serve pages, using directory 'public' as root 

// User connects to server
app.get("/", function(req, res) {
	// Will serve static pages, no need to handle requests
	console.log('new user connected');
});

// If any page not handled already handled (ie. doesn't exists)
app.get("*", function(req, res) {
	res.status(404).send("Error 404 - Page not found");
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
	console.log(chalk.blue(`Go check it out on http://localhost:${port}`));

});

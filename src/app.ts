import express, { Application, Request, Response, NextFunction } from 'express'
import * as dotenv from 'dotenv'
const app: Application = express()
const chalk = require('chalk')

// This file starts both the Express server, used to serve the
// actual webpage, and the Socket.io server, used to handle
// the realtime connection to the client.

const http = require('http').Server(app)
import * as socket from './libs/Socket'
socket.listen(http)  // Start Socket.io server and let game_manager handle those connections

// Configure dotenv
dotenv.config()

const port = process.env.PORT || 3000

app.use(express.static('public'))  // Statically serve pages, using directory 'public' as root 

app.set('port', (port))

// User connects to server
app.get('/', function(req, res) {
	// Will serve static pages, no need to handle requests
	console.log('new user connected')
})

// If any page not handled already handled (ie. doesn't exists)
app.get('*', function(req, res) {
	res.status(404).send('Error 404 - Page not found')
})

http.listen(app.get('port'), () => {
	console.log(`Server running on port ${app.get('port')}`)
	console.log(chalk.blue(`Go check it out on http://localhost:${app.get('port')}`))

})

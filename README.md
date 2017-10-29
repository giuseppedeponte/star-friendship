![Logo of the project](http://star-friendship.herokuapp.com/img/ship.png)

# \*friendship
> \*friendship (pronounced *“star friendship”*) is a PVP / COOP game about friendship and typing on your keyboard as fast as you can.

This game has been developed in 2017 as ad a backend development project for the JavaScript Fullstack course I attended in Paris, and is based on NodeJS, Express, Socket.io and an excerpt from Friendrich Nietzsche's 1882 book *The Gay Science*.

A playable version of this game is available [here](https://star-friendship.herokuapp.com).

## Features

* Type sentences as fast as you can, as soon as they appear
* The fastest player wins the game.
* Punctuation does not count, only letters, numbers and spaces do
* Each round ends once both players have finished typing the whole sentence
* Be the fastest player or the fastest couple to complete the game and enter the \*friendship's Hall of Fame

## Running the game locally

A quick introduction of the minimal setup you need to get the app
running locally.

```shell
~ git clone https://github.com/giuseppedeponte/star-friendship.git
~ cd star-friendship
~ npm install # install all of the project dependencies
~ path/to/your/local/mongodb/folder/mongod # start your local mongodb daemon
~ npm start # start the server, open a browser and go to localhost:3000/
```

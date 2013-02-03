# Marvin

A very depressed home automation system running on an Arduino (not that it asked to 
be)

## Node

The server runs on Node.js. To install the dependencies, run `npm install`, and
then `npm start` to start Marvin.

## Arduino

To upload this code to an Arduino, you need to install the `arduino-mk` package and
run the `make upload` command in this directory.

Commands are sent from the Node.js server to the Arduino in a yet-to-be
determined format.

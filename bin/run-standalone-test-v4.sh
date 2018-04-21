#!/bin/bash
# Ultimatum automatic test run
# Copyright(c) 2018 Stefano Balietti
# MIT Licensed
#
# Run this from inside the ultimatum directory inside nodegame/games/:
#  $ bin/run-standalone-test.sh
#
# Used for testing this package under other packages.
# Returns true if and only if the tests are run successfully.

# Return on failure immediately.
set -e

# Go to the nodegame directory and run the automatic game.
cd ../..
node test/launcher-autoplay.js ultimatum ultimatum-game
cd games/ultimatum-game

npm test

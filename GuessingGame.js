function (context, args) {

    /* by HappyCat >'.'<
    This was just a way of messing around with MongoDB and messing with the basics. This is a simple guessing game.*/

    // The game object based on the revealer design pattern
    var guessingGame = (function(){
        var randomNumber    // The Random number the user will attempt to guess

        // A helper method for generating a random number
        function _getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        /* Check if the user has already made a guess and set the randomNumber to be the same to stop numbers regenerating
        on each guess attempt. If this guess is the user's first attempt or they have solved it previously, then a new entry is added
        to the database with their username and the randomly generated number during their first turn.*/
        function _setRandomNumber() {
            if (_checkIfUserGussed()) {
                var results = #db.f({username:context.caller}).first()
                randomNumber = results.randomNumber
            } else {
                randomNumber = _getRandomInt(0, 10)
                #db.i({
                    username: context.caller,
                    randomNumber: randomNumber
                })
            }
        }

        // The cleanUp method is called once a user has solved game
        function _cleanUp() {
            #db.r({username:context.caller})
        }

        // Checks if a user has played before or is in the middle of playing.
        function _checkIfUserGussed() {
           return (#db.f({username:context.caller}).array().length > 0) ? true : false
        }

        /* Checks the user's guess against the random number and outputs an appropriate message, if the assumption is correct,
        then cleanUp the database and return the congratulations message */
        function matchGuess(guess) {
            if(typeof guess === "number") {
                if (guess > randomNumber) {
                    return "Your guess is too high"
                }
                if (guess < randomNumber) {
                    return "Your guess is too low"
                }
                _cleanUp()
                return "congratulations, your guess was correct!"
            }
            return "Nice try buddy, use a number!"
        }

        _setRandomNumber()

        // only method accessable outside this object.
        return {guess: matchGuess}
    })()

    if (!(args && Object.keys(args).length)) {
        return 'I\'m thinking of a number between (0-10).\nCan you guess what it is?\nplease use `Nguess`:`Vdigit` to check your answer.'
    }
    return guessingGame.guess(args.guess)
}

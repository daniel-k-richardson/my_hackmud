function (context, args) {

    /* by HappyCat >'.'<
    This was just a way of messing around with MongoDB and messing with the basics. This is a simple guessing game.*/

    // The game object based on the revealer design pattern
    var guessingGame = (function(){
        var randomNumber    // The Random number the user will attempt to guess

        // A helper method for generating a random number
        function _getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min
        }

        /* Create a random number and insert the caller's username and the random number into the database. If the user already exists,
        they are in the middle of a game, in which case assign the randomNumber the random number assigned to the user in the database.
        The database is necessary because scripts in the mud are stateless (do not retain values between calls), the database provides 
        the script with a way to check what the random number was when making the first call to the script. Otherwise, the script creates 
        a new random number each call. */
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

        // The cleanUp method is called once a user has solved game and removes the user from the database
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

function (context, args) {
  // First attempt at a t1 cracker
  // This cracks all T1 locks
  // by HappyCat >'.'<

  const LOCKS = {
    // All the t1 locks
    LOCK_TYPES: [
      '`NEZ_21`', '`NEZ_35`', '`NEZ_40`', '`Nc001`', '`Nc002`', '`Nc003`'
    ],
    // all the lock paramters
    PARAMETERS: [
      '`Ndigit`', '`Nez_prime`', '`Ncolor_digit`', '`Nc002_complement`',
      '`Nc003_triad_1`', '`Nc003_triad_2`'
    ],
    // first lock on all EZs
    EZ_PASS: [
      'unlock', 'open', 'release'
    ],
    // primes for ez_prime
    PRIMES: [
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61,
      67, 71, 73, 79, 83, 89, 97
    ],
    // colours for c00s these are used for c002_complement key and the c003's triad 1.2
    // todo: brute forcing complement and triads cause more calls to the scriptor which
    // can slow the script down. Haven't noticed any issues, should make a function for
    // triads to make the script a little more efficient.
    COLOURS: [
      'red', 'orange', 'yellow', 'lime', 'green', 'cyan', 'blue', 'purple'
    ],
    // I found this to be the most reliable way of checking for a successful crack.
    CRACKED: 'Connection terminated.'
  }

  // This takes a string (the response from scriptor) and attempts to match it
  // with a list of locks that have also been passed to the function.
  // If a match is found, the function will extract the lock name, remove colour
  // tags and return just the name of the lock that needs to be cracked.
  //
  // Probably the most important thing to note, filters a string for an excated
  // lock name.
  function getLockType (findLockinString, locksList) {
    let searchStringForLock = findLockinString.replace(/\n/g, ' ').split(' ')
    let resultOfSearch = locksList.filter(x => (searchStringForLock.indexOf(x) > -1))

    if (resultOfSearch) {
      return resultOfSearch.toString().slice(2, -1)
    } else {
      throw new Error('DEBUG 1: Cannot find lock type.')
    }
  }

  // This is a brute force cracker, the target lock is the lock object we want to
  // crack, the passwordList are the passwords we want to run against the lock.
  // The typeOfLockToCrack is the name of this lock (i.e. EZ_something), this is
  // required so that we can add the lock and it's password to the lock for each
  // lock piece until it's open.
  function crack (typeOfLockToCrack, passwordList, targetLock) {
    for (var password in passwordList) {
      targetLock[typeOfLockToCrack] = passwordList[password]

      let resultOfCrackAttempt = args.target.call(targetLock)

      if (resultOfCrackAttempt.match(/(parameter|Connection terminated.|Denied access)/)) {
        return resultOfCrackAttempt
      }
    }
    // Useful info if the lock hasn't been cracked.
    throw new Error(`DEBUG 2: can't crack that one mang. ` +
      `LockType: ${typeOfLockToCrack} ` +
      `password list: ${passwordList}.`)
  }

  // Controls the logic, checks the status of the lock and calls the crack method
  // with the approprate arugements so that it can be solved one piece at a time
  // until 'Connection terminated.' has been found.
  function logicController () {
    // initialization
    let lockToCrack = {}
    let isCracking = true

    // Attempt the first lock after the initial scriptor call.
    let typeOfLockToCrack = getLockType(args.target.call({}), LOCKS.LOCK_TYPES)
    let passwordList = (typeOfLockToCrack.indexOf('c00') > -1) ? LOCKS.COLOURS : LOCKS.EZ_PASS
    let response = crack(typeOfLockToCrack, passwordList, lockToCrack)

    // we want the loop to run at least once and until isCracking is no longer true.
    do {
       // terminating case
      if (response.indexOf(LOCKS.CRACKED) > -1) {
        isCracking = false
      }

      // if parameter has been found in response, now find out which one, strip
      // any colour tags and recall the crack function with the correct passwordList
      if (response.indexOf('parameter') > -1) {
        typeOfLockToCrack = getLockType(response, LOCKS.PARAMETERS)

        // This is a nicer way to doing a switch or lots of if condictions.
        let cases = {
          digit: [...Array(10).keys()],
          color_digit: [lockToCrack.c001 ? lockToCrack.c001.length : 0],
          ez_prime: LOCKS.PRIMES,
          c002_complement: [LOCKS.COLOURS[(LOCKS.COLOURS.indexOf(lockToCrack.c002) + 4) % 8]],
          c003_triad_1: [LOCKS.COLOURS[(LOCKS.COLOURS.indexOf(lockToCrack.c003) + 5) % 8]],
          c003_triad_2: [LOCKS.COLOURS[(LOCKS.COLOURS.indexOf(lockToCrack.c003) + 3) % 8]]
        }

        // set the passwordList based on above object/switch
        passwordList = cases[typeOfLockToCrack]
        response = crack(typeOfLockToCrack, passwordList, lockToCrack)

      // if it isn't parameter then it must be another lock type.
      } else {
        typeOfLockToCrack = getLockType(response, LOCKS.LOCK_TYPES)
        passwordList = (typeOfLockToCrack.indexOf('EZ_') > -1) ? LOCKS.EZ_PASS : LOCKS.COLOURS
        response = crack(typeOfLockToCrack, passwordList, lockToCrack)
      }
    } while (isCracking)

    // and we're done!
    return response
  }
  return logicController()
}

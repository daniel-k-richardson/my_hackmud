function (context, args) {
  // First attempt at a t1 cracker
  // EZ_ 21, 35, 40 (will include c00 1-3 later)
  // by HappyCat >'.'<

  // the names of all T1 locks
  const LOCK_LIST = ['`NEZ_21`', '`NEZ_35`', '`NEZ_40`', '`Nc001`', '`Nc002`', '`Nc003`']

  // Each t1 lock has a list of paramters that might also need cracking.
  const PARAMETERS = ['`Ndigit`', '`Nez_prime`', '`Ncolor_digit`', '`Nc002_complement`', '`Nc003_triad_1`', '`Nc003_triad_2`']

  // unlock keys for all locks and parameters
  const EZ_DICT = ['unlock', 'open', 'release']
  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
  const COLOURS = ['red', 'blue', 'green', 'orange', 'yellow', 'cyan', 'purple', 'lime']

  // Most reliable way to check lock has been cracked when multiple locks
  const CRACKED = 'Connection terminated.'

  // This gets the name of the lock we are attempting to crack. The way it works is simple.
  // you call the function passing in the response from calling the lock and a list of locks you
  // want to compare against. The response string is formatted and split into an array.
  // This is so that we can find the intersection of what is in the response and the list of
  // locks. Each response will only have one lock to find so |response intersect lock_list| = 1.
  // We then convert the returned item into a string and remove the special chars `N ` from it.
  // response: is passed in and is the response of target.call().

  // lock: is a list of locks.

  //  Returns: string containing the lock name.
  function getLockType (response, lock) {
    let search = response.replace(/\n/g, ' ').split(' ')
    let intersection = lock.filter(x => (search.indexOf(x) > -1))

    if (intersection) {
      return intersection.toString().slice(2, -1)
    } else {
      throw new Error('DEBUG 1: Cannot find lock type.')
    }
  }

 // This cracks the lock for us. we pass it the lock type to crack (i.e EZ_21 etc.),
 // a dictionary of keys to open the lock and the lockObj so that as we solve the lock the
 // lock type and the answer to that lock can be stored on the lockObj itself (probably the
 // most important aspect of cracking locks containing multiple locks.

 // locktype: the name of the lock we it to crack (could be any lock).
 // dict: the keys to run against the lock in order to crack it.
 // lockObj: the actual lock being cracked, containing all the key pairs {locktype : key } so
 // that it can be called with target.call(locktype);

 // returns: the result after crack otherwise an error.
  function crack (locktype, dict, lockObj) {
    for (var key in dict) {
      lockObj[locktype] = dict[key]

      let response = args.target.call(lockObj)
      if (response.match(/(parameter|Connection terminated.|Denied access)/)) {
        return response
      }
    }
    throw new Error(`DEBUG 2: can't crack that one mang. ${locktype}`)
  }

  // Controls the logic, checks that there are no more locks/parameters to the lock, in either
  // case continues to direct the lock object to the correct method to continue solving the
  // lock until 'Connection terminated.' has been found.
  function logicController () {
    // initialization
    let lockToCrack = {}
    let isCracking = true

    let locktype = getLockType(args.target.call({}), LOCK_LIST)
    let dictAttack = (locktype.indexOf('c00') > -1) ? COLOURS : EZ_DICT
    let response = crack(locktype, dictAttack, lockToCrack)

    // we want the loop to run at least once and until isCracking is no longer true.
    do {
       // terminating case
      if (response.indexOf(CRACKED) > -1) {
        isCracking = false
      }

      // if parameter it could only be digit or ez_prime
      if (response.indexOf('parameter') > -1) {
        locktype = getLockType(response, PARAMETERS)

        if (locktype.match(/(digit)/)) {
          dictAttack = [...Array(10).keys()]
        } else if (locktype.match(/(digit_color)/)) {
          dictAttack = [3, 4, 5, 6]
        } else if (locktype.match(/(ez_prime)/)) {
          dictAttack = PRIMES
        } else {
          dictAttack = COLOURS
        }
        response = crack(locktype, dictAttack, lockToCrack)

      // if it isn't parameter then it must be another lock type.
      } else {
        locktype = getLockType(args.target.call(lockToCrack), LOCK_LIST)

        if (locktype.indexOf('EZ_') > -1) {
          dictAttack = EZ_DICT
        } else {
          dictAttack = COLOURS
        }

        response = crack(locktype, dictAttack, lockToCrack)
      }
    } while (isCracking)

    return Date.now() - _START
  }
  return logicController()
}

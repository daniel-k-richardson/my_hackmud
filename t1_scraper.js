function (context, args) {
  // This handles the formating of the string before we go ahead and attempt to
  // use the regex on.
  function stringFormat (stringToFormat) {
    return stringToFormat.toString().replace(/\n/g, ' ')
  }

  // This searches through a list of words that match our regex
  function search (regex, response) {
    let matches = regex.exec(response)
    let resultsOfMatch = []

    // regex only returns a single match unless you keep calling it. the while
    // loop is to keep calling until the end of the match is found. All these
    // are put into an array that can be retrieved later.
    while (matches) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (matches.index === regex.lastIndex) {
        regex.lastIndex++
      }
      // it just so happens a single name can be mentioned twice in both regex
      // mattern matching, therefore the or works ok (but it isn't perfect).
      resultsOfMatch.push(matches[1] || matches[2])
      matches = regex.exec(response)
    }
    // an array based on regex match patterns
    return [...new Set(resultsOfMatch)]
  }

  function logicController () {
    let page = {}

    // get the page names
    let response = stringFormat(args.target.call())
    let sitePages = search(/\s([A-Za-z_]+)\s\|/g, response)
    // get the name of the nav
    response = stringFormat(args.target.call({}))
    let siteNav = search(/\s([A-Za-z_]+):/g, response)
    // call scripter with nav + site page, i.e. {nav:"info"}
    page[siteNav] = sitePages[0]

    // get the wall of text from page name and extract all usernames.
    response = stringFormat(args.target.call(page))
    let usernames = search(/([A-Za-z0-9_-]+)\sof\sproject|-{2}\s([A-Za-z_]+)\s/g, response)
    // gets names of projects
    let projects = search(/continues\son\s([A-Za-z0-9_()]+)|on\s([A-Za-z0-9_()]+)\sprogress/g, response)
    // get staff from page
    let staff = search(/\s([A-Za-z]+)\s@/g, response)

    page[siteNav] = sitePages[1]
    response = stringFormat(args.target.call(page))
    // strategy thenumberone
    let password = search(/strategy\s([A-Za-z0-9_-]+)\s/g, response)

    return [
      ['`Nusernames`', usernames],
      ['`Nprojects`', projects],
      ['`Nstaff`', staff],
      ['`Npassword`', password]]
  }
  if (!(args && Object.keys(args).length)) {
    return 'You did not enter any arugements, please use  {`Ntarget`:`V#s.<script name>`} and try again.'
  }

  return logicController()
}

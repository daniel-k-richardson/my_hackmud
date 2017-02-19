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
    let i = 0

    // regex only returns a single match unless you keep calling it. the while
    // loop is to keep calling until the end of the match is found. All these
    // are put into an array that can be retrieved later.
    while (matches) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (matches.index === regex.lastIndex) {
        regex.lastIndex++
      }

      resultsOfMatch.push(matches[1] || matches[2])
      matches = regex.exec(response)
    }
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

    // name of nav + name of page {nav:"info"}
    page[siteNav] = sitePages[0]

    // get the wall of text from page name
    response = stringFormat(args.target.call(page))

    // -- troy_cole
    // madthugpug of project
    let usernames = search(/([A-Za-z0-9_-]+)\s\of\s\project|-{2}\s([A-Za-z_]+)\s/g, response)

    return usernames
  }
  return logicController()
}

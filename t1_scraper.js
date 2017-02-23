function (context, args) {

  // helper for formatting and searching response from scripter
  const helper = (function () {
    // anything in return is accessable outside.
    return {
      // find all regex matches and remove dupes
      searchText (regex, text) {
        let resultsOfMatch = []
        let matches = regex.exec(text)

        while (matches) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (matches.index === regex.lastIndex) {
            regex.lastIndex++
          }
          resultsOfMatch.push(matches[1] || matches[2])
          matches = regex.exec(text)
        }
        return [...new Set(resultsOfMatch)]
      },

      // used to get rid of all new lines for searching.
      stringFormater (text) {
        return text.toString().replace(/\n/g, ' ')
      }
    }
  }())

  // noticed all my methods were calling heler.stringFormater and searchText
  // created this adapter to reduce redundancy.
  const helperAdapter = (function () {
    return {
      formatSearch (regex, text) {
        return helper.searchText(regex, helper.stringFormater(text))
      }
    }
  }())

  // the corp script to scrape
  const corp = (function () {
    let page = {}
    const scripter = args.target
    // -- these are run automatically when the script runs to get basic info --//
    const directories = (function () {
      return helperAdapter.formatSearch(/\s([A-Za-z_]+)\s\|/g, scripter.call())
    }())

    const navigation = (function () {
      return helperAdapter.formatSearch(/\s([A-Za-z_]+):/g, scripter.call(page))
    }())

    // callable functions for external use
    return {
      getContent (pageNumber) {
        page[navigation] = directories[pageNumber]

        return helper.stringFormater(scripter.call(page))
      }
    }
  }())

  const scraper = (function () {
    let usernames = []
    let projects = []
    let staff = []
    let password

    // don't want to fill all these by default because it might not be necessary
    // if all we want is a perticalar list of values.
    return {
      getUsernames () {
        const content = corp.getContent(0)
        usernames = helperAdapter.formatSearch(/([A-Za-z0-9_-]+)\sof\sproject|-{2}\s([A-Za-z_]+)\s/g, content)

        return usernames
      },

      getProjects () {
        const content = corp.getContent(0)
        projects = helperAdapter.formatSearch(/continues\son\s([A-Za-z0-9_()]+)|on\s([A-Za-z0-9_()]+)\sprogress/g, content)

        return projects
      },

      getStaff () {
        const content = corp.getContent(0)
        staff = helperAdapter.formatSearch(/\s([A-Za-z]+)\s@/g, content)

        return staff
      },

      getPasswords () {
        do {
          let content = corp.getContent(1)
          password = helperAdapter.formatSearch(/strategy\s([A-Za-z0-9_-]+)\s/g, content)
        } while (!password)

        return password
      }
    }
  }())

  // this just returns everything for now while i'm working on it.
  return [
    ['`Nusernames`', scraper.getUsernames()],
    ['`Nprojects`', scraper.getProjects()],
    ['`Nstaff`', scraper.getStaff()],
    ['`Npassword`', scraper.getPasswords()]
  ]

}

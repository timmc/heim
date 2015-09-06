var hueHash = require('./hue-hash')

/**
 * Determines if nick contains the characters in the partial nick, in order.
 */
module.exports.containsSubseq = function(nick, part) {
  var offset = 0
  var remain = part
  var nexdex
  while (remain !== "") {
    nexdex = nick.indexOf(remain.substr(0, 1), offset)
    if (nexdex < 0) {
      return false
    }
    offset = nexdex + 1
    remain = remain.substr(1)
  }
  return true
}

/**
 * From a nick and a partial produce a score. A score of
 * zero indicates "no match whatsoever", all other scores
 * are positive.
 */
module.exports.scoreMatch = function(nick, part) {
  // FIXME Use proper Unicode-aware case-folding, if not already
  var part_cf = part.toLowerCase()
  var nick_cf = nick.toLowerCase()
  // Check prefixes, then infixes, then subsequences -- and for
  // each, try case-sensitive and then insensitive.
  if (nick.startsWith(part))
    return 7
  else if (nick_cf.startsWith(part_cf))
    return 6
  else if (nick.contains(part))
    return 5
  else if (nick_cf.contains(part_cf))
    return 4
  else if (module.exports.containsSubseq(nick, part))
    return 3
  else if (module.exports.containsSubseq(nick_cf, part_cf))
    return 2
  else
    return 0
}

/**
 * Given a seq of usernames and a partial nick, yield sorted
 * seq of stripped usernames by match relevancy (best first).
 */
module.exports.rankCompletions = function(nicks, part) {
  var partStrip = hueHash.stripSpaces(part)
  return nicks
    .map(hueHash.stripSpaces)
    .filter(Boolean)
    .map(name => [name, module.exports.scoreMatch(name, partStrip)])
    .filter(entry => entry[1] > 0)
    .sort(function(a, b) {
      return b[1] - a[1]
    })
    .map(entry => entry[0])
}

var _ = require("lodash")

// liftn: ([a' ->]* -> c') -> (a' -> b') -> ([b' ->]* -> c')
// Pointwise lifting of all arguments given to f, using the lift function
var liftn = function(f, lift) {
  return function() {
    return f.apply(this, _.map(arguments, lift))
  }
}

// a' -> a'? -> a'
// Coalesce a possible-falsey value into value or a default value
var coalesce = function(whenNull) {
  whenNull = whenNull || 0
  return function(value) {
    return value || whenNull
  }
}

// f -> a' -> f
// Takes a function that can throw exceptions, and turn it into a function that
// just returns a default-value if an exeception was thrown.
var catcher = function(f, whenException) {
  whenException = whenException || false
  return function() {
    try {
      return f.apply(this, arguments)
    } catch (e) {
      return whenException
    }
  }
}

module.exports = {
  liftn: liftn,
  coalesce: coalesce,
  catcher: catcher
}

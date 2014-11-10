var _ = require("lodash")
  , utils = require("./utils")

// ensureG_Counter: G_Counter or JS rep. -> G_Counter (throws TypeError)
var ensureG_Counter = function(value) {
  if (value.type) value = G_Counter_Public.fromJS(value)
  if (!(value instanceof G_Counter))
     throw new TypeError('Given object is not a G-Counter')
  return value
}

// guard: f -> f', where f' has all arguments pointwise lifted to a G_Counter
// and throws exceptions when arguments aren't G_Counters or JS representation
var guard = _.partialRight(utils.liftn, ensureG_Counter)

// falsey_guard: f -> f' where f has all arguments pointwise lifted to a 
// G_Counter but will return false when arguments aren't G_Counters or JS rep.
var falsey_guard = _.compose(utils.catcher, guard)

var G_Counter = function(obj, id) {
  var payload = obj || {}
  var id = id || Math.random().toString(36).substring(2)

  // this -> G_Counter JS rep.
  this.toJS = function() {
    return { type: 'g-counter', e: _.clone(payload) }
  }

  // this -> nat
  this.value = function() {
    return _.reduce(payload, function(acc, num) { return acc + num }, 0)
  }

  // this -> G_Counter -> G_Counter
  this.merge = guard(function(Y) {
    var new_payload = _.merge(
      _.clone(payload), // merge modifies the first arg, so clone our payload
      Y.toJS().e, // and get the payload of the other G_Counter
      utils.liftn(Math.max, utils.coalesce(0)) // merge using max
    )
    if (_.isEqual(payload, new_payload)) return this
    else return new G_Counter(new_payload, id)
  })
  
  // this -> G_Counter
  this.increment = function() {
    var new_payload = _.clone(payload)
    if (new_payload[id] === undefined) new_payload[id] = 1
    else new_payload[id] = new_payload[id] + 1
    return new G_Counter(new_payload, id)
  }
}

// () -> G_Counter
var G_Counter_Public = function() {
  return new G_Counter()
}

// G_Counter JS rep. -> G_Counter (throws TypeError)
G_Counter_Public.fromJS = function(obj) {
  if (!_.isPlainObject(obj) || obj.type !== 'g-counter' || !_.isPlainObject(obj.e))
    throw new TypeError('Given object is not a G-Counter')
  return new G_Counter(obj.e)
}

// G_Counter -> G_Counter -> G_Counter
G_Counter_Public.merge = guard(function(X, Y) {
  return X.merge(Y)
})

// G_Counter -> G_Counter -> bool
G_Counter_Public.compare = guard(function(X, Y) {
  return G_Counter_Public.merge(Y, X) === Y 
})

// G_Counter -> nat
G_Counter_Public.value = guard(function(X) {
  return X.value()
})

// G_Counter -> G_Counter
G_Counter_Public.increment = guard(function(X) {
  return X.increment()
})

// G_Counter -> bool
// G_Counter -> G_Counter -> bool
G_Counter_Public.is = falsey_guard(function(X, Y) {
  if (Y === undefined) return true
  else return _.isEqual(X.toJS(), Y.toJS())
})

module.exports = G_Counter_Public
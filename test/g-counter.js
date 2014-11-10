var G_Counter = require("../lib/g-counter")
  , jsc = require("jsverify")
  , env = require("./jsverify-env")
  , assert = require("assert")
  , _ = require("lodash")

describe('G_Counter', function() {
  it('starts out with a value of 0', function() {
    var X = new G_Counter()
    assert.equal(X.value(), 0, 'Initial value wasnt 0')
  })
  it('increases its value with 1 on increment()', function() {
    var property = jsc.forall('g_counter', env, function(X) {
      return X.value() + 1 == X.increment().value()
    })
    jsc.assert(property)
  })
  it('increments the same member of the payload when doing two increments', function() {
    var X = new G_Counter()
      , Xprime = X.increment().increment()
      , payload = Xprime.toJS().e
      , keys = Object.keys(payload)
    assert.equal(keys.length, 1, 'Payload contained more than one key')
    assert.equal(payload[keys[0]], 2, 'Value of payload wasnt incremented twice')
  })
  it('increases its value when merged', function() {
    var property = jsc.forall('g_counter', 'g_counter', env, function(X, Y) {
      return X.value() <= X.merge(Y).value()
          && Y.value() <= X.merge(Y).value()
          && X.merge(Y).value() <= X.value() + Y.value()
    })
    jsc.assert(property)
  })
  it('still equals itself after merging in an empty G_Counter', function() {
    var property = jsc.forall('g_counter', env, function(X) {
      return X === X.merge(new G_Counter())
    })
    jsc.assert(property)
  })
  it('still equals itself after merging in a smaller G_Counter', function() {
    var property = jsc.forall('g_counter', 'g_counter', env, function(X, Y) {
      if (G_Counter.compare(X, Y) /* X <= Y */) return Y === Y.merge(X)
      else return Y !== Y.merge(X)
    })
    jsc.assert(property)
  })
  it('equivalent to itself', function() {
    var property = jsc.forall('g_counter', env, function(X) {
      return G_Counter.is(X, X)
    })
    jsc.assert(property)
  })
  it('when diverged by incrementing still has equivalence', function() {
    var property = jsc.forall('g_counter', env, function(X) {
      return G_Counter.is(X.increment(), X.increment())
    })
    jsc.assert(property)
  })
  it('can only be constructed from the correct json', function() {
    var property = jsc.forall(jsc.suchthat('json', function(x) {
      return !_.isPlainObject(x) && x.type !== 'g-counter' && !_.isPlainObject(x)
    }), function(x) {
      try {
        var X = G_Counter.fromJS(x)
        return false
      } catch (e) {
        return true
      }
    })
    jsc.assert(property)
    
    var valid = {type: 'g-counter', e: {a: 17, b: 25}}
    assert.doesNotThrow(function() {
      var X = G_Counter.fromJS(valid)
      assert.ok(G_Counter.is(X))
      assert.equal(X.value(), 42)
    })
  })
})
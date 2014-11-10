var jsc = require("jsverify")
  , _ = require("lodash")
  , G_Counter = require("../lib/g-counter")

var set = function (arb) {
  var arrayArb = jsc.array(arb);
  return {
    generator: arrayArb.generator.map(_.uniq),
    shrink: arrayArb.shrink.isomap(_.uniq, _.identity),
    show: arrayArb.show
  }
}

function fromArray(arrayOfPairs) {
  var res = {};
  arrayOfPairs.forEach(function (p) {
    if (p[0] !== '') res[p[0]] = p[1];
  });
  return G_Counter.fromJS({type: 'g-counter', e: res})
}

function toArray(m) {
  var res = [];
  var m_obj = m.toJS()
  Object.keys(m_obj.e).forEach(function (k) {
    res.push([k, m_obj.e[k]]);
  });
  return res;
}

var g_counter = function(maxsize) {
  var natArbitrary = jsc.nat(maxsize)
    , pairArbitrary = jsc.pair(jsc.asciichar, natArbitrary)
    , arrayArbitrary = jsc.array(pairArbitrary)

  return {
    generator: arrayArbitrary.generator.map(fromArray),
    shrink: arrayArbitrary.shrink.isomap(fromArray, toArray),
    show: function (m) {
      var m_payload = m.toJS().e
      return "{" + Object.keys(m_payload).map(function (k) {
        return k + ": " + natArbitrary.show(m_payload[k]);
      }).join(", ") + "}";
    }
  }
}


module.exports = {
  'set': set,
  'g_counter': g_counter
}

if (describe) {
  describe("The extra JSVerify generator", function() {
    describe("G-Counter", function() {
      it("produces instances of G_Counter", function() {
        jsc.assert(jsc.forall('g_counter', module.exports, function(X) {
          return G_Counter.is(X)
        }))
      })
    })
  })
}

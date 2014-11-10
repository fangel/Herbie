/* global describe:true, it:true */
"use strict";

var jsc = require("jsverify")
  , _ = require("lodash") 
  , env = require("./jsverify-env")
  
var G_Counter = require("../lib/g-counter")

// `A -> (A -> A -> A) -> (A -> A -> bool) -> property
function GreatestLowerBound(A, meet, eq) {
  if (eq === undefined) eq = function(x, y) { return x === y }
  var partialOrder = function(x, y) { return eq(meet(x, y), x) }

  return jsc.forall(A, A, A, env, function(x, y, w) {
    var z = meet(x, y)
    // z ≤ x ∧ z ≤ y ∧ (w ≤ x ∧ w ≤ y → w ≤ z)
    // z ≤ x ∧ z ≤ y ∧ (¬(w ≤ x ∧ w ≤ y) ∨ w ≤ z)
    return (partialOrder(z, x) && partialOrder(z, y))
        && (!(partialOrder(w, x) && partialOrder(w, y)) 
            || partialOrder(w, z))
  })
}
// `A ->  (A -> A -> A) -> (A -> A -> bool) -> property
function LeastUpperBound(A, join, eq) {
  if (eq === undefined) eq = function(x, y) { return x === y }
  var partialOrder = function(x, y) { return eq(join(x, y), y) }

  return jsc.forall(A, A, A, env, function(x, y, w) {
    var z = join(x, y)
    // x ≤ z ∧ y ≤ z ∧ (x ≤ w ∧ y ≤ w → z ≤ w)
    // x ≤ z ∧ y ≤ z ∧ (¬(x ≤ w ∧ y ≤ w) ∨ z ≤ w)
    return (partialOrder(x, z) && partialOrder(y, z))
        && (!(partialOrder(x, w) && partialOrder(y, w))
            || partialOrder(z, w))
  })
}

// `A -> (A -> A -> A) -> (A -> A -> bool) -> property
function commutative(A, f, eq) {
  if (eq === undefined) eq = function(x, y) { return x === y }
  return jsc.forall(A, A, env, function(x, y) {
    return eq(f(x, y), f(y, x))
  })
}

// `A -> (A -> A -> A) -> (A -> A -> bool) -> property
function associativity(A, f, eq) {
  if (eq === undefined) eq = function(x, y) { return x === y }
  return jsc.forall(A, A, A, env, function(x, y, z) {
    return eq(f(x, f(y, z)), f(f(x, y), z))
  })
}

// `A -> (A -> A -> A) -> (A -> A -> bool) -> property
function idempotent(A, f, eq) {
  if (eq === undefined) eq = function(x, y) { return x === y }
  return jsc.forall(A, env, function(x) {
    return eq(f(x, x), x)
  })
}

describe("Data structures are Semi-Lattices", function() {
  describe("natural numbers", function () {
    describe("has max() as a join", function () {
      it("because max is commutative", function() {
        jsc.assert(commutative("nat", Math.max))
      })
      it("because max is associative", function() {
        jsc.assert(associativity("nat", Math.max))
      })
      it("because max is idempotent", function() {
        jsc.assert(idempotent("nat", Math.max))
      })
      it("and thus we have that max() it a LUB and nats are a join semi-lattice", function() {
        jsc.assert(LeastUpperBound("nat", Math.max))
      })
    })
    describe("has min() as a meet", function () {
      it("because min is commutative", function() {
        jsc.assert(commutative("nat", Math.min))
      })
      it("because min is associative", function() {
        jsc.assert(associativity("nat", Math.min))
      })
      it("because min is idempotent", function() {
        jsc.assert(idempotent("nat", Math.min))
      })
      it("and thus we have that min() it a GLB and nats are a meet semi-lattice", function() {
        jsc.assert(GreatestLowerBound("nat", Math.min))
      })
    })
  })

  describe("sets", function() {
    describe("has union as a join", function() {
      var eq = function(x, y) {
        return x.length === y.length && _.intersection(x, y).length == x.length
      }
      it("because union is commutative", function() {
        jsc.assert(commutative("set nat", _.union, eq))
      })
      it("because union is associative", function() {
        jsc.assert(associativity("set nat", _.union, eq))
      })
      it("because union is idempotent", function() {
        jsc.assert(idempotent("set nat", _.union, eq))
      })
      it("and thus we have that union it a LUB and sets are a join semi-lattice", function() {
        jsc.assert(LeastUpperBound("set nat", _.union, eq))
      })
    })
    describe("has intersect as a meet", function() {
      var eq = function(x, y) {
        return x.length === y.length && _.intersection(x, y).length == x.length
      }
      it("because intersect is commutative", function() {
        jsc.assert(commutative("set nat", _.intersection, eq))
      })
      it("because intersect is associative", function() {
        jsc.assert(associativity("set nat", _.intersection, eq))
      })
      it("because intersect is idempotent", function() {
        jsc.assert(idempotent("set nat", _.intersection, eq))
      })
      it("and thus we have that intersect it a GLB and sets are a meet semi-lattice", function() {
        jsc.assert(GreatestLowerBound("set nat", _.intersection, eq))
      })
    })
  })

  describe("G-Counters", function() {
    describe("has G_Counter.merge as a join", function() {
      it("because G_Counter.merge is commutative", function() {
        jsc.assert(commutative("g_counter", G_Counter.merge, G_Counter.is))
      })
      it("because G_Counter.merge is associative", function() {
        jsc.assert(associativity("g_counter", G_Counter.merge, G_Counter.is))
      })
      it("because G_Counter.merge is idempotent", function() {
        jsc.assert(idempotent("g_counter", G_Counter.merge, G_Counter.is))
      })
      it("and thus we have that G_Counter.merge is a GLB and G-Counters are a join semi-lattice", function() {
        jsc.assert(GreatestLowerBound("g_counter", G_Counter.merge, G_Counter.is))
      })    
    })
  })
})
# Herbie

<img src="https://raw.githubusercontent.com/fangel/herbie/master/herbie.png" align="right" height="100" />

> A JavaScript CRDT library compatible with [Aphyrs](http://http://aphyr.com)
> [Mean Girls](https://github.com/aphyr/meangirls)

[![Build Status](https://api.travis-ci.org/fangel/Herbie.svg?branch=master)](https://travis-ci.org/fangel/Herbie)

## Introduction

CRDT -- Conflict-free Replicated Data Types -- are a special class of data types
that are constructed in a way such that multiple replicas of the same data type
can always be merged to the same result.

There is basically two types or CRDTs: Either commutative or converging. 
Commutative -- sometimes calles ops-based -- which are based on commutative 
functions for modifying the data types. Having commutativity allows the
operations to be applied in different order at the different replicas.  
Converging -- or state-based -- CRDTs instead transfer the entire state of the
data type which are then merged with the other replicas. The merge function
needs to be a Least-Upper-Bound (or join) that is defined on all instances of
data type (making the data-type a Join Semilattice).

Herbie is a library for constructing Converging CRDTs. The data types serialize
to the same JSON format as [Mean Girls](https://github.com/aphyr/meangirls),
which means you could use Mean Girls on the Server-side and Herbie in the
browser (although that haven't been tested. Yet).

## Getting started

When the library matures it will be published to NPM. Until then, you'll have
to download the Git repository.

## Documentation

Herbie implements various different converging CRDTs, which are outlined in the
next section. Common for all of the data types is that they all have these
static methods:

- `Herbie.Type.fromJS(rep)` which converts the JSON representation of a data
    type into a instance of a Herbie CRDT.
- `Herbie.Type.compare(X, Y)` is the partial order relation of the CRDT -- so
    it represents `X <= Y`. Returns true if X is a subset of Y.
- `Herbie.Type.is(X)` which is a *instanceof* check to see if X is a CRDT of
    that type.
- `Herbie.Type.is(X, Y)` which is the equivalence relation of the CRDT. Returns
    true if `X` and `Y` represents the same CRDT.

Each instance of a CRDT also have the following methods:

- `instance.value()` which will give you the value that the CRDT holds
- `instance.toJS()` which will give you the JSON representation of the CRDT
- `instance.merge(other)` which will return a CRDT that is the result of merging
    the CRDT instance with another replica of the CRDT

Also common for of the data types is that they are immutable. That is, modifying
a CRDT instance will not modify the CRDT but instead return a new CRDT that
represents the modified CRDT. This allows you to use equality-checks to see if
an operation modified the CRDT, e.g. 
`instance === instance.merge(new Herbie.Type)`. As long as the replica you
merge with is smaller than your instance calling `merge` will return itself,


## Data Types

Currently, the following CRDTs are implemented:

### G-Counter

    var Herbie = require("herbie")
      , cnt = new Herbie.G_Counter()
    
    cnt.increase().increase().value()
    



/**
 * utility functions
 */

var crypto = require('crypto');
var _ = require('lodash');

// Padding number function
function pad(num, size) {
  var s = num + '';

  while (s.length < size) {
    s = '0' + s;
  }

  return s;
}

// Make a hash
function makeHash(first) {
  var now = (new Date()).valueOf().toString();
  var random = Math.random().toString();
  var hash = crypto.createHash('sha1').update(now + random).digest('hex');
  return (first) ? _.take(hash, first).join('') : hash;
}

// To UTC
function toUTC(date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}

module.exports = {
  pad: pad,
  makeHash: makeHash,
  toUTC: toUTC
};

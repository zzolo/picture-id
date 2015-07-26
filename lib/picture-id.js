#! /usr/bin/env node

/**
 * Main file for picture-id.  This creates a function that can
 * be used in a script, though our main use case is with
 * the command line.
 */
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var crypto = require('crypto');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var tilde = require('tilde-expansion');

// Defaults
var defaults = {
  db: '~/.picture-id.db',
  directory: '~/Pictures/picture-id',
  filename: 'picture-id-{{YYYY}}{{MM}}{{DD}}-{{SSID}}.png',
  warmup: 3,
  force: false,
  ssidCommand: '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/A/Resources/airport -I | grep \' SSID\' | cut -d \':\' -f 2'
};

/**
 * Main function.
 *
 * Options:
 */
function pictureID(options) {
  // Get options
  options = _.defaults(options, defaults);

  // Check paths
  pathChecks(options, function(options) {
    // Get current SSID
    var currentSSID;
    if (fs.existsSync(options.db)) {
      currentSSID = fs.readFileSync(options.db, { encoding: 'utf-8' }).trim();
    }

    // Get date
    var now = new Date();

    // Make file name
    var file = path.join(options.directory, options.filename);

    // Get SSID
    exec(options.ssidCommand, function(error, stdout, stderr) {
      if (error || stderr) {
        console.error(error || stderr);
        process.exit(1);
      }

      // Get SSID
      var newSSID = stdout.trim();
      if (!newSSID) {
        console.error('No SSID found.');
        process.exit(1);
      }

      // See if no need to snap
      if (!options.force && currentSSID && currentSSID.toLowerCase() === newSSID.toLowerCase()) {
        process.exit(0);
      }

      // Format file name
      file = file
        .replace(/\{\{YYYY\}\}/gi, pad(now.getFullYear(), 4))
        .replace(/\{\{MM\}\}/gi, pad(now.getMonth() + 1, 2))
        .replace(/\{\{DD\}\}/gi, pad(now.getDate(), 2))
        .replace(/\{\{HH\}\}/gi, pad(now.getHours(), 2))
        .replace(/\{\{II\}\}/gi, pad(now.getMinutes(), 2))
        .replace(/\{\{SS\}\}/gi, pad(now.getSeconds(), 2))
        .replace(/\{\{SSID\}\}/gi, newSSID);

      // Make sure it is valid
      file = file
        .replace(/[^\w\-~_\.\/]/gi, '-');

      // Check for existing image
      if (fs.existsSync(file)) {
        file = _.initial(file.split('.')).join('.') + '-' + makeHash(10) + '.' + _.last(file.split('.'));
      }

      // Snap image
      var snap = 'imagesnap -w ' + options.warmup + ' ' + file;
      exec(snap, function(error, stdout, stderr) {
        if (error || stderr) {
          console.error(error || stderr);
          process.exit(1);
        }

        // Save new SSID
        fs.writeFileSync(options.db, newSSID);
        process.exit(0);
      });
    });
  });
}

// Add defaults to main function
pictureID.defaults = defaults;

// Ensure files and paths are good
function pathChecks(options, done) {
  // Resolve paths
  tilde(options.directory, function(d) {
    options.directory = d;

    tilde(options.db, function(d) {
      options.db = d;

      // Make sure image directory is there
      mkdirp.sync(options.directory);

      // Make sure DB directory is there
      mkdirp.sync(path.dirname(options.db));

      done(options);
    });
  });
}

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

// Exports
module.exports = pictureID;

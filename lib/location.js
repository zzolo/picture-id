/**
 * Get and add location data for an image.
 */

var piexif = require('piexifjs');
var fs = require('fs');
var exec = require('child_process').exec;
var utils = require('./utils.js');

// Get location data
function getLocation(options, done) {
  // Note that this command doesn't always work and there are notes that the
  // first response is not alaways accurate
  var command = 'CoreLocationCLI -once -json';
  var retry = 0;
  var minRetry = options && options.minRetry ? options.minRetry : 1;
  var maxRetry = options && options.maxRetry ? options.maxRetry : 20;

  // Get location
  function execute() {
    exec(command, function(error, stdout, stderr) {
      if (error || stderr || retry < minRetry) {
        if (retry <= maxRetry) {
          retry++;
          execute();
        }
        else {
          done('Attempt to get location retry maximum reached (retries: ' + retry + ').');
        }
      }
      else {
        done(null, JSON.parse(stdout.trim()));
      }
    });
  }

  execute();
}

// Add data to file
function updateExif(fileData, exifData) {
  var binary = fileData.toString('binary');
  var exif = piexif.load(binary);

  // Add data
  exif['Exif'][piexif.ExifIFD.DateTimeOriginal] = exifDate();
  exif['GPS'][piexif.GPSIFD.GPSVersionID] = [2, 0, 0, 0];
  exif['GPS'][piexif.GPSIFD.GPSDateStamp] = exifDate();
  exif['GPS'][piexif.GPSIFD.GPSProcessingMethod] = 'WLAN';
  if (exifData.latitude) {
    exif['GPS'][piexif.GPSIFD.GPSLatitudeRef] = exifData.latitude > 0 ? 'N' : 'S';
    exif['GPS'][piexif.GPSIFD.GPSLatitude] = degToExifRational(Math.abs(exifData.latitude));
  }
  if (exifData.longitude) {
    exif['GPS'][piexif.GPSIFD.GPSLongitudeRef] = exifData.longitude > 0 ? 'E' : 'W';
    exif['GPS'][piexif.GPSIFD.GPSLongitude] = degToExifRational(Math.abs(exifData.longitude));
  }

  var exifBytes = piexif.dump(exif);
  var altered = piexif.insert(exifBytes, binary);
  return new Buffer(altered, 'binary');
}

// Make date for exif
function exifDate(date) {
  date = date || new Date();
  date = utils.toUTC(date);
  return '{{YYYY}}:{{MM}}:{{DD}} {{HH}}:{{II}}:{{SS}}'
    .replace(/\{\{YYYY\}\}/gi, utils.pad(date.getFullYear(), 4))
    .replace(/\{\{MM\}\}/gi, utils.pad(date.getMonth() + 1, 2))
    .replace(/\{\{DD\}\}/gi, utils.pad(date.getDate(), 2))
    .replace(/\{\{HH\}\}/gi, utils.pad(date.getHours(), 2))
    .replace(/\{\{II\}\}/gi, utils.pad(date.getMinutes(), 2))
    .replace(/\{\{SS\}\}/gi, utils.pad(date.getSeconds(), 2))
}

// Exif coordinate conversion
function degToExifRational(degFloat) {
  var minFloat = degFloat % 1 * 60;
  var secFloat = minFloat % 1 * 60;
  var deg = Math.floor(degFloat);
  var min = Math.floor(minFloat);
  var sec = Math.round(secFloat * 100);

  return [[deg, 1], [min, 1], [sec, 100]];
}


// Export
module.exports = {
  getLocation: getLocation,
  updateExif: updateExif,
  exifDate: exifDate
};

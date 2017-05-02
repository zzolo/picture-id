# Picture ID

A command line utility that takes a picture when your SSID changes.  This project is blatantly inspired by, ripped off from, and sort of a port of the amazing [Wifi Diary](https://github.com/binx/WiFiDiary) project.

This project only works on Mac currently.

## Install

Make sure [Homebrew](http://brew.sh/) and [Node](https://nodejs.org/) are installed.

* Install [imagesnap](https://github.com/rharder/imagesnap): `brew install imagesnap`
* (optional for location data) Install [CoreLocationCLI](https://github.com/fulldecent/corelocationcli): `brew tap caskroom/cask && brew cask install corelocationcli`
    * Authorize and test: `CoreLocationCLI -once -json`
    * Note that location data is only added to `.jpg` files.
    * Note that the `CoreLocationCLI` utility randomly fails, but the image will still be saved.
* `npm install picture-id -g`
* (optional, but kind of pointless without) Add a line to your crontab: `(crontab -l ; echo '*/10 * * * * PATH=/usr/local/bin:/usr/local/sbin:$PATH && picture-id') | crontab -`

## Use

Provides the `picture-id` command line utility.

```
Usage: picture-id [options]

Options:

  -h, --help                   output usage information
  -V, --version                output the version number
  -b, --db <file>              Where to save the file that keeps track of the SSID. The
                                 default is "~/.picture-id.db".
  -d, --directory <directory>  Where to save the images. The default is "~/Pictures/picture-id".
  -n, --filename <filename>    The name of the file to create with values
                                 {{YYYY}}, {{MM}}, {{DD}}, {{HH}}, {{II}}, {{SS}}, {{SSID}}.
                                 Valid image types are JPEG, TIFF, PNG, GIF, BMP. The
                                 default is "picture-id-{{YYYY}}{{MM}}{{DD}}-{{SSID}}.jpg".
  -w, --warmup <n>             The number of seconds to warmup the camera; the default camera
                                 needs a couple seconds otherwise the picture will be very
                                 dark. The default is "3".
  -f, --force                  Forces picture to be taken regardless of a change of SSID.
  -L, --no-location            Do not attempt to add location to image. Location information
                                 is only added to .jpg files.
```

## In code

There's not much reason to use this module directly in code, but if desired, the module provides a function that takes the same options as the command line utility.

```js
var pictureID = require('picture-id');

pictureID({
  filename: 'from-code-picture.jpg'
});
```

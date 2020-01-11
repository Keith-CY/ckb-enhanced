#!/bin/sh
sh scripts/build.sh
rm -rf release
mkdir -p release/popup/public
mkdir -p release/options/public
cp manifest.json release/manifest.json
cp background.js release/background.js
cp content.js release/content.js
cp content.css release/content.css
cp -r images release/images
cp -r popup/public release/popup
cp -r options/public release/options
cd release/popup/public/build && rm *.map
cd ../../../../release/options/public/build && rm *.map

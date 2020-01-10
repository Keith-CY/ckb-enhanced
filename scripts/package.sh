#!/bin/sh
sh scripts/build.sh
rm -rf release
mkdir -p release/popup/public
cp manifest.json release/manifest.json
cp background.js release/background.js
cp content.js release/content.js
cp content.css release/content.css
cp options.html release/options.html
cp options.js release/options.js
cp -r images release/images
cp -r popup/public release/popup
cd release/popup/public/build && rm *.map

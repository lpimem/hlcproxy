#! /bin/bash

webpack
webpack --config webpack.server.config.js
python -m SimpleHTTPServer 30001 2>&1 1>/dev/null &
python -m SimpleHTTPServer 30002 2>&1 1>/dev/null &

open http://localhost:30002/example/client/client.html

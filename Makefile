build: src
	babel --presets 'quiver-babel/node-preset' --out-dir dist src

test: build
	node dist/test

server: build
	node dist/test-server/server.js

.PHONY: build test server

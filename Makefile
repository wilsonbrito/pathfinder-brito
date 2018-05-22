build:
	browserify path.js -o bundle.js
	stylus -w css/main.styl
site:
	browser-sync start --server --files "css/*.css"

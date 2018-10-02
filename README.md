# MiniNote

[![Say thanks](https://img.shields.io/badge/SayThanks.io-%E2%98%BC-1EAEDB.svg)](https://saythanks.io/to/n1try)

A simple, self-hosted Markdown note-taking app built with [VueJS](https://vuejs.org), and [Express](http://expressjs.com).

![](https://i.imgur.com/Y9TFu6w.png)

[![Buy me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoff.ee/n1try)

## Requirements
* NodeJS >= 6.x

## How to run?
1. `git clone https://github.com/n1try/mininote`
2. In root directory: `npm install`
3. And again in _mininote-frontend_ directory: `npm install`
4. Adapt `config.js` to your needs (e.g. set web server port)
5. In _mininote-frontend_ directory: `npm run build`
6. In root directory: `npm start`

## How to run with Docker?
1. `git clone https://github.com/n1try/mininote`
2. `docker build -t mininote .`
3. `docker run -d -p 3000:3000 -v /your-dir-of-choice:/app/data mininote`
--> MiniNote will listen on port 3000 and persist data to `/your-dir-of-choice` on your host system using a shared volume.

## Use HTTPS for backend
1. Open `config.js`
2. Edit the `HTTPS_KEY` and `HTTPS_CERT` field, and insert the file locations at which your private key and site certifications are stored.
3. Launch the backend server
--> To switch back to the HTTP server, nullify either field and relaunch again.

## Todo
This project is still under development. The following features are about to be implemented. Feel free to contribute.
* Tests
* Improved data validation
* More REST
* Ability to rename notebooks and notes

## License
MIT @ [Ferdinand Mütsch](https://ferdinand-muetsch.de)

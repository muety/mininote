# MiniNote
![GitHub package.json version](https://badges.fw-web.space/github/package-json/v/muety/mininote?style=flat-square)
![](https://badges.fw-web.space/github/license/muety/mininote?style=flat-square)
![GitHub code size in bytes](https://badges.fw-web.space/github/languages/code-size/muety/mininote?style=flat-square)
![GitHub last commit](https://badges.fw-web.space/github/last-commit/muety/mininote)
[![](https://badges.fw-web.space/liberapay/receives/muety.svg?logo=liberapay&style=flat-square)](https://liberapay.com/muety/)
[![Say thanks](https://badges.fw-web.space/badge/SayThanks.io-%E2%98%BC-1EAEDB.svg?style=flat-square)](https://saythanks.io/to/n1try)

[![Buy me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoff.ee/n1try)

---

A simple, self-hosted Markdown note-taking app built with [VueJS](https://vuejs.org), and [Express](http://expressjs.com).

![](https://i.imgur.com/Y9TFu6w.png)


## Requirements
* NodeJS >= `12.19.0 LTS`

## How to run?
1. `git clone https://github.com/muety/mininote`
2. In root directory: `yarn`
3. And again in _webapp_ directory: `yarn`
4. Adapt `config.js` to your needs (e.g. set web server port)
5. In _webapp_ directory: `yarn build`
6. In root directory: `yarn start`

## How to run with Docker?
1. `git clone https://github.com/muety/mininote`
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

## Contributing
Feel free to contribute! All contributions that add value to the project are welcome. However, please be aware that you are not done after having opened a PR. In order to keep quality high, it is expected that you implement change requests and react to comments within an adequate time, until your code is merged. Otherwise your PRs will be closed after a while, sorry!

## License
MIT @ [Ferdinand Mütsch](https://muetsch.io)

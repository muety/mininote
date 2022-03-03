# ![](webapp/public/favicon-32x32.png) MiniNote
![GitHub package.json version](https://badges.fw-web.space/github/package-json/v/muety/mininote?style=flat-square)
![](https://badges.fw-web.space/github/license/muety/mininote?style=flat-square)
![GitHub code size in bytes](https://badges.fw-web.space/github/languages/code-size/muety/mininote?style=flat-square)
![GitHub last commit](https://badges.fw-web.space/github/last-commit/muety/mininote?style=flat-square)
[![](https://badges.fw-web.space/liberapay/receives/muety.svg?logo=liberapay&style=flat-square)](https://liberapay.com/muety/)

---

A simple, self-hosted, encrypted Markdown note-taking app built with [Vue 3](https://v3.vuejs.org), and [Express](http://expressjs.com). Check out the **[hosted demo](https://apps.muetsch.io/mininote)**!

![](https://i.imgur.com/Y9TFu6w.png)


## ⚠️ Breaking Changes
With the release of version `1.0.0`, **encryption** was introduced. However, due to this non-trivial change, this release is not backwards-compatible with previous versions. Attempting to run version `1.0.0` with a database created with an earlier version will cause the application to crash. 

Currently, no automated migration is provided, sorry. To migrate to `1.0.0`, you will need to run two parallel instances and manually copy your notes.

## ⚙️ Requirements
* NodeJS >= `16.14.0 LTS`

## ⌨️ How to run?
**💡 Since version 1.0.0, TLS encryption is mandatory for hosts other than `localhost`, as required for `window.crypto.subtle` (see [#73](https://github.com/muety/mininote/issues/73#issuecomment-1057782171)).**

When either only using MiniNote locally or running it behind a reverse proxy, which terminates TLS instead, you can leave out the HTTPS / TLS part of the setup. 

```bash
# 1. Clone the repo
$ git clone https://github.com/muety/mininote

# 2. Install backend dependencies
$ yarn

# 3. Install frontend dependencies and build
$ cd webapp && yarn && yarn build && cd ..

# 4. Obtain or create a TLS certifiate
# See https://www.linode.com/docs/guides/create-a-self-signed-tls-certificate/
# Skip for localhost or with reverse proxy

# 4. Set environment variables for TLS cert and key
# Skip for localhost or with reverse proxy
$ export HTTPS_CERT='path/to/your/mininote.crt'
$ export HTTPS_KEY='path/to/your/mininote.key'

# Run
$ yarn start
```

## 🐳 How to run with Docker?
```bash
# 1. Obtain or create TLS certificate (see above)

# 2. Create a persistent volume
$ docker volume create mininote-data

# 3. Run the container
$ docker run \
    -d \
    -p 3000:3000 \
    -v mininote-data:/app/data \
    -v path/to/your/mininote.crt:/etc/mininote.crt:ro \
    -v path/to/your/mininote.key:/etc/mininote.key:ro \
    -e HTTPS_CERT=/etc/mininote.crt \
    -e HTTPS_KEY=/etc/mininote.key \
    --name mininote \
    ghcr.io/muety/mininote:latest
```

## 🔒 Encryption
MiniNote features encryption, i.e. every note's title and content are encrypted on the client-side (i.e. in your browser) using symmetric AES-GCM provided by the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). However, a notebook's password is used to derive the encryption key. That is, encryption is [only as strong as your password](https://crypto.stackexchange.com/questions/42538/is-password-based-aes-encryption-secure-at-all). Moreover, although notes are sent to the server encryptedly, this cannot be considered _true_ end-to-end encryption, since the server technically has a chance to log your password the moment you create a new notebook in the first place. MiniNote aims for a decent level of security, but does not claim to be NSA-proof. 

## 🧑‍💻 Contributing
Feel free to contribute! All contributions that add value to the project are welcome. However, please be aware that you are not done after having opened a PR. In order to keep quality high, it is expected that you implement change requests and react to comments within an adequate time, until your code is merged. Otherwise your PRs will be closed after a while, sorry!

## 📓 License
MIT @ [Ferdinand Mütsch](https://muetsch.io)

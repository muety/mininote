module.exports = {
    PORT: process.env.MININOTE_PORT ? parseInt(process.env.MININOTE_PORT) : 3000,
    DB_FILE: process.env.TEST ? 'data/testdb.json' : 'data/notebooks.json',
    DB_COLLECTION_MAIN: 'notebooks',
    DEBUG: false,
    HTTPS_KEY: null,
    HTTPS_CERT: null,
}
module.exports = {
    app: {
        port: 3000,
        view_engine: 'ejs',
        view_folder: __dirname + '/../src/apps/views',
        static_folder: __dirname + '/../src/public',
        image_folder: __dirname + '/../uploads'
    },
}
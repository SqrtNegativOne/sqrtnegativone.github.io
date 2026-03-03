const isProduction = process.env.ELEVENTY_ENV === "PROD";

module.exports = {
    // Fixes an issue where the dev website breaks when making JS changes
    watch: ["docs/assets/js/*.js"],

    // Auto-open the browser when running the dev server
    open: !isProduction,

    // An accessible variable to determine if the server is in production mode or not
    isProduction,
};

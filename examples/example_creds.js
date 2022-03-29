/** Module exports */
module.exports = function () {
    return Object.freeze({
        "secret": '(keytext goes here)'        // Used to initialise express session - specify a unique secret value
    });
}();

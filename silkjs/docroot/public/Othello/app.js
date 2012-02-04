(function () {

    var scripts = document.getElementsByTagName('script'),
        matchRe = /app\.js$/,
        match,
        scriptSrc,
        i,
        len,
        scriptPath;

    for (i = 0, len = scripts.length; i < len; i++) {
        scriptSrc = scripts[i].src;

        match = scriptSrc.match(matchRe);

        if (match) {
            scriptPath = scriptSrc.substring(0, scriptSrc.length - match[0].length);
            break;
        }
    }

    Ext.Loader.setConfig({
        enabled : true
    });

    Ext.application({
        name        : 'Othello',
        appFolder   : scriptPath + '/app',
        controllers : [
            'Settings',
            'ScoreCard',
            'Viewport',
            'Messaging',
            'Login'
        ],
        init : function () {
            Othello.app = this;

        },
        launch      : function () {

        }
    });


})();
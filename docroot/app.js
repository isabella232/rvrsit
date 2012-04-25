//<debug>
Ext.Loader.setPath({
    'Ext' : 'sdk/src'
});
//</debug>

Ext.application({
    name : 'Rvrsit',

    controllers : [
        'Settings',
        'ScoreCard',
        'Authentication',
        'Viewport'
    ],

    icon : {
        57  : 'resources/icons/icon.png',
        72  : 'resources/icons/icon.png',
        114 : 'resources/icons/Icon@2x.png',
        144 : 'resources/icons/Icon~ipad@2x.png'
    },

    tabletStartupScreen : 'resources/loading/Homescreen~ipad.jpg',

    launch : function() {
        // Destroy the #appLoadingIndicator element
        var loader = Ext.get('appLoadingIndicator');
        loader && loader.destroy();
        Rvrsit.app = this;
        //            Rvrsit.heartbeat = new silk.Heartbeat();

        this.on({
            gameinitialized : this.onGameInitialized,
            scope           : this
        });
    },

    onGameInitialized : function(game) {
        Rvrsit.game = this.game = game;
        this.getMessages();
    },
    getMessages    : function() {
        silk.heartbeat_enabled = true;
        var me = this,
            game = Rvrsit.game;

        me.user = me.getUser();
//        debugger;
        if (me.user) {

            silk.Heartbeat.addMethod('getMessages', {
                scope    : this,
                method   : 'getMessages',
                params   : function() {
                    var data = Ext.clone(me.user);
//                    data.status = game && game.halt ? 'halt' : 'playing';
                    //                        console.log('params', data);
                    return Ext.clone(me.user);
                },
                callback : function(data) {
//                    if (me.user.name == 'Slave') {
//                        console.log('>> getMessages', turns);
//
//                        var game = Rvrsit.game;
//                        if (!game) {
//                            return;
//                        }
//                        Ext.each(turns, function(turn) {
//                            console.log(turn.turnColor, turn.chipItemIds);
//                            game.forceFlipChips(turn);
//                        });
//                    }
                    me.processMessages(data);
                    me.getMessages();

                }
            });

            me.hearbeatInitialized = true;
        }
    },

    processMessages : function(envelope) {
       var me = this,
           messages = envelope.messages,
           messageIds = [];

        if (messages.length < 1) {
            return;
        }

        Ext.each(messages, function(msg, i) {
            messageIds[i] = msg.messageId
        });

        me.fireEvent('messagesreceived', messages);

        me.rpc({
            method : 'ackMessages',
            params : {
                messages : Ext.encode(messageIds)
            },
            success : function() {
                console.log(messageIds.join(), 'acknowledge');
            }
        });
    },


    rpc : function(config) {
        console.log('>>> RPC ' + config.method);

        config = config || {};
        Ext.Ajax.request({
            method  : 'POST',
            url     : '/rpc',
            params  : Ext.apply(config.params || {}, { method : config.method }),
            success : function(response) {
                var data = Ext.decode(response.responseText);
                console.log('RPC RESPONSE:', response.responseText);

                if (! data.success) {
                    config.success && config.success.call(config.scope || window, data);
                }
                else {
                    config.failure && config.failure.call(config.scope || window, data);
                }

                config.callback && config.callback.call(config.scope || window, data);
            }
        });
    },

    setUser : function(user) {
        localStorage.setItem('user', Ext.encode(user));
        this.user = user;
    },

    getUser : function() {
        var thisUser = this.user;
        return thisUser ? thisUser : this.user = Ext.decode(localStorage.getItem('user'));
    },

    onUpdated : function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function() {
                window.location.reload();
            }
        );
    }
});
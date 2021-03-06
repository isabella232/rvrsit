Ext.define('Rvrsit.view.ScoreCard', {
    extend : 'Ext.Component',
    xtype  : 'scorecard',
    config : {
        style  : 'background-image: url(media/images/new/sidebar_bg.png); background-repeat: no-repeat;',

        turnOpposites : {
            black : 'tile-white',
            white : 'tile-black'
        },
        turnTitles:  {
            single : {
                black : 'Your turn',
                white : 'Computer'
            },
            'double' : {
                black : 'Player #1',
                white : 'Player #2'
            }
        },
        html :  [
            '<div style="padding-top: 5px;">',
                '<div class="logo animated flip"></div>',
                '<div class="player animated fade-in">',
                    '<div class="player-turn-title">TURN</div>',
                    /** ZOMG! A table! Dave phix0r this!! please? :)**/

                    '<table style="width:200px; margin-left: 100px;">',
                        '<tr>',
                            '<td style="width: 50px;">',
                                '<div class="player-turn-tile tile-black player-indicator">&nbsp;</div>',
                            '</td>',
                            '<td>',
                                '<div class="player-turn-label"> </div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>',

                '<div class="player animated fade-in">',
                    '<div class="player-score">SCORE</div>',

                    /** ZOMG! A table! Dave phix0r this!! please? :)**/
                    '<table style="width:200px; margin-left: 100px;">',
                        '<tr>',
                            '<td style="width: 50px;">',
                                '<div class="player-turn-tile tile-white" style="position: inherit !important;">&nbsp;</div>',
                            '</td>',
                            '<td>',
                                '<span class="score-keeper-white">0</span>',
                            '</td>',
                            '<td style="width: 50px;">',
                                '<div class="player-turn-tile tile-black-score" style="position: inherit !important;">&nbsp;</div>',
                            '</td>',
                            '<td >',
                                '<span class="score-keeper-black">0</span>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>',
//
//                '<div class="about-pane animated fade-in">',
//                    '<p><strong>This game was designed and built by the team at <a href="http://www.moduscreate.com">Modus Create</a>.</strong></p>',
//                    '<p>We are a highly motivated, interdisciplinary team that believes in lean development, design strategy, and user experience to develop stunning applications with emerging technology.</p>',
//                '</div>',
                '<div class="button button-untouched animated fade-in">',
                    '<div class="btn-title solo">Play Computer</div>',
                '</div>',
                '<div class="button button-untouched animated fade-in">',
                    '<div class="btn-title online">Play Online</div>',
                '</div>',
                '<div class="button button-untouched fade-in">',
                    '<div class="btn-title settings">Settings</div>',
                '</div>',
                '<div id="login-button-wrap" class="button button-untouched fade-in">',
                    '<div id="login-button" class="btn-title login">Log In</div>',
                '</div>',
                '<div id="register-button-wrap" class="button button-untouched fade-in">',
                    '<div id="register-button" class="btn-title register">Register</div>',
                '</div>',
            '</div>'
        ].join('')
    },

    initialize : function() {

        this.callParent();

        this.element.on({
            tap      : this.onElementTap,
            scope    : this,
            delegate : '.button'
        });

        this.element.on({
            touchstart : this.onElementTouchStart,
            scope      : this,
            delegate   : '.button'
        });

        this.element.on({
            touchend : this.onElementTouchEnd,
            scope    : this,
            delegate : '.button'
        });

        // hack!
        this.on('painted', function() {
            var el = this.element.down('.button-touched');

            el && Ext.get(el).replaceCls('button-touched', 'button-untouched');
        }, this);
    },
    onElementTap : function(evtObj) {
        var target = evtObj.getTarget();
        if (target) {
            var event = target.childNodes[0].classList[1];
            this.fireEvent(event, this);
        }
    },

    onElementTouchStart : function(evtObj) {
        var target = evtObj.getTarget();
        if (target) {
            Ext.fly(target).replaceCls('button-untouched','button-touched');
        }
    },

    onElementTouchEnd : function(evtObj) {
        var target = evtObj.getTarget();
        if (target) {
            Ext.fly(target).replaceCls('button-touched','button-untouched');
        }
    },

    updateScore : function(scoreObj, token) {
//        console.log('score update', scoreObj, token);

        var me = this,
            turnOpposites = this.getTurnOpposites(),
            gameModeSplit = Rvrsit.game.mode.split(' ')[0],
            turnTitleTexts = this.getTurnTitles()[gameModeSplit],
            turnLabelTxt,
            turnIndicatorTxt;

        if (!me.playerTurnIndicator) {
            var myElement = me.element;
            me.playerTurnIndicator = myElement.down('.player-indicator');
            me.playerTurnLabel     = myElement.down('.player-turn-label').dom;
            me.whitePlayerScoreEl  = myElement.down('.score-keeper-white').dom;
            me.blackPlayerScoreEl  = myElement.down('.score-keeper-black').dom;
        }

        if (! token) {
            me.playerTurnLabel.innerHTML    = turnTitleTexts[scoreObj.turn];
            me.playerTurnIndicator.replaceCls(turnOpposites[scoreObj.turn], 'tile-' + scoreObj.turn);
        }
        else {
            me.forceTitleUpdate(token)
        }

        me.whitePlayerScoreEl.innerHTML = scoreObj.white;
        me.blackPlayerScoreEl.innerHTML = scoreObj.black;
    },
    forceTitleUpdate : function(token) {
//        debugger;

        var me = this,
            turnOpposites = this.getTurnOpposites(),
            isFirstPlayer = (token.currentPlayer == token.firstPlayer.playerId),
            turnColor = isFirstPlayer ? 'black' : 'white',
            currentPlayerName = isFirstPlayer ? token.firstPlayer.name : token.secondPlayer.name;

        me.playerTurnLabel.innerHTML = currentPlayerName;
        me.playerTurnIndicator.replaceCls(turnOpposites[turnColor], 'tile-' + turnColor);

    }
});

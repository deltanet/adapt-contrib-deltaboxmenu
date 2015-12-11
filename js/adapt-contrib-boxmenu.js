define([
    'coreJS/adapt',
    'coreViews/menuView'
], function(Adapt, MenuView) {

    var BoxMenuView = MenuView.extend({

        events: {
            'click .menu-item-audio-toggle': 'toggleAudio'
        },

        postRender: function() {
            var nthChild = 0;
            this.model.getChildren().each(function(item) {
                if (item.get('_isAvailable')) {
                    nthChild++;
                    item.set("_nthChild", nthChild);
                    this.$('.menu-container-inner').append(new BoxMenuItemView({model: item}).$el);
                }
            });

            this.audioChannel = this.model.get('_audio')._channel;
            this.elementId = this.model.get("_id");

            // Hide controls
            if(this.model.get('_audio')._showControls==false){
                this.$('.audio-toggle').addClass('hidden');
            }
            try {
                this.audioFile = this.model.get("_audio")._media.mp3;
            } catch(e) {
                console.log('An error has occured loading audio');
            }

            // Set clip ID
            Adapt.audio.audioClip[this.audioChannel].newID = this.elementId;
            // Set listener for when clip ends
            $(Adapt.audio.audioClip[this.audioChannel]).on('ended', _.bind(this.onAudioEnded, this));

            // Check if audio is set to on
            if(Adapt.audio.audioClip[this.audioChannel].status==1){
                // Check if audio is set to autoplay
                if(this.model.get("_audio")._isEnabled && this.model.get("_audio")._autoplay){
                    Adapt.trigger('audio:playAudio', this.audioFile, this.elementId, this.audioChannel);
                }
            }

        },

        onAudioEnded: function() {
            Adapt.trigger('audio:audioEnded', this.audioChannel);
        },

        toggleAudio: function(event) {
            if (event) event.preventDefault();
 
            if ($(event.currentTarget).hasClass('playing')) {
                Adapt.trigger('audio:pauseAudio', this.audioChannel);
            } else {
                Adapt.trigger('audio:playAudio', this.audioFile, this.elementId, this.audioChannel);
            }
        }

    }, {
        template: 'boxmenu'
    });

    var BoxMenuItemView = MenuView.extend({

        events: {
            'click button' : 'onClickMenuItemButton'
        },

        className: function() {
            var nthChild = this.model.get("_nthChild");
            return [
                'menu-item',
                'menu-item-' + this.model.get('_id') ,
                this.model.get('_classes'),
                'nth-child-' + nthChild,
                nthChild % 2 === 0 ? 'nth-child-even' : 'nth-child-odd'
            ].join(' ');
        },

        preRender: function() {
            this.model.checkCompletionStatus();
            this.model.checkInteractionCompletionStatus();
        },

        postRender: function() {
            var graphic = this.model.get('_graphic');
            if (graphic && graphic.src && graphic.src.length > 0) {
                this.$el.imageready(_.bind(function() {
                    this.setReadyStatus();
                }, this));
            } else {
                this.setReadyStatus();
            }
        },

        onClickMenuItemButton: function(event) {
            if(event && event.preventDefault) event.preventDefault();
            Backbone.history.navigate('#/id/' + this.model.get('_id'), {trigger: true});
        }

    }, {
        template: 'boxmenu-item'
    });

    Adapt.on('router:menu', function(model) {

        $('#wrapper').append(new BoxMenuView({model: model}).$el);

    });

    /////////////////////////////////
    
    Adapt.on('menuView:postRender', function(view) {
        
        var config = Adapt.course.get("_start");
        
        if (Adapt.location._currentId == config._menuPage) {
            $('.navigation-back-button').addClass('display-none');
        }
        
    });
    
    /////////////////////////////////

});

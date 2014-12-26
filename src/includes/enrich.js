    (function(){

        var QC_VALUES = {
            CORRECT: 0,
            INCORRECT: 1
        };

        function suggestionIsEnriched(suggestion) {
            return suggestion && suggestion.data && suggestion.data.qc === QC_VALUES.CORRECT;
        }

        var enrichServices = {
            'default': {
                enrichSuggestion: function (suggestion) {
                    return $.Deferred().resolve(suggestion);
                }
            },
            'dadata': (function () {
                return {
                    enrichSuggestion: function (suggestion) {
                        var that = this,
                            resolver = $.Deferred();

                        // if current suggestion is already enriched, use it
                        if (suggestion.data && suggestion.data.qc != null) {
                            return resolver.resolve(suggestion);
                        }

                        that.disableDropdown();
                        that.currentValue = suggestion.value;

                        // prevent request abortation during onBlur
                        that.currentRequestIsEnrich = true;
                        that.getSuggestions(suggestion.value, { count: 1 }, { noCallbacks: true })
                            .always(function () {
                                that.enableDropdown();
                            })
                            .done(function (suggestions) {
                                resolver.resolve(suggestions && suggestions[0] || suggestion);
                            })
                            .fail(function () {
                                resolver.resolve(suggestion);
                            });
                        return resolver;
                    }
                }
            }())
        };

        var methods = {
            selectEnrichService: function () {
                var that = this,
                    type = types[that.options.type],
                    token = $.trim(that.options.token);

                if (that.options.useDadata && type && type.enrichmentEnabled && token) {
                    that.enrichService = enrichServices['dadata'];
                } else {
                    that.enrichService = enrichServices['default'];
                }
            }
        };

        $.extend(defaultOptions, {
            useDadata: true
        });

        notificator
            .on('setOptions', methods.selectEnrichService);

    }());
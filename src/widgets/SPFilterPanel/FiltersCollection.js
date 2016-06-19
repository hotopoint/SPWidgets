define([
    "vendor/jsutils/Collection",
    "vendor/jsutils/toUrlParams",

    "../../sputils/getCamlLogical"
], function(
    Collection,
    toUrlParams,

    getCamlLogical
){

    /**
     * A collection (Array like object) with the list of
     * individual Filters (`FilterModel`).
     *
     * @class FiltersCollection
     * @extends Collection
     */
    var FiltersCollection = {
        /**
         * Returns a CAML strings of all the Filters contained
         * in the collection using an `And` logical operator.
         *
         * @returns {String}
         */
        toCAMLQuery: function(){
            return getCamlLogical({
                values: this
                    .filter(isFilterDefined)
                    .map(function(filter){
                        return filter.toCAMLQuery();
                    })
            });
        },

        /**
         * Returns a URL parameters string with all the filters.
         *
         * @returns {String}
         */
        toURLParams: function(){
            return toUrlParams(this.slice().filter(isFilterDefined), "filter");
        }
    };

    /**
     * Used with `Array#filter` to check if an individual filter
     * is defined.
     *
     * @private
     *
     * @param {FilterModel} filter
     *
     * @return {Boolean}
     */
    function isFilterDefined(filter){
        return filter.values.length || filter.sortOrder;
    }

    FiltersCollection = Collection.extend(FiltersCollection);

    return FiltersCollection;
});
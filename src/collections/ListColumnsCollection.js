import objectExtend from "common-micro-libs/src/jsutils/objectExtend"
import Collection   from "observable-data/src/ObservableArray"
import dataStore    from "common-micro-libs/src/jsutils/dataStore"


var PRIVATE = dataStore.create();

/**
 * A collection of List Columns
 *
 * @class ListColumnsCollection
 * @extends Collection
 *
 * @param {Array} itemsList
 * @param {Object} options
 * @param {Object} options.listDef
 */
export default Collection.extend({
    init: function(itemsList, options){
        Collection.prototype.init.call(this, itemsList);

        var opt = objectExtend({}, {
            listDef: null
        }, options);

        PRIVATE.set(this, opt);
    },

    /**
     * Returns an object with the definition for the given column
     *
     * @param {String} name
     *  Name of column - external or internal.
     *
     * @return {ListColumnModel}
     */
    getColumn: function(name){
        var col;
        this.some(function(thisCol){
            if (thisCol.Name === name || thisCol.DisplayName === name || thisCol.StaticName === name){
                col = thisCol;
            }
        });
        return col;
    },

    /**
     * returns the ListModel for the list for which the collection was requested.
     *
     * @return {ListModel}
     */
    getList: function(){
        return PRIVATE.get(this).listDef;
    }

});

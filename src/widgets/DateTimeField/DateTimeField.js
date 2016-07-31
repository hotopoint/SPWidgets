define([
    "vendor/jsutils/Widget",
    "vendor/jsutils/EventEmitter",
    "vendor/jsutils/dataStore",
    "vendor/jsutils/objectExtend",
    "vendor/jsutils/fillTemplate",
    "vendor/jsutils/parseHTML",

    "../3pp/flatpickr/flatpickr",

    "text!./DateTimeField.html",
    //---------------------------------
    "less!./DateTimeField.less"
], function (
    Widget,
    EventEmitter,
    dataStore,
    objectExtend,
    fillTemplate,
    parseHTML,

    flatpickr,

    DateTimeFieldTemplate
) {

    var
    PRIVATE = dataStore.create(),

    /**
     * A SharePoint DateTime field.
     *
     * @class DateTimeField
     * @extends Widget
     * @extends EventEmitter
     *
     * @param {Object} options
     *
     * @param {Object|ListColumnModel} options.column
     *  the column definition. `DisplayName`, `Description` and
     *  `Format` all have an impact on the widget.
     *
     * @param {String} [options.dateFormat='F j, Y']
     *  Format of the date when no time is allowed.
     *  For information on what token can be used see
     *  [flatpickr widget]{@link https://chmln.github.io/flatpickr/#dateformat}
     *
     * @param {String} [options.dateTimeFormat='F j, Y h:i:S K']
     *  Format of the date and time.
     *  For information on what token can be used see
     *  [flatpickr widget]{@link https://chmln.github.io/flatpickr/#dateformat}
     *
     * @fires DateTimeField#change
     */
    DateTimeField = /** @lends DateTimeField.prototype */{
        init: function (options) {
            var
            inst = {
                opt: objectExtend({}, DateTimeField.defaults, options)
            },
            opt     = inst.opt,
            column  = opt.column || {};

            PRIVATE.set(this, inst);

            this.$ui = parseHTML(
                fillTemplate(DateTimeFieldTemplate, inst.opt)
            ).firstChild;

            var uiFind = this.$ui.querySelector.bind(this.$ui);

            inst.isDateOnly = column.Format === "DateOnly";

            inst.dateWdg = flatpickr(uiFind("input"), {
                dateFormat: inst.isDateOnly ? opt.dateFormat : opt.dateTimeFormat,
                enableTime: !inst.isDateOnly,
                onChange:   function(dtObj, dtStr){
                    /**
                     * Date and/or time was changed
                     *
                     * @event DateTimeField#change
                     *
                     * @type Object
                     * @property {Date} dateObj
                     * @property {String} formattedDate
                     */
                    this.emit("change", {
                        dateObj:        dtObj,
                        formattedDate:  dtStr
                    });
                }.bind(this)
            });

            this.onDestroy(function () {
                // Destroy all Compose object
                Object.keys(inst).forEach(function(prop){
                    if (inst[prop]) {
                        // Widgets
                        if (inst[prop].destroy) {
                            inst[prop].destroy();

                            // DOM events
                        } else if (inst[prop].remove) {
                            inst[prop].remove();

                            // EventEmitter events
                        } else if (inst[prop].off) {
                            inst[prop].off();
                        }

                        inst[prop] = undefined;
                    }
                });
                PRIVATE.delete(this);
            }.bind(this));
        },

        /**
         * Returns an object containing information about the date
         * selected by the user.
         *
         * @return {Object|undefined}
         *
         * @example
         *
         * // returned object format
         *
         * {
         *      dateObj: Date()
         *      formattedDate: 'date displayed to user'
         * }
         */
        getValue: function(){
            var dateWdg = PRIVATE.get(this).dateWdg,
                dateObj = dateWdg.selectedDateObj;

            if (!dateObj) {
                return;
            }

            return {
                dateObj:        dateObj,
                formattedDate:  dateWdg.input.value
            };
        },

        /**
         * Sets the date on the widget
         *
         * @param {String|Date} date
         *  The date to set on the widget. If a `String` is defined, it
         *  must be one that `Date.parse()` can handle
         *  ([more]{@link http://devdocs.io/javascript/global_objects/date/parse})
         *
         * @see http://devdocs.io/javascript/global_objects/date/parse
         */
        setValue: function(date){
            if (!date) {
                return;
            }

            if (typeof date === "string") {
                date = Date.parse(date);
            }

            if (date instanceof Date) {
                PRIVATE.get(this).dateWdg.setDate(date);
            }
        }
    };

    DateTimeField = EventEmitter.extend(Widget, DateTimeField);
    DateTimeField.defaults = {
        column:         null,
        dateFormat:     "F j, Y",
        dateTimeFormat: "F j, Y h:i:S K",

        allowMultiples: false               // FIXME: implement allowMultiples (for filter panel)
    };

    return DateTimeField;

    // SP List DATE field definition
    //-------------------------------------
    //<Field Type="DateTime"
    //      ID="{cd21b4c2-6841-4f9e-a23a-738a65f99889}"
    //      Name="DueDate"
    //      DisplayName="Due Date"
    //      Format="DateOnly"
    //      FriendlyDisplayFormat="Relative"
    //      SourceID="http://schemas.microsoft.com/sharepoint/v3"
    //      StaticName="DueDate"
    //      ColName="datetime2"
    //      Required="FALSE"
    //      EnforceUniqueValues="FALSE"
    //      Indexed="FALSE"
    //      CalType="0"
    //      Version="2"
    //      RowOrdinal="0"/>

});
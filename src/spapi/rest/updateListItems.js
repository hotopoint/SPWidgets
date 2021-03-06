import objectExtend         from "common-micro-libs/src/jsutils/objectExtend"
import getContextInfo       from "./getContextInfo"
import apiFetch             from "../../sputils/apiFetch"
import { getRestHeaders }   from "../../sputils/restUtils"
import ListItemModel from "../../models/ListItemModel"
import {IS_GUID_RE} from "../../sputils/constants";


//==================================================================
const encodeURIComponent = window.encodeURIComponent;

////// FIXME: support Array of updates (bulk)
////// FIXME: support updates defined as as string (pass it to `body` of request as is)


/**
 * Makes updates to list items
 *
 * @function
 *
 * @param {Object} options
 *
 * @param {String} options.list
 *  The list name or ID
 *
 * @param {String|Object|Array<String|Object>} options.updates
 *
 * @param {String} [options.type="update"]
 *  The type of update... Possible values are:
 *  -   `update` (`PATCH` will be used)
 *  -   `create` (`POST` will be used)
 *
 * @param {String} [options.web=__current_web__]
 *
 * @param {ListItemModel} [options.ListItemModel=ListItemModel]
 *
 * @return {Promise<void, Error>}
 *
 * @example
 *
 * FIXME: example here
 */
export function updateListItems(options) {
    const opt = objectExtend({}, updateListItems.defaults, options);

    if (Array.isArray(opt.update)) {
        throw new Error("options.updates as an Array not yet supported!");
    }

    return getContextInfo(opt.web)
        .then(contextInfo => {
            const isCreate = opt.type.toLowerCase() === "create";

            let requestUrl = `${ contextInfo.WebFullUrl }/_api/web/lists${
                IS_GUID_RE.test(opt.list) ?
                    `(guid'${opt.list.replace(/[{}]/g, "")}')` :
                    `/getbytitle('${encodeURIComponent(opt.list)}')`
                }/items`;

            if (!isCreate) {
                requestUrl += `(${opt.updates.ID})`
            }

            requestUrl += "?";

            // FIXME: should encodeURIComponent() be used for below options?

            if (opt.filter) {
                requestUrl+= `&$filter=${opt.filter}`;
            }

            if (opt.select) {
                requestUrl+= `&$select=${opt.select}`;
            }

            if (opt.orderBy) {
                requestUrl+= `&$orderby=${opt.orderBy}`;
            }

            if (opt.expand) {
                requestUrl+= `&$expand=${opt.expand}`;
            }

            opt.requestUrl = requestUrl;
            opt.isREST = true;

            const headers = getRestHeaders(contextInfo);

            if (!isCreate) {
                headers["X-HTTP-Method"] = "MERGE"; // FIXME: these should be input options for greater flexibility
                headers["If-Match"] = "*";
            }

            return apiFetch(requestUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(opt.updates)
            }).then(fetchResponse => {
                return new opt.ListItemModel(fetchResponse.content, opt);
            });
        });
}
export default updateListItems;



/**
 * Default options for `updateListItems` REST method
 *
 * @type {{list: string, web: string, select: string, filter: string, expand: string, orderBy: string, ListItemsCollection, ListItemModel}}
 */
updateListItems.defaults = {
    list: "",
    web: "",
    type: "update",
    updates: null,
    ListItemModel
};

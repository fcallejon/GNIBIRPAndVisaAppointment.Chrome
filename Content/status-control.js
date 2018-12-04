'use strict'

class StatusControl {
    constructor () {
        this.itemsCount = {};
        this.loadings = {};
    }
    
    addLoading (group) {
        this.loadings[group] = (this.loadings[group] || 0) + 1;
        this.itemsCount[group] = (this.itemsCount[group] || 0) + 1;
    }

    removeLoading (group) {
        this.loadings[group]--;

        if (!this.loadings[group]) {
            var listSelector = '.' + group + 's .list';
            $(listSelector + ' .loading').remove();

            if (!$(listSelector + ' .appointment').length) {
                $(listSelector).append('<div class="empty">There\'s no valid appointment.');
            }
        }
    }
}

// ugly partial fix for lack of export
const statusControl = new StatusControl();
window.statusControl = statusControl;
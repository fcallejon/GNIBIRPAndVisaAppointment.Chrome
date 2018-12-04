class FormStorage {
    save (key, data, callback) {
        var update = {};
        update[key] = data;
        chrome.storage.local.set(update, callback);
    }

    retrieve (key, callback) {
        chrome.storage.local.get(key, function (items) {
            callback(items[key]);
        });
    }

    async retrieveItem (key) {
        return await new Promise(res =>
        chrome.storage.local.get(key, (items) => {
            res(items[key]);
        }));
    }
}

const formStorage = new FormStorage();
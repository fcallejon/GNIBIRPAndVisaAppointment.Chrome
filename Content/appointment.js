var appointment = {
    initialized: false,

    initialize: function () {
        //Inject files and codes when tabs opened
        if (!appointment.initialized) {
            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                if (sender.tab && appointment.tabs[sender.tab.id] && request.autoFormCompleted) {
                    chrome.windows.update(sender.tab.windowId, {
                        focused: true
                    });

                    chrome.tabs.update(sender.tab.id, {
                        active: true
                    });
    
                    appointment.tabs[sender.tab.id] = null;
                }
            });

            chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                var tab = appointment.tabs[tabId];

                if (tab && changeInfo.status == 'complete') {
                    chrome.tabs.sendMessage(tab.id,
                    {
                        presetFormType: tab.type,
                        selectedTime: tab.selectedTime
                    },
                    function (response) {
                        console.log('Form completed for time.'.replace('time', tab.selectedTime));
                    });
                }
            });

            appointment.initialized = true;
        }
    },

    getNewestAppointments: async function (onApiLoading, onApiLoaded) {
        var groups = ['irp'];
        for (var groupIndex in groups) {
            var group = groups[groupIndex];
            
            const presets = await formStorage.retrieveItem(group + '-form-preset');
            const sfd = presets.find(item => item.id === "SFD").value;

            for (var index in appointmentAPIs[group]) {
                var appointmentAPI = appointmentAPIs[group][index];

                onApiLoading(group);
                
                (function (appointmentAPI, group, category) {
                    if (appointmentAPI.url) {
                        const url = appointmentAPI.url + sfd;
                        var getter = group == 'irp' && proxy.get || $.get;
                        getter(url, function (data) {
                            onApiLoaded(group, category, data);
                        });
                    } else {
                        onApiLoaded(group, category, appointmentAPI.getDirectData());
                    }
                })(appointmentAPI, group, index);
            }
        }
    },

    tabs: {},

    appoint: function (type, time, callback) {
        var backgroundPage = chrome.extension.getBackgroundPage();
        if (backgroundPage && window != backgroundPage) {
            return backgroundPage.appointment.appoint(type, time, callback);
        }

        appointment.initialize();

        chrome.windows.getCurrent(function (currentWindow) {
            var recordTab = function (tab, callback) {
                appointment.tabs[tab.id] = {
                    id: tab.id,
                    type: type,
                    selectedTime: time || '',
                    fileIndex: 0
                };

                callback && callback(tab);
            }

            var openTab = function (callback) {
                chrome.tabs.create({
                    url: appointmentAPIs.appointmentLinks[type],
                    active: false
                }, function (tab) {
                    recordTab(tab, callback);
                });
            };

            currentWindow
            ? openTab(callback)
            : chrome.windows.create({
                url: appointmentAPIs.appointmentLinks[type],
                focused: true
            }, function (window) {
                recordTab(window.tabs[0], callback);
            });
        });
    }
};
var appointment = {
    initialized: false,

    initialize: function () {
        //Inject files and codes when tabs opened
        if (!appointment.initialized) {
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
        const groups = ['irp'];
        for (var groupIndex in groups) {
            var group = groups[groupIndex];

            const presets = await formStorage.retrieveItem(group + '-form-preset');
            const sfd = presets.find(item => item.id === "SFD").value;
            const sfdMoment = moment(sfd, "DD/MM/YYYY");
            const maxDate = new moment().add(90, 'days');
            if (maxDate.isBefore(sfdMoment, 'day')) {
                return;
            }
            const datesDifference = Math.min(Math.abs(sfdMoment.diff(maxDate, 'days')), 5);
            const fetchDates = [];
            for (let index = 0; index < datesDifference; index++) {
                const date = sfdMoment.add(1, 'days').clone();
                const weekday = date.weekday();
                if (weekday == 0 && weekday == 6) continue;
                fetchDates.push(date);
            }

            for (let index in appointmentAPIs[group]) {
                const appointmentAPI = appointmentAPIs[group][index];

                onApiLoading(group);

                fetchDates.forEach(date => {
                    (function (appointmentAPI, group, category) {
                        if (appointmentAPI.url) {
                            const url = appointmentAPI.url + date.format('DD/MM/YYYY');
                            const getter = group == 'irp' && proxy.get || $.get;
                            getter(url, function (data) {
                                onApiLoaded(group, category, data);
                            });
                        } else {
                            onApiLoaded(group, category, appointmentAPI.getDirectData());
                        }
                    })(appointmentAPI, group, index);
                });
            }
        }
    },

    tabs: {},

    appoint: function (type, time, callback) {
        const backgroundPage = chrome.extension.getBackgroundPage();
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
    },

    __daysCount: function (start, end) {
        var first = start.clone().endOf('week'); // end of first week
        var last = end.clone().startOf('week'); // start of last week
        var days = last.diff(first, 'days') * 5 / 7; // this will always multiply of 7
        var wfirst = first.day() - start.day(); // check first week
        if (start.day() == 0)--wfirst; // -1 if start with sunday 
        var wlast = end.day() - last.day(); // check last week
        if (end.day() == 6)--wlast; // -1 if end with saturday
        return wfirst + days + wlast; // get the total
    }
};
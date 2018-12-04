class Decoders {

    constructor () {
        this.lists = {};
    }

    _getAppointmentDiv (type, time, isPreset, url) {
        var appointmentElement = document.createElement('div');
        appointmentElement.setAttribute('class', 'appointment');

        var appointmentContent = isPreset
        ? document.createElement('a')
        : document.createElement('span');

        appointmentContent.setAttribute('href', url);
        appointmentContent.setAttribute('form-type', type);
        appointmentContent.setAttribute('target', '_blank');
        appointmentContent.setAttribute('time', time);
        $(appointmentContent)
            .click(function () {
                appointment.appoint(type, time);
                return false;
            });

        appointmentContent.innerHTML = time;
        appointmentElement.appendChild(appointmentContent);

        return appointmentElement;
    }

    irp (type, data) {
        preset.getPreset(presets => {
            const $list = this.lists['irp'] || (this.lists['irp'] = $('.irp'));
            const $types = this.$getTypeGroup($list, type);

            if (data.slots && data.slots.length && data.slots[0] != 'empty') {
                var isPreset = presets.irp.Category
                && presets.irp.ConfirmGNIB
                && type == presets.irp.Category + '-' + presets.irp.ConfirmGNIB;
                
                for (var index in data.slots) {
                    var appointment = data.slots[index];
                    $types.append(this._getAppointmentDiv('irp', appointment.time, isPreset, 'https://burghquayregistrationoffice.inis.gov.ie/Website/AMSREG/AMSRegWeb.nsf/AppSelect?OpenForm&selected=true'));
                }
            } else {
                $types.append('<span class="no-valid">No valid</span>');
            }

            statusControl.removeLoading('irp');
        });
    }

    $getTypeGroup ($list, type) {
        return $list.find('.' + type);

        if (!$list.find('[type=' + type + ']').length) {
            !$list.append('<div class="typegroup" type="' + type + '"><div class="type">' + type + '</div></div>');
        }

        return $list.find('[type=' + type + ']');
    }
}

class StatusControl {
    constructor () {
        this.itemsCount = {};
        this.loadings = {};
    }
    
    addLoading (group) {
        statusControl.loadings[group] = (statusControl.loadings[group] || 0) + 1;
        statusControl.itemsCount[group] = (statusControl.itemsCount[group] || 0) + 1;
    }

    removeLoading (group) {
        statusControl.loadings[group]--;

        if (!statusControl.loadings[group]) {
            var listSelector = '.' + group + 's .list';
            $(listSelector + ' .loading').remove();

            if (!$(listSelector + ' .appointment').length) {
                $(listSelector).append('<div class="empty">There\'s no valid appointment.');
            }
        }
    }
}

const decoders = new Decoders();
const statusControl = new StatusControl();

$(document).ready(function () {    
    const oldAppoint = appointment.appoint;
    appointment.appoint = function(type, time) {
        $('.waiting').fadeIn('fast', function () {
            oldAppoint(type, time);
        });
    };

    $('a[class*=appoint]').click(function () {
        const $clickedInput = $(this);
        const type = $clickedInput.attr('form-type');
        const time = $clickedInput.attr('time');
        appointment.appoint(type, time);
        
        return false;
    });

    let loaded = 0;
    let apiCount = 6;
    $('.progress-bar').width(1 / (apiCount + 1) * 100 + '%');

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.appointmentLoad == 'addLoading') {
            statusControl.addLoading(request.group);
        } else if (request.appointmentLoad == 'loaded') {
            if (request.group == 'irp') {
                $('.progress-bar').width((++loaded + 1) /  (apiCount + 1) * 100 + '%');
                if (loaded == 2) {
                    $('.progress-bar').removeClass('bg-danger').addClass('bg-warning');
                } if (loaded == 5) {
                    $('.progress-bar').removeClass('bg-warning').addClass('bg-primary');
                } else if (loaded == 6) {
                    $('.progress-bar').removeClass('bg-primary').addClass('bg-success');
                }
            }
            decoders.irp(request.category, request.data);
        }
    });

    // appointment.getNewestAppointments(function (group) {
    //     statusControl.addLoading(group);
    // }, function (group, category, data) {
    //     if (group == 'irp') {
    //         $('.progress-bar').width((++loaded + 1) /  (apiCount + 1) * 100 + '%');
    //         if (loaded == 2) {
    //             $('.progress-bar').removeClass('bg-danger').addClass('bg-warning');
    //         } if (loaded == 5) {
    //             $('.progress-bar').removeClass('bg-warning').addClass('bg-primary');
    //         } else if (loaded == 6) {
    //             $('.progress-bar').removeClass('bg-primary').addClass('bg-success');
    //         }
    //     }
    //     decoders[group](category, data);
    // });

    $('iframe').each(function () {
        $(this).attr('src', $(this).attr('set-src'));
    });
});
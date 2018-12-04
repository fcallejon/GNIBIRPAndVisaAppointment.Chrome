'use strict'

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
        appointmentContent.style.display = 'block';
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
                $types.append('<div class="no-valid">No valid</div>');
            }

            window.statusControl.removeLoading('irp');
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

// ugly partial fix for lack of export
const decoders = new Decoders();
window.decoders = decoders;
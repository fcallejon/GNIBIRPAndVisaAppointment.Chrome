'use strict'

class Preset {
    constructor() {
        this.isInitialized = false;
        this.inputs = [];
    }

    initialize() {
        if (this.isInitialized) {
            return;
        }
        this.isInitialized = true;

        if ($('.form').attr('is-preset')) {
            this.initializePreset();

            $('.buttons .save').click(e => {
                const clicked = e.target;
                this.save(() => {
                    this.presets && (delete this.presets[this.formType]);

                    var backgroundPage = chrome.extension.getBackgroundPage();
                    if (backgroundPage) {
                        backgroundPage.preset.presets && (delete backgroundPage.preset.presets[this.formType]);
                    }

                    if ($('.form').attr('form-save')) {
                        eval($('.form').attr('form-save'));
                    }
                    else {
                        window.location.href = clicked.getAttribute('href');
                    }
                });

                return false;
            });

            $('.buttons .clear').click(() => {
                this.clear();
            });
        } else if (typeof autoForm != 'undefined') {
            this.initializeAppointment();
        }
    }

    initializePreset() {
        this.formType = $('.form').attr('form-type');
        this.storageKey = this.formType + '-form-preset';

        var $inputs = $('input, select');

        var setupCount = $inputs.length;
        $inputs.each((i, input) => {
            this.inputs.push(input);

            var dependee = eval(input.getAttribute('dependee'));

            input.hasAttribute('preload-source') && this.setSelect(this);

            dependee
                && (this.setDependee(input, dependee) || true)
                || input.nodeName == 'SELECT' && (this.setSelect(input) || true)
                || this.setInput(input);

            this.updateValue(input);

            if (!--setupCount) {
                var url = new URL(window.location.href);
                if (!url.searchParams.get('clear')) {
                    this.resumeForm(false);
                }
            }
        });
    }

    initializeAppointment() {
        autoForm.onTimeSet(() => {
            this.formType = autoForm.presetFormType;
            this.storageKey = this.formType + '-form-preset';

            this.resumeForm(true, set => {
                set && formAssistant.applyScript('$(document.body).animate({ scrollTop: $(document).height() } "slow");');
                autoForm.complete();
            });
        });
    }

    resumeForm(isAppointment, callback) {
        formStorage.retrieve(this.storageKey, formData => {
            for (var index in formData) {
                var inputData = formData[index];
                if (isAppointment && inputData.inAppointment || !isAppointment) {
                    var input = document.getElementById(inputData.id);

                    if (this.isButton(input)) {
                        isAppointment
                            ? formAssistant.applyScript('$(' + input.id + ').click();')
                            : $(input).click();
                    } else {
                        if (this.isCheckbox(input)) {
                            input.checked = !this.isValuedCheckbox(input) ? inputData.value : input.getAttribute('checked-value') == inputData.value;
                        } else if (this.isRadio(input)) {
                            input.checked = (typeof inputData.value != 'undefined') ? inputData.value : input.checked;
                        } else {
                            if ((input.id.indexOf('DD') >= 0 || input.id.indexOf('MM') >= 0)
                                && inputData.value.length < 2) {
                                inputData.value = '0' + inputData.value;
                            } else if ((input.id == 'DOB' || input.id == 'GNIBExDT') && input.value.length < 10) {
                                var digits = inputData.value.split('/');
                                inputData.value = '';
                                for (var digitIndex in digits) {
                                    var digit = digits[digitIndex];
                                    if (digit.length < 2) {
                                        inputData.value = inputData.value + '0';
                                    }
                                    inputData.value = inputData.value + digit;
                                    if (digit.length < 4) {
                                        inputData.value = inputData.value + '/';
                                    }
                                }
                            }

                            input.value = inputData.value
                        }

                        isAppointment
                            ? formAssistant.applyScript('$(' + input.id + ').change();')
                            : $(input).change()
                    }
                }
            }

            callback && callback(formData ? true : false);
        });
    }

    setSelect(select) {
        this.setSelectOptions(select);
    }

    setCheckboxValue(input, checkedValue, uncheckedValue) {
        input.value = input.checked && checkedValue || uncheckedValue;
    }

    setInput(input) {
        if (this.isCheckbox(input)) {
            var checkedValue = input.getAttribute('checked-value');
            var uncheckedValue = input.getAttribute('unchecked-value');

            this.setCheckboxValue(input, checkedValue, uncheckedValue);

            $(input).change(e => {
                this.setCheckboxValue(e.target, checkedValue, uncheckedValue);
            });
        }
    }

    isCheckbox(input) {
        return input.nodeName == 'INPUT' && input.type == 'checkbox';
    }

    isRadio(input) {
        return input.nodeName == 'INPUT' && input.type == 'radio';
    }

    isValuedCheckbox(input) {
        return this.isCheckbox(input) && input.hasAttribute('checked-value') && input.hasAttribute('unchecked-value');
    }

    isButton(input) {
        return input.nodeName == 'BUTTON' || input.nodeName == 'INPUT' && input.type == 'button';
    }

    calculateValue(input) {
        input.value = input.hasAttribute('calculated-value')
            ? eval(input.getAttribute('calculated-value'))
            : input.value;
    }

    updateValue(input) {
        var select = input.nodeName == 'SELECT' && input;
        var validWhen = eval(input.getAttribute('valid-when'));

        if (validWhen || validWhen == null) {
            input.disabled = null;
            select && this.setSelectOptions(select);
            this.calculateValue(input);
        } else {
            input.hasAttribute('always-calculate') && this.calculateValue(input);
            input.disabled = 'disable';
        }
    }

    setDependee(input, dependee) {
        input.disabled = 'disabled';
        $(dependee).change(() => {
            this.updateValue(input);
        });
    }

    setSelectOptions(select) {
        var source = eval(select.getAttribute('source'));

        if (source != select.source) {
            var currentValue = select.value;
            select.options.length = 0;

            var addOptionToSelect = (value, text) => {
                var option = document.createElement('option');
                option.value = value;
                option.text = text;
                select.appendChild(option);
            }

            addOptionToSelect('', select.getAttribute('unselected-text') || '...');

            for (var key in source) {
                var value = source[key];
                Array.isArray(value) && (value = key);
                addOptionToSelect(value, value);
                value == currentValue && (select.value = currentValue)
            }

            select.source = source;
        }
    }

    collectData() {
        var data = [];
        var marks = {};

        var currentDependants = this.inputs;
        while (Object.keys(currentDependants).length) {
            var newDependants = [];

            for (var dependantIndex in currentDependants) {
                var dependant = currentDependants[dependantIndex];

                var dependees = eval(dependant.getAttribute('dependee'));
                dependees = dependees && !Array.isArray(dependees) && [dependees];

                (!dependees || (() => {
                    var allDependees = dependees.length;

                    for (var onIndex in dependees) {
                        var dependee = dependees[onIndex];

                        marks[dependee.id]
                            && allDependees--;
                    }

                    return !allDependees;
                })())
                    && data.push({
                        id: dependant.id,
                        value: (this.isCheckbox(dependant) && !this.isValuedCheckbox(dependant) || this.isRadio(dependant))
                            ? dependant.checked
                            : dependant.value,
                        inAppointment: !dependant.hasAttribute('not-in-appointment')
                    })
                    && (marks[dependant.id] = true)
                    || newDependants.push(dependant);
            }

            currentDependants = newDependants;
        }

        return data;
    }

    getPreset(callback) {
        this.presets
            && this.presets.irp && this.presets.irp.loaded
            && this.presets.visa && this.presets.visa.loaded
            && this.presets.notification && this.presets.notification.loaded
            ? callback(this.presets)
            : (() => {
                if (!this._getPresetCallbacks || !this._getPresetCallbacks.length) {
                    this._getPresetCallbacks = [callback];
                    this.presets = {};

                    var retrieveData = (key, callback) => {
                        this.presets[key] = {};
                        formStorage.retrieve(key + '-form-preset', (data) => {
                            if (data) {
                                data.forEach(inputData => {
                                    this.presets[key][inputData.id] = inputData.value;
                                });
                                this.presets[key].loaded = true;
                            }
                            callback();
                        });
                    };

                    retrieveData('irp', () => {
                        retrieveData('notification', () => {
                            var callback;
                            while (callback = this._getPresetCallbacks.shift()) {
                                callback(this.presets);
                            }
                        });
                    });
                } else {
                    this._getPresetCallbacks.push(callback);
                }
            })();
    }

    save(callback) {
        var data = this.collectData();
        formStorage.save(this.storageKey, data, () => {
            callback && callback();
        });
    }

    clear() {
        var url = new URL(window.location.href);
        url.searchParams.set('clear', 'true');
        window.location.href = url;
    }
}

window.preset = new Preset();
$(document).ready(() => {
    window.preset.initialize();
});
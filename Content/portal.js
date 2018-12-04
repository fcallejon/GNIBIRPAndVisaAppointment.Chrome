'use strict'

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
            window.statusControl.addLoading(request.group);
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
            window.decoders.irp(request.category, request.data);
        }
    });

    $('iframe').each(function () {
        $(this).attr('src', $(this).attr('set-src'));
    });
});
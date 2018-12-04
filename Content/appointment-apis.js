var appointmentAPIs = {
    getVisaAppointmentTimeOfDateAPI: function (date, typeInitial, numberOfApplicants) {
        return 'https://reentryvisa.inis.gov.ie/website/INISOA/IOA.nsf/(getApps4DT)?openagent&dt={date}&type={type}&num={number}'
        .replace('{date}', date)
        .replace('{type}', typeInitial)
        .replace('{number}', numberOfApplicants);
    },

    
    getIrpAppointmentTimeOfDateAPI: function (type, date) {
        return `${appointmentAPIs.irp[type]}${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },

    appointmentLinks: {
        irp: 'https://burghquayregistrationoffice.inis.gov.ie/Website/AMSREG/AMSRegWeb.nsf/AppSelect?OpenForm',
        visa: 'https://reentryvisa.inis.gov.ie/website/INISOA/IOA.nsf/AppointmentSelection?OpenForm'
    },
    
    'visa': {
        // 'Individual': {
        //     url: 'https://reentryvisa.inis.gov.ie/website/INISOA/IOA.nsf/(getDTAvail)?openagent&type=I'
        // },
        
        // 'Family': {
        //     url: 'https://reentryvisa.inis.gov.ie/website/INISOA/IOA.nsf/(getDTAvail)?openagent&type=F',
        // },
        
        'Emergency': {
            getDirectData: function () {
                var today = new Date(dates.today);
                var tomorrow = new Date(new Date(dates.today).setDate(dates.today.getDate() + 1));
                var dayAfterTomorrow = new Date(new Date(tomorrow).setDate(tomorrow.getDate() + 1));
                
                return {
                    dates: [
                        today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear(),
                        tomorrow.getDate() + '/' + (tomorrow.getMonth() + 1) + '/' + tomorrow.getFullYear(),
                        dayAfterTomorrow.getDate() + '/' + (dayAfterTomorrow.getMonth() + 1) + '/' + dayAfterTomorrow.getFullYear()
                    ]
                };
            }
        }
    },
    
    'irp': {
        "Work-New": {
            url: "https://burghquayregistrationoffice.inis.gov.ie/Website/AMSREG/AMSRegWeb.nsf/(getApps4DT)?readform&cat=Work&sbcat=All&typ=New&dt=",
        },
        
        "Work-Renewal": {
            url: "https://burghquayregistrationoffice.inis.gov.ie/Website/AMSREG/AMSRegWeb.nsf/(getApps4DT)?readform&cat=Work&sbcat=All&typ=Renewal&dt=",
        },
        
        "Study-New": {
            url: "https://burghquayregistrationoffice.inis.gov.ie/Website/AMSREG/AMSRegWeb.nsf/(getApps4DT)?readform&cat=Study&sbcat=All&typ=New&dt=",
        },
        
        "Study-Renewal": {
            url: "https://burghquayregistrationoffice.inis.gov.ie/Website/AMSREG/AMSRegWeb.nsf/(getApps4DT)?readform&cat=Study&sbcat=All&typ=Renewal&dt=",
        },
        
        "Other-New": {
            url: "https://burghquayregistrationoffice.inis.gov.ie/Website/AMSREG/AMSRegWeb.nsf/(getApps4DT)?readform&cat=Other&sbcat=All&typ=New&dt=",
        },
        
        "Other-Renewal": {
            url: "https://burghquayregistrationoffice.inis.gov.ie/Website/AMSREG/AMSRegWeb.nsf/(getApps4DT)?readform&cat=Other&sbcat=All&typ=Renewal&dt=",
        }
    }
}
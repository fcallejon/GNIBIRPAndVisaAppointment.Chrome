var appointmentAPIs = {    
    getIrpAppointmentTimeOfDateAPI: function (type, date) {
        return `${appointmentAPIs.irp[type]}${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },

    appointmentLinks: {
        irp: 'https://burghquayregistrationoffice.inis.gov.ie/Website/AMSREG/AMSRegWeb.nsf/AppSelect?OpenForm'
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
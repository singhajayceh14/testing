({//NOSONAR
    doInit : function(component, event, helper) {
        var shippingCountry; 
        var accId = component.get('v.recordId'); 
        if(typeof accId !== 'undefined' && accId !== null && accId !== ""){
            var seletedPage = component.get("v.selectedPage");
            if(seletedPage == 'CPQ'){
                component.set("v.isLEX", true);
            }
            // Check is LEX or Classic 
            var getRecordType = component.get("c.getOppRecordTypes");
            getRecordType.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var storeResponse = response.getReturnValue();
                    console.log("@@@ getRecordType");
                    console.log(storeResponse);
                    component.set("v.CancellationRecordType", storeResponse.Cancellation);
                    component.set("v.OppRecordType", storeResponse.Opportunity);
                }
            });
            $A.enqueueAction(getRecordType);
            
            var action = component.get("c.fetchaccount");
            console.log('**** accId '+accId);
            action.setParams({accId : component.get('v.recordId')});
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var storeResponse = response.getReturnValue();
                    console.log("@@@ Account Info");
                    console.log(storeResponse);
                    
                    component.set("v.accountCurrency", storeResponse[0].Account_Currency__c);
                    component.set("v.selectedValue", storeResponse[0].Account_Currency__c);
                    component.set("v.Account", storeResponse[0]);
                    shippingCountry= storeResponse[0].ShippingCountry; 
                    console.log("storeResponse",storeResponse);
                    component.set("v.shippingCountry", shippingCountry);
                    
                }
            });
            $A.enqueueAction(action);
            var action2 = component.get("c.fetchdealtype");
            action2.setParams({accId : component.get('v.recordId')});
            action2.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var storeResponse = response.getReturnValue();
                    var responseList=[];
                    for(var i=0;i<storeResponse.length;i++)
                    {
                        if(storeResponse[i]=="Early Stage"){
                            responseList.push ({ label: storeResponse[i], value: storeResponse[i] }); // new deal type added
                        }else{
                            responseList.push ({ label: (storeResponse[i]=="Refinitiv Access"?"Refinitiv Access":"Non-R.A. Full Quote"), value: storeResponse[i] });
                            //responseList.push ({ label: (storeResponse[i]), value: storeResponse[i] });
                        }
                        
                    }                              
                    console.log("responseList",responseList);
                    component.set("v.listofDeal", responseList);
                    
                    // component.set("v.selectedDeal", storeResponse[0]);
                    let dealtype1 = storeResponse[0];
                    var action3 = component.get("c.fetchdealcurrency");
                    action3.setParams({
                        dtype: dealtype1,
                        shippingCountry: shippingCountry
                    });
                    action3.setCallback(this, function(response) {
                        var state = response.getState();
                        if (state === "SUCCESS") {
                            var storeResponse = response.getReturnValue();
                            
                            component.set("v.listofcurrency", storeResponse);
                            
                        }
                    });
                    $A.enqueueAction(action3);
                    
                }
            });
            $A.enqueueAction(action2);
            
            //Fetch Opportunity Stage Picklist Values
            var action4 = component.get("c.getPicklistvalues");
            action4.setParams({
                'objectName': 'Opportunity',
                'field_apiname': 'StageName',
                'nullRequired': true
            });
            action4.setCallback(this, function(a) {
                var state = a.getState();
                if (state === "SUCCESS"){
                    component.set("v.StagePicklist", a.getReturnValue());
                }
            });
            $A.enqueueAction(action4);
        }
        
    },
    handleCreateLoad: function (component, event, helper) {
        var fields = component.find("AccountIdField");
        console.log("@@@ Account Fields method :: ");
        console.log(fields);
        var nameFieldValue = component.find("AccountIdField").set("v.value", component.get('v.recordId'));
        var currFieldValue = component.find("CurrencyIsoCodeField").set("v.value", component.get('v.accountCurrency'));
    },
    handleCancelCreateLoad: function (component, event, helper) {
        var fields = component.find("AccountIdField");
        console.log("@@@ Account Fields method :: ");
        console.log(fields);
        var nameFieldValue = component.find("AccountIdField").set("v.value", component.get('v.recordId'));
        var currFieldValue = component.find("CurrencyIsoCodeField").set("v.value", component.get('v.accountCurrency'));
        
    },
    handleClickBAU : function(component, event, helper) {
        var selectedPage = component.get('v.selectedPage'); 
        component.set('v.selectedDeal','');
        if(selectedPage == 'Page1'){
            component.set('v.BorderColorBAU','border-width: 3px;border-style: solid;border-color: rgba(0, 112, 210, 1);border-radius: 4px;');
            component.set('v.BorderColorCPQ','');
            component.set('v.BorderColorCancel','');
            component.set('v.DivName','BAU');
        }else{
            component.set('v.BorderColorStage','border-width: 3px;border-style: solid;border-color: rgba(0, 112, 210, 1);border-radius: 4px;');
            component.set('v.BorderColorAccess','');
            component.set('v.BorderColorQuote','');
            component.set('v.DivName','Early Stage');
            component.set('v.Stage','1. Appointment Scheduled');
            component.set('v.selectedDeal','Commercial');            
        }
        component.set('v.viewMode',true);
        component.set('v.viewMode1',false);
        component.set('v.viewMode2',false);
    },
    handleClickCPQ : function(component, event, helper) {
        var selectedPage = component.get('v.selectedPage');  
        if(selectedPage == 'Page1'){  
            component.set('v.BorderColorBAU','');
            component.set('v.BorderColorCPQ','border-width: 3px;border-style: solid;border-color: rgba(0, 112, 210, 1);border-radius: 4px;');
            component.set('v.BorderColorCancel','');
            component.set('v.DivName','CPQ');
        }else{
            component.set('v.BorderColorStage','');
            component.set('v.BorderColorAccess','border-width: 3px;border-style: solid;border-color: rgba(0, 112, 210, 1);border-radius: 4px;');
            component.set('v.BorderColorQuote','');
            component.set('v.DivName','Refinitiv Access');
            component.set('v.Stage','1. Appointment Scheduled');
            component.set('v.selectedDeal','Refinitiv Access');            
            component.set('v.selectedDeal','Refinitiv Access');
            component.set('v.Stage','1. Appointment Scheduled');
        }
        component.set('v.viewMode',false);
        component.set('v.viewMode1',true);
        component.set('v.viewMode2',false);
    },
    handleClickCancel : function(component, event, helper) {
        var selectedPage = component.get('v.selectedPage');  
        if(selectedPage == 'Page1'){  
            component.set('v.BorderColorBAU','');
            component.set('v.BorderColorCPQ','');
            component.set('v.BorderColorCancel','border-width: 3px;border-style: solid;border-color: rgba(0, 112, 210, 1);border-radius: 4px;');
            component.set('v.DivName','Cancel');
        }else{
            component.set('v.BorderColorStage','');
            component.set('v.BorderColorAccess','');
            component.set('v.BorderColorQuote','border-width: 3px;border-style: solid;border-color: rgba(0, 112, 210, 1);border-radius: 4px;');
            component.set('v.DivName','Commercial');
            component.set('v.Stage','1. Appointment Scheduled');
            component.set('v.selectedDeal','Commercial');
        }
        component.set('v.viewMode',false);
        component.set('v.viewMode1',false);
        component.set('v.viewMode2',true);
    },
    SaveRecord : function(component, event, helper) {
        var DivName = component.get('v.DivName');
        component.set('v.viewMode',false);
        component.set('v.viewMode1',false);
        component.set('v.viewMode2',false);
        if(DivName == 'CPQ'){
            component.set('v.selectedPage','CPQ');
        }else if(DivName == 'Early Stage' || DivName == 'Commercial' || DivName == 'Refinitiv Access'){
            component.set('v.selectedPage','Form');
        }else if(DivName == 'BAU' ){
            component.set('v.selectedPage','BAU');
        }else if(DivName == 'Cancel'){
            component.set('v.selectedPage','Cancel');
        }
    },
    closeModel : function(component, event, helper){
        var accrecordId1 = component.get('v.recordId')
        window.location = '/'+accrecordId1;
    },
    
    handleOnSuccess : function(component, event, helper) {
        var record = event.getParam("response");
        var recordId = record.id;
        console.log('Record Id - ' + recordId); 
        window.location = '/'+recordId;
    },
    handleChange: function(component, event, helper) {
        var dealtype = component.get('v.selectedDeal');
        var shippingCountryHC = component.get("v.shippingCountry");
        
        var action = component.get("c.fetchdealcurrency");
        action.setParams({
            dtype: dealtype,
            shippingCountry: shippingCountryHC
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                console.log("@@@@ storeResponse::");
                console.log(storeResponse);
                component.set("v.listofcurrency", storeResponse);
                var accCurr = component.get("v.accountCurrency");
                console.log("@@@ accCurr :: ", accCurr);
                if(storeResponse != null && storeResponse.length > 0){
                    if(!storeResponse.includes(accCurr)){
                        console.log("@@@ storeResponse accCurr not find:: ");
                        component.set("v.accountCurrency","USD");
                        component.set("v.selectedValue", "USD");
                    }else{
                        component.set("v.accountCurrency",accCurr);
                        component.set("v.selectedValue", accCurr);
                    }
                }
                
                
                console.log("@@@ after accCurr :: ", component.get("v.selectedValue"));
                if('Commercial' == dealtype){
                    //component.set("v.selectedValue", storeResponse[0]);
                } else{
                    
                    //component.set("v.selectedValue", "USD");
                }
                
            }
        });
        $A.enqueueAction(action);
    },
    //NOSONAR
    handleClick : function(component, event, helper){
        var accrecordId = component.get('v.recordId')
        
        var Opptycurrency = component.get('v.selectedValue');
        var Dealtype = component.get('v.selectedDeal'); //component.find("mySelect2").get("v.value");
        var DivName =  component.get('v.DivName');
        var closeDate = component.get('v.opptyCloseDate');
        var stageName = component.get('v.Stage');
        var IsEarlyStage = false;
        
        if(DivName == 'Early Stage')
            IsEarlyStage = true
            var opptyName = component.find("opptyName").get("v.value");
        window.location = '/apex/CommonPageAction?id='+accrecordId+'&Opptycurrency='+Opptycurrency+'&dealtype='+Dealtype+'&IsEarlyStage='+IsEarlyStage+'&enddate='+closeDate+'&stagename='+stageName+'&opptyName='+ encodeURIComponent(opptyName)+'&SObjectName=Account&operationClass=CurrencyCapturePageActionHandler.PACopptyquotehandler'
        
    },
    onLoad : function(component, event, helper){
        console.log('@@@ onLoad method');
        console.log(event);
        console.log(component);
    }
})

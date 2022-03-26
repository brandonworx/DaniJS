/*
    DaniJS CORE
    By: Brandonworx
    Date: 02-16-2022

    This is the core of DaniJS. Nothing in this file SHOULD need to be modified unless you don't like the default paths DaniJS comes configured with.
    In the case you need to change the path the framework looks for modules, views, etc, simply modify the variables in the config file ( dani-config.js ).
    ***DO NOT*** CHANGE ANYTHING IN THIS FILE.
*/

//SYSTEM DATA
let isViewLoaded = false;
let currentView = null;

//ERROR AND NOTIFICATION HANDLER FOR DaniJS
const CONSOLEPREFIX = "[DANI-CORE]: ";

/**
 * @name daniLog
 * @description Display a log message in the browser console with formatting
 * @param {string} message 
 * @returns {void}
 */
function daniLog(message){
    console.log(CONSOLEPREFIX + message);
}

/**
 * @name daniWarn
 * @description Display a warning message in the browser console with formatting
 * @param {string} message 
 * @returns {void}
 */
function daniWarn(message){
    console.warn(CONSOLEPREFIX + message);
}

/**
 * @name daniError
 * @description Display an error message in the browser console with formatting
 * @param {string} message 
 * @returns {void}
 */
function daniError(message){
    console.error(CONSOLEPREFIX + message);
}

/**
 * @name daniDebug
 * @description Display a debug message in the browser console with formatting
 * @param {string} message 
 * @returns {void}
 */
function daniDebug(message){
    console.debug(CONSOLEPREFIX + message);
}

/**
 * @name daniInfo
 * @description Display an info message in the browser console with formatting
 * @param {string} message 
 * @returns {void}
 */
function daniInfo(message){
    console.info(CONSOLEPREFIX + message);
}

/**
 * @name daniModLoaded
 * @description Displays a confirmation message in the browser console with formatting once a given module is loaded
 * @param {string} module 
 * @returns {void}
 */
function daniModLoaded(module){
    daniLog("MODULE <"+module+"> LOADED");
}

/**
 * @name daniRemoveModuleError
 * @description Displays an error message in the browser console with formatting once a given module could not be removed from the DOM
 * @param {string} module 
 * @returns {void}
 */
function daniRemoveModuleError(module){
    daniError("UNABLE TO REMOVE MODULE <"+module+">");
}

/**
 * @name daniModuleNotExist
 * @description Displays an error message in the browser console with formatting once a given module is not found within the DOM
 * @param {string} module 
 * @returns {void}
 */
function daniModuleNotExist(module){
    daniError("MODULE <"+module+"> DOES NOT EXIST WITHIN THE CURRENT VIEW SCOPE");
}

/**
 * @name daniErrorGeneric
 * @description Displays a generic error message in the browser console with formatting
 * @returns {void}
 */
function daniErrorGeneric(){
    daniError("AN ERROR WAS ENCOUNTERED DURING EXECUTION");
}

/**
 * @name daniModuleRemoved
 * @description Displays a confirmation message in the browser console with formatting once a given module is removed from the DOM
 * @param {string} module 
 * @returns {void}
 */
function daniModuleRemoved(module){
    daniInfo("MODULE <"+module+"> WAS REMOVED FROM DOM");
}

/**
 * @name loadModules
 * @description Loads modules in order for a predetermined "view"
 * @returns {bool} "true" upon completion of loading modules; "false" upon error
 */
async function loadModules(){
    var parser = new DOMParser();
    var moduleList = document.querySelectorAll('[class="mod"]');
    var moduleScriptData = document.createElement("script");
    for (let i = 0; i < moduleList.length; i++){
        try{
            var currentModule = moduleList[i].tagName.toLowerCase();
            await fetch(MODULEDIRECTORY+'/'+currentModule+'/'+currentModule+'.html')
            .then(res => {
                return res.text();
            })
            .then(data => {
                var modData = parser.parseFromString(data, 'text/html');
                if ( modData.title.includes("404") ){
                    daniModuleNotExist(currentModule);
                    return false;
                }
                else{
                    var openingModuleTag = "<"+currentModule+">";
                    var closingModuleTag = "</"+currentModule+">";
                    var openingScriptTag = "<script>";
                    var closingScriptTag = "</script>";
                    var moduleHTML = data.substring(data.indexOf(openingModuleTag)+openingModuleTag.length, data.lastIndexOf(closingModuleTag)-closingModuleTag.length);
                    if ( data.substring(data.indexOf(openingScriptTag)) ){
                        var moduleScript = data.substring(data.indexOf(openingScriptTag)+openingScriptTag.length, data.lastIndexOf(closingScriptTag));
                        moduleScriptData.innerHTML = moduleScriptData.innerHTML + moduleScript;
                    }
                    moduleList[i].innerHTML = moduleHTML;
                    daniModLoaded(currentModule);
                }
            });
        }
        catch{
            daniErrorGeneric();
            return false;
        }
    }
    document.body.append(moduleScriptData);
    return true;
}

/**
 * @name removeModule
 * @description Removes a targeted module from the DOM
 * @param {string} targetModule 
 * @returns {bool} "true" upon success; "false" upon failure
 */
function removeModule(targetModule){
    if ( document.getElementsByTagName(targetModule)[0] ){
        document.getElementsByTagName(targetModule)[0].remove();
        if ( !document.getElementsByTagName(targetModule)[0] ){
            daniModuleRemoved(targetModule);
            return true;
        }
        else{
            daniRemoveModuleError(targetModule);
            return false;
        }
    }
    else{
        daniModuleNotExist(targetModule);
        return false;
    }
}

/**
 * @name setView
 * @description Sets the current view using give targetView - Given string must be a valid view from mortalink-views.js
 * @param {string} targetView 
 * @returns {bool} "true" upon success; "false" upon failure
 */
function setView(targetView){
    isViewLoaded = false;
    document.body.innerHTML = "";
    targetView.forEach(function(item){
        var module = document.createElement(item);
        document.body.appendChild(module);
        document.getElementsByTagName(item)[0].classList.add("mod");
    });
    if ( loadModules() ){
        isViewLoaded = true;
        currentView = targetView;
        return true;
    }
    else{
        isViewLoaded = false;
        return false;
    }
}

/**
 * @name setg
 * @description Creates a global variable that will be tracked across all views and modules
 * @param {string} variable The name of the variable to set as a string
 * @param {string, int, bool, float} Value The value of the varible to set as any data type
 * @returns {bool} "true" upon success; "false" upon failure
 */
 function setg(variable, value){
    if ( window.sessionStorage.getItem(variable) ){
        return false;
    }
    else{
        window.sessionStorage.setItem(variable, value);
        return true;
    }
}

/**
 * @name getg
 * @description Retruns the value of a previous set variable using the give variable name
 * @param {string} variable The name of the previously set global variable
 * @returns {string} A stringified version of the previously saved data
 */
function getg(variable){
    return window.sessionStorage.getItem(variable);
}

/**
 * @name updateg
 * @description Updates the value of a previously set global variable.
 * @param {string} variable 
 * @param {string, int, bool, float} value 
 * @returns {bool} Returns true if the varible was previously set and updated, false if the variable was not previously set and not written to
 */
function updateg(variable, value){
    if ( window.sessionStorage.getItem(variable) ){
        window.sessionStorage.setItem(variable, value);
        return true;
    }
    else{
        return false;
    }
}

/*****HOTFIXES*****/
//Background Scaling
function hotfix_backgroundScaling(){
    //ADJUST BACKGROUND IMAGE HEIGHT DEPENDING ON DEVICE SCREEN HEIGHT
    if ( (window.screen.width / window.screen.height ) < 1 ){
        document.body.style.backgroundSize = "1280px 100vh";
    }
}

//LISTENERS
    //LOAD
    window.addEventListener("load", function(){
        //INITIAL VIEW TO LOAD
        setView(DEFAULTVIEW);
        
        //HOTFIXES
        hotfix_backgroundScaling();
    });
'use strict';

var _nv_hm = (function (window, _nv_hm, undefined) {
    return _nv_hm;
})(window, _nv_hm || {});

//manual call
_nv_hm.manual = (function (window, undefined) {
    var document = window.document;
    var manual = {};

    manual.launch = function () {
        _nv_hm.utils.browser();
        _nv_hm.data.auth = {};
        _nv_hm.data.settings = {};
        _nv_hm.data.settings = notify_visitors.data.auth;
        //dynamic tokens
        _nv_hm.data.tokens = {};
        if (_nv_hm.tokens && typeof _nv_hm.tokens === 'object') {
            Object.keys(_nv_hm.tokens).forEach(function (token) {
                _nv_hm.data.tokens[token.toLowerCase()] = _nv_hm.tokens[token];
            });
        }
        //split variation data
        _nv_hm.data.abTest = {};
        _nv_hm.data.abTest._s_cid = _nv_hm.utils.splitCampaignCheck("_s_cid");
        _nv_hm.data.abTest._s_vid = _nv_hm.utils.splitCampaignCheck("_s_vid");

        var iFrameDetection = (window === window.parent) ? false : true;
        if (iFrameDetection === false) {
            var noApi = _nv_hm.utils.getParams("nvCheck"); // preventing the code from running in the dashboard preview
            if (!(noApi && noApi === 'noAPI')) {
                _nv_hm.data = {};
                _nv_hm.manual.webSettingsResponse(_notify_serverResponse.h.data);
            }

            setTimeout(function () {
                _nv_hm.utils.removeHiddenElement();
            }, 2000);

        } else {
            _nv_hm.utils.removeHiddenElement();

            var url = window.location.href;
            var result = _nv_hm.utils.getParams("type", url);
            if (result === 'preview') {
                var paintHm = document.createElement('script');
                paintHm.setAttribute('src', notify_visitors.data.js_urls.hm);
                document.getElementsByTagName('head')[0].appendChild(paintHm);
            }

            //ab testing
            if (_nv_hm.utils.checkParams({
                check: '1'
            })) {
                var editor = document.createElement('script');
                editor.setAttribute('src', notify_visitors.data.js_urls.ab);
                document.getElementsByTagName('head')[0].appendChild(editor);
            }
        }
    };

    manual.webSettingsResponse = function (output) {
        if (output.Authentication == 'fail') {
            return false;
        }
        // this is because we want to record the time on whole site
        _nv_hm.getdata.loadListner();
        _nv_hm.getdata.timeOnSite();

        _nv_hm.data.heatMap = false;
        _nv_hm.data.cookie_path = window.location.pathname;

        var check = _nv_hm.manual.checkOutput(output);

        if (check.heatMap) {
            // set heatMap enable true
            _nv_hm.data.heatMap = true;

            document.addEventListener("click", _nv_hm.getdata.clicks);
            document.addEventListener('mousemove', _nv_hm.getdata.mflow);
            document.addEventListener('scroll', _nv_hm.getdata.scroll);

        }

        if (check.recording) {
            _nv_hm.nvRecording.init();
        }

        if (check.heatMap || check.abTest || check.form_data || check.split || check.recording) {
            _nv_hm.getdata.oDomain = output.domain;
            window.addEventListener('unload', _nv_hm.getdata.saveData, false);
        }

        // split url redirect upper function
        if (check.split) {
            var splitTest = output.abTest;
            if (splitTest.campDetail.hasOwnProperty("splitRedirection")) {
                _nv_hm.data.abTest.cid = _nv_hm.data.abTest._s_cid;
                _nv_hm.data.abTest.vid = _nv_hm.data.abTest._s_vid;
                _nv_hm.data.abTest.c_e_ts = splitTest.campDetail.e_ts;
            } else if (splitTest.hasOwnProperty('variation') && splitTest.variation.hasOwnProperty("content")) {
                _nv_hm.data.abTest.cid = splitTest.variation.campaignID;
                _nv_hm.data.abTest.vid = splitTest.variation.variationID;
                _nv_hm.splitUrl.init(splitTest);
            }

            if (splitTest.hasOwnProperty('goals') && splitTest.goals && typeof splitTest.goals === 'object') {
                _nv_hm.goals.init(splitTest.goals);
            }
        }

        // set abTest enable true
        if (check.abTest) {
            var abTest = output.abTest;

            // init the variations module
            if (abTest.hasOwnProperty('variation') && abTest.variation && typeof abTest.variation === 'object') {
                _nv_hm.data.abTest.cid = abTest.variation.campaignID;
                _nv_hm.data.abTest.vid = abTest.variation.variationID;
                _nv_hm.data.abTest.c_e_ts = abTest.campDetail.e_ts;

                _nv_hm.variation.init(abTest.variation);
            }

            // init the goal module 
            // typeof null in javascript is also object that why we add the check for abTest.goals
            if (abTest.hasOwnProperty('goals') && abTest.goals && typeof abTest.goals === 'object') {
                _nv_hm.goals.init(abTest.goals);
            }
        }

        _nv_hm.utils.removeHiddenElement();

        // set formAnalysis enable
        if (check.form_data) {
            _nv_hm.getdata.form_id = output.form_data.form_id;
            _nv_hm.getdata.field_id = output.form_data.id;
            _nv_hm.getdata.form_button = output.form_data.button;


            if (_nv_hm.getdata.field_id) {
                /**
                 * each field id is added with a custom attribute "nvform"
                 * each button id is added with a custom attribute "nvbtn"
                 * values of these attributes are the id of the form to which they are associated
                 */
                Object.keys(_nv_hm.getdata.field_id).forEach(function (element) {
                    for (var i = 0; i < _nv_hm.getdata.field_id[element].length; i++) {
                        var currentNode = document.getElementById(_nv_hm.getdata.field_id[element][i]);
                        if (currentNode != null) {
                            var preAttr = currentNode.getAttribute("nvform");
                            preAttr ? currentNode.setAttribute("nvform", preAttr + "-" + element) : currentNode.setAttribute("nvform", element);
                        }
                    }
                });

                // adding listeners to all the elements with "nvform" attribute
                _nv_hm.getdata.id_node = Array.prototype.slice.call(document.querySelectorAll('[nvform]'));
                for (var i = 0; i < _nv_hm.getdata.id_node.length; i++) {
                    _nv_hm.getdata.id_node[i].addEventListener("focus", _nv_hm.getdata.formFocus);
                    _nv_hm.getdata.id_node[i].addEventListener("blur", _nv_hm.getdata.formBlur);

                    // these id's gets pulled when there is some value in that field
                    var attr = _nv_hm.getdata.id_node[i].getAttribute("nvform");
                    var attrA = attr.split("-");
                    _nv_hm.getdata.formLeftBlank[_nv_hm.getdata.id_node[i].id] = { 'formId': attrA };

                    // by default drop off of each form is page
                    if (!(_nv_hm.getdata.dropOf.hasOwnProperty(attr))) {
                        _nv_hm.getdata.dropOf[attr] = "nvPage";
                    }

                }

                if (_nv_hm.getdata.form_button) {
                    Object.keys(_nv_hm.getdata.form_button).forEach(function (element) {
                        var currentNode = document.getElementById(_nv_hm.getdata.form_button[element]);
                        if (currentNode != null) {
                            var preAttr = currentNode.getAttribute("nvbtn");
                            preAttr ? currentNode.setAttribute("nvbtn", preAttr + "-" + element) : currentNode.setAttribute("nvbtn", element);
                        }
                    });
                    // adding listeners to all the elements with "nvbtn" attribute
                    _nv_hm.getdata.btn_node = Array.prototype.slice.call(document.querySelectorAll('[nvbtn]'));
                    for (var i = 0; i < _nv_hm.getdata.btn_node.length; i++) {
                        _nv_hm.getdata.btn_node[i].addEventListener("click", _nv_hm.getdata.formbtn);
                    }
                }
            }

            //sort the position of form id's according to the nodes in dom
            _nv_hm.getdata.id_node.sort(function (a, b) {
                return a.isEqualNode(b) ? 0 : (a.compareDocumentPosition(b) === 2 ? 1 : -1);
            });
        }
    };

    /**
     * check for abTest and heatMap enable condition
     * @param {object} output
     * @returns {object} return a object with property abTest and heatMap 
     *                   if their conditon satisfy then their values will be true else false
     */
    manual.checkOutput = function (output) {
        var retObj = {
            abTest: false,
            heatMap: false,
            form_data: false,
            split: false
        };

        //check for haetMap
        if (typeof output.heatmaps === 'object' && output.heatmaps.hasOwnProperty('status')) {
            retObj.heatMap = true;
        }
        // check for abTest
        if (output.hasOwnProperty('abTest') && output.abTest && typeof output.abTest === 'object') {
            if (output.abTest.campDetail.type == "1") {
                retObj.split = true;
            } else {
                retObj.abTest = true;
            }
        }

        // check for form analysis
        if (output.hasOwnProperty('form_data') && typeof output.form_data === 'object' && output.form_data.form_id.length > 0) {
            retObj.form_data = true;
        }

        // check for user recording
        if (output.hasOwnProperty('recording') && typeof output.recording === 'object' && output.recording.hasOwnProperty('status')) {
            retObj.recording = true;
        }

        return retObj;
    };

    return manual;
})(window);

_nv_hm.variation = (function () {
    function init(abObj) {
        if (abObj.content) {
            var res = JSON.parse(abObj.content);
            if (res && typeof res === 'object') {
                Object.keys(res).forEach(function (key) {
                    manipulateDom(key, res[key]);
                });
            }
        }
    }
    function checkDynamicValue(textVal, tokens) {
        var matchRegx = /\[\[(.+?)\]\]/g;
        var dynamicKeys = textVal.match(matchRegx);
        if (dynamicKeys !== null) {
            dynamicKeys.forEach(function (dKey) {
                var tokenKey = dKey.substring(2, dKey.length - 2);
                var tokenKeyL = tokenKey.toLowerCase();
                if (tokens.hasOwnProperty(tokenKeyL) && tokens[tokenKeyL]) {
                    textVal = textVal.replace(dKey, tokens[tokenKeyL]);
                } else {
                    textVal = textVal.replace(dKey, '');
                }
            });
        }
        return textVal;
    }

    /**
     *
     * @param {string} selector
     * @param {string} changes
     * @return {Promise} 
     */
    function manipulateDom(selector, changeObj) {
        if (changeObj && typeof changeObj === 'object') {
            Object.keys(changeObj).forEach(function (changeType) {
                var el = document.querySelector(selector);
                if (el) {
                    if (changeType === 'styleChange') {
                        Object.keys(changeObj[changeType]).forEach(function (cssProp) {
                            var returnText = checkDynamicValue(changeObj[changeType][cssProp], _nv_hm.data.tokens);
                            if (returnText) {
                                el.style[cssProp] = returnText;
                            }
                        });
                    }
                    if (changeType === 'textChange') {
                        var returnText = checkDynamicValue(changeObj[changeType], _nv_hm.data.tokens);
                        if (returnText) {
                            el.innerText = returnText;
                        }
                    }
                    if (changeType === 'imageChange') {
                        Object.keys(changeObj[changeType]).forEach(function (key) {
                            var returnText = checkDynamicValue(changeObj[changeType][key], _nv_hm.data.tokens);
                            if (returnText) {
                                el.setAttribute(key, returnText);
                            }
                        });
                    }
                    if (changeType === 'changePosition') {
                        if (_nv_hm.env.getEnv() && _nv_hm.env.getEnv() === changeObj[changeType].env) {
                            el.style.transform = changeObj[changeType].changes;
                        }
                    }
                    if (changeType === 'displayChanges') {
                        var key = Object.keys(changeObj[changeType])[0];
                        el.setAttribute(key, changeObj[changeType][key]);
                        el.style.visibility = 'hidden';
                    }
                    if (changeType === 'pasteElement') {
                        var pasteObj = changeObj[changeType];
                        if (pasteObj && typeof pasteObj === 'object' &&
                            pasteObj.insertType &&
                            pasteObj.insertType.includes('Insert')) {
                            var typeOfPaste = pasteObj.insertType.split('::')[1];
                            if (typeOfPaste && pasteObj.newTargetEl) {
                                if (typeOfPaste === 'Before') {
                                    el.parentNode.insertBefore(_nv_hm.utils.toDOM(pasteObj.newTargetEl), el);
                                } else if (typeOfPaste === 'After') {
                                    el.parentNode.insertBefore(_nv_hm.utils.toDOM(pasteObj.newTargetEl), el.nextSibling);
                                }
                            }
                        }
                    }
                    if (changeType === 'textNodeChange') {
                        Object.keys(changeObj[changeType]).forEach(function (nodeChange) {
                            var objIndex = parseInt(nodeChange);
                            Array.prototype.forEach.call(el.childNodes, function (child, index) {
                                if (index === objIndex) {
                                    child.nodeValue = changeObj[changeType][objIndex];
                                }
                            });
                        });
                    }
                    if (changeType === 'linkChange') {
                        var returnText = checkDynamicValue(changeObj[changeType], _nv_hm.data.tokens);
                        if (returnText) {
                            el.setAttribute('href', returnText);
                        }
                    }
                    if (changeType === 'sortable') {
                        _nv_hm.utils.resetChildOrder(el);
                        _nv_hm.utils.rearrangeChilderns(el, changeObj[changeType])
                    }
                    if (changeType === 'reArrange') {
                        _nv_hm.utils.resetDragAndDrop(changeObj[changeType].old, changeObj[changeType].new);
                    }
                }
            });
        }
    }
    return {
        init: init
    };
})(window);

_nv_hm.env = (function () {
    var env = {};
    env.getEnv = function () {
        var width = document.body.clientWidth;
        if (width >= 992) {
            return 'desktop'
        } else if (992 > width && width >= 567) {
            return 'tablet'
        } else if (width < 567) {
            return 'mobile'
        }
        return null;
    }
    return env;
})();

// split url prototype function's
_nv_hm.splitUrl = (function () {
    var splitObject = {};
    // checking status
    function init(splitObjectObject) {
        splitObject = splitObjectObject;
        if (splitObject.campDetail.status) {
            redirectToLink();
        }
    }

    //redirect to variation
    function redirectToLink() {
        var anchorTag = document.createElement("a");
        document.body.appendChild(anchorTag);
        anchorTag.setAttribute("type", "hidden");
        anchorTag.setAttribute("rel", "nofollow");
        anchorTag.href = appendKey(splitObject.variation.content);
        anchorTag.click();
        if (_nv_hm.data.isIE)
            anchorTag.parentNode.removeChild(anchorTag);
        else
            anchorTag.remove();
    }

    //append query parameter
    function appendKey(path) {
        if (path.split("?").length <= 1) {
            path = path + "?_s_cid=" + _nv_hm.data.abTest.cid + "&_s_vid=" + _nv_hm.data.abTest.vid;
        } else {
            path = path + "&_s_cid=" + _nv_hm.data.abTest.cid + "&_s_vid=" + _nv_hm.data.abTest.vid;
        }
        return path;
    }

    return {
        init: init
    };

})(window);

/**
* recording functions begins
*/
_nv_hm.nvRecording = (function () {
    var recRef;
    var recData = {
        actionsSet: '',
        currActionSet: '',
        currTime: '',
        currTimeSlot: '',
        recStartTime: '',
    };
    var rec_timeout;
    function uniqueRecId() {
        var key, recCookie = sessionStorage.getItem('_nv_rec_');
        if (typeof recCookie === 'string' && recCookie.length > 0) {
            key = recCookie;
            _nv_hm.getdata.updateType = 1;
        } else {
            key = _nv_hm.utils.guid();
            sessionStorage.setItem('_nv_rec_', key);
        }
        return key;
    };

    function RecordableDrawing() {
        var self = this;
        this.canvas = null;
        this.width = this.height = 0;
        this.actions = new Array();
        this.mouseDown = false;
        this.mouse = true;
        this.currentRecording = null; //instance of Recording
        this.recordings = new Array(); //array of Recording objects
        this.lastMouseX = this.lastMouseY = -1;
        this.bgColor = "rgb(255,255,255)";
        RecordableDrawing.onMouseMove = function (event) {
            var x = Math.floor(event.pageX);
            var y = Math.floor(event.pageY);
            var currAction = new Point(x, y, 0);
            if (self.currentRecording != null)
                self.currentRecording.addAction(currAction);

            // stop recording after 3 minutes of inactive session  
            clearTimeout(rec_timeout);
            rec_timeout = setTimeout(function () {
                recRef.stopRecording();
            }, 180000);

        }

        RecordableDrawing.onClickRec = function (event) {
            var x = Math.floor(event.pageX);
            var y = Math.floor(event.pageY);
            var ce = _nv_hm.utils.selectorQuery(event.target); // css selector of element

            var currAction = new Point(x, y, 1, ce);
            if (self.currentRecording != null)
                self.currentRecording.addAction(currAction);
        }
        RecordableDrawing.onScroll = function (event) {
            var x = 0;
            var y = Math.floor(window.scrollY);
            var currAction = new Point(x, y, 2);
            if (self.currentRecording != null)
                self.currentRecording.addAction(currAction);
            event.preventDefault();
        }

        this.startRecording = function () {
            self.currentRecording = new Recording(this);
            self.recordings = new Array();
            self.recordings.push(self.currentRecording);
            self.currentRecording.start();
        }
        this.stopRecording = function () {
            if (self.currentRecording != null)
                self.currentRecording.stop();
            self.currentRecording = null;
        }

        RecordableDrawing.__init = function () {
            self.canvas = window.document;
            if (self.canvas.length == 0) {
                alert("No canvas with id " + canvasId + " found");
                return;
            }
            self.width = self.canvas.offsetHeight;
            self.height = self.canvas.offsetHeight;
            document.addEventListener("mousemove", RecordableDrawing.onMouseMove);
            document.addEventListener("click", RecordableDrawing.onClickRec, true);
            window.addEventListener('scroll', RecordableDrawing.onScroll);
        }
        RecordableDrawing.__init();
    }

    function Recording(drawingArg) {
        var self = this;
        this.drawing = drawingArg;
        this.timeSlots = new Object(); //Map with key as time slot and value as array of Point objects
        this.buffer = new Array(); //array of Point objects 
        this.timeInterval = 100; //10 miliseconds
        this.currTime = 0;
        this.started = false;
        this.intervalId = null;
        this.currTimeSlot = 0;
        this.actionsSet = null;
        this.currActionSet = null;
        this.recStartTime = null;
        this.pauseInfo = null;
        this.start = function () {
            self.currTime = 0;
            self.currTimeSlot = -1;
            self.actionsSet = null;
            self.pauseInfo = null;
            self.recStartTime = (new Date()).getTime();
            self.intervalId = window.setInterval(self.onInterval, self.timeInterval);
            self.started = true;
        }

        this.stop = function () {
            if (self.intervalId != null) {
                window.clearInterval(self.intervalId);
                self.intervalId = null;
            }
            self.started = false;
            recData.currTime = self.currTime;
            recData.started = self.started;
            recData.intervalId = self.intervalId;
            recData.currTimeSlot = self.currTimeSlot;
            recData.actionsSet = self.actionsSet;
            recData.currActionSet = self.currActionSet;
            recData.recStartTime = self.recStartTime;
            console.log(recData);
        }

        this.onInterval = function () {
            if (self.buffer.length > 0) {
                var timeSlot = (new Date()).getTime() - self.recStartTime;
                if (self.currActionSet == null) {
                    self.currActionSet = new ActionsSet(timeSlot, self.buffer);
                    self.actionsSet = self.currActionSet;
                }
                else {
                    var tmpActionSet = self.currActionSet;
                    self.currActionSet = new ActionsSet(timeSlot, self.buffer);
                    tmpActionSet.next = self.currActionSet;
                }

                self.buffer = new Array();
            }
            self.currTime += self.timeInterval;
        }

        this.addAction = function (actionArg) {
            if (!self.started)
                return;
            self.buffer.push(actionArg);
        }
    }

    function Action() {
        var self = this;
        this.actionType; // 1 - Point, other action types could be added later
        this.x = 0;
        this.y = 0;
        this.isMovable = false;
        this.index = 0;

        if (arguments.length > 0) {
            self.actionType = arguments[0];
        }
        if (arguments.length > 2) {
            self.x = arguments[1];
            self.y = arguments[2];
        }
        if (arguments[3]) {
            this.elem = '';
            self.elem = arguments[3]
        }
    }
    /**
     * elem = css selector of element
     */
    function Point(argX, argY, typeArg, elem) {
        var self = this;
        this.type = typeArg; //0 - moveto, 1 - lineto
        Action.call(this, 1, argX, argY, elem);
    }

    Point.prototype = new Action();
    function ActionsSet(interalArg, actionsArrayArg) {
        var self = this;
        this.actions = actionsArrayArg;
        this.interval = interalArg;
        this.next = null;
        // console.log(this);
    }

    function _getRecData() {
        return recData;
    }

    function init() {
        _nv_hm.getdata.currentUser = uniqueRecId();
        if (_nv_hm.getdata.currentUser) {
            // recording instances reference
            recRef.startRecording();
        }
    }
    recRef = new RecordableDrawing();
    return {
        init: init,
        stop: recRef.stopRecording,
        getRecData: _getRecData
    }
})(window);
//recording functions ends

_nv_hm.goals = (function () {
    function init(goalConfig) {
        // validate the obj
        if (validateConfObj(goalConfig)) {
            goalConfig.forEach(function (goalObj) {
                // we will track this goal on server side 
                if (goalObj.type !== '1') {
                    goalModule[goalObj.type](goalObj.content, goalObj.id);
                }
            });
        } else {
            // obj is not valid 
            console.log('invalid config obj');
            return;
        }
    }

    function getGoalConverts() {
        return goalModule.goalConverts;
    }

    /**
     * check the validity of the goalConfig
     * @param {object} goalConfig
     * @returns {boolean} true if all is valid else return false 
     */
    function validateConfObj(goalConfig) {
        if (goalConfig && Array.isArray(goalConfig)) {
            // we can add more validation later
            return true;
        }
        return false;
    }

    var goalModule = {
        goalConverts: {},
        2: function (selector, goalID) {
            // clickOnEl
            return new Promise(function (resolve, reject) {
                // check if the element is found or not
                var goalEl = document.querySelector(selector);
                if (goalEl) {
                    // if el is found
                    goalEl.setAttribute('nvAbGoalId', goalID);
                    goalEl.addEventListener('click', goalModule.clickGoalHandler, true);
                } else {
                    console.log('specified el is not found');
                    // we have to think about it that
                    // this condition never happen check 
                    // the element is found or not at the time of 
                    // configuration 
                    // if this condition happen then there should be a way to 
                    // inform the user that there goal is not correct and resolve it asap 
                }
                resolve(true);
            });
        },
        3: function () {
            // clickOnLink
            return new Promise(function (resolve, reject) {
                console.log('clickOnLink');
                resolve(true);
            });
        },
        clickGoalHandler: function (evt) {
            var goalID = evt.currentTarget.getAttribute('nvAbGoalId');
            if (goalID) {
                if (goalModule.goalConverts[goalID]) {
                    goalModule.goalConverts[goalID]++;
                } else {
                    goalModule.goalConverts[goalID] = 1;
                }
            }
        }
    }

    return {
        init: init,
        goalConverts: getGoalConverts
    }

})(window);

/**
 * 
 * _nv_hm.form(sub);
 * this function will track form submission events of particular form
 * if sub = nvSuccess , then _nv_hm.getdata.success count will get increased by 1
 * if sub = nvFail ,  then _nv_hm.getdata.failed count will get increased by 1
 * this method is called by the client from outside the js
 * @returns {undefined}
 */
_nv_hm.form = function (sub) {
    var attr;
    _nv_hm.getdata.lastBtn.length > 0 ? attr = _nv_hm.getdata.lastBtn : attr = _nv_hm.getdata.lastAttr;
    if (sub === 'nvSuccess') {
        if (_nv_hm.getdata.lastTrack.hasOwnProperty(attr)) {
            delete _nv_hm.getdata.lastTrack[attr];
        }
        if (_nv_hm.getdata.dropOf.hasOwnProperty(attr)) {
            _nv_hm.getdata.dropOf[attr] = '';
        }
        if (_nv_hm.getdata.success.hasOwnProperty(attr)) {
            _nv_hm.getdata.success[attr] += 1;
        } else {
            _nv_hm.getdata.success[attr] = 1;
        }
    } else if (sub === 'nvFail') {
        if (_nv_hm.getdata.failed.hasOwnProperty(attr)) {
            _nv_hm.getdata.failed[attr] += 1;
        } else {
            _nv_hm.getdata.failed[attr] = 1;
        }
    }
}

_nv_hm.getdata = (function (window, undefined) {
    var getdata = {
        points: [],
        movePoints: [],
        scrollData: [],
        formIntTime: [],
        formRefil: [],
        id_node: [],
        btn_node: [],
        lastTrack: {},
        lastAttr: '',
        lastBtn: '',
        lastScroll: 0,
        form_id: '',
        form_button: '',
        field_id: '',
        oDomain: '',
        subBtn: {},
        success: {},
        failed: {},
        formLeftBlank: {},
        dropOf: {},
        formInt: {},
        currentUser: '',
        updateType: '', // 1 for update in recording
    };
    var startTime;
    var endTime;
    var engStart;
    var engEnd;
    var scroll_sTime;
    var scroll_eTime;
    var lastScr = 0;
    var scr_timeout;
    var focusTime;

    getdata.loadListner = function () {
        startTime = new Date();
        scroll_sTime = new Date();
        window.TimeMe.initialize({
            currentPageName: location.href, // current page
            idleTimeoutInSeconds: 10 // seconds
        });
        engStart = window.TimeMe.getTimeOnCurrentPageInSeconds();
        //console.log("time");
    };
    getdata.clicks = function (event) {
        var offset = _nv_hm.utils.nvOffset(event.target);
        var offwidth = event.target.offsetWidth;
        var offheight = event.target.offsetHeight;
        if (offwidth > 0 && offheight > 0) {
            var x = (Math.abs(event.pageX - offset.left) / offwidth).toFixed(3);
            var y = (Math.abs(event.pageY - offset.top) / offheight).toFixed(4);
            var clickedEl = _nv_hm.utils.selectorQuery(event.target);
            //            var obj = x + "-" + y + '(sel)' + clickedEl;
            var obj = {
                xy: x + "-" + y,
                clickedEl: clickedEl,
            }
            getdata.points.push(obj);
        }
    };
    getdata.mflow = function (event) {
        clearTimeout(scr_timeout);
        scr_timeout = setTimeout(function () {
            var x = (event.pageX / document.body.clientWidth).toFixed(3);
            var y = event.pageY;
            var move = x + '-' + y;
            getdata.movePoints.push(move);
        }, 500);
    };
    getdata.scroll = function (event) {
        // get last scroll
        if (getdata.lastScroll < window.scrollY) {
            getdata.lastScroll = window.scrollY;
        }

        //get each scroll data
        getdata.eachScrollData();
    };
    getdata.eachScrollData = function (event) {
        scroll_eTime = new Date();
        engEnd = window.TimeMe.getTimeOnCurrentPageInSeconds();
        var scr = {
            scr_i: lastScr,
            et_f: Math.abs(engEnd - engStart).toFixed(3),
            top_f: Math.abs((scroll_eTime - scroll_sTime) / 1000).toFixed(3)    // time on page
        };
        if (scr.top_f > 1) {
            getdata.scrollData.push(scr);
        }
        lastScr = Math.round((window.scrollY / document.body.clientHeight) * 100);
        scroll_sTime = scroll_eTime;
        engStart = engEnd;
    };

    /**
     * FORM ANALYSIS
     * func formFocus : pushes interaction of the field (1 interaction/field id/session)
     * func formBlur : calculates interaction time , left blanks, field refill's , dropOf 
     * func formbtn : calculates clicks on the submit button of particular form 
     */
    getdata.formbtn = function (event) {
        var attr = event.target.getAttribute('nvbtn');
        _nv_hm.getdata.lastBtn = attr;
        if (_nv_hm.getdata.subBtn.hasOwnProperty(attr)) {
            _nv_hm.getdata.subBtn[attr] += 1;
        } else {
            _nv_hm.getdata.subBtn[attr] = 1;
        }
    };
    getdata.formFocus = function (event) {
        focusTime = new Date();
        var interaction = event.target.id;
        if (getdata.formInt[interaction]) {
            return false;
        } else {
            var nvAttribute = event.target.getAttribute('nvform').split("-");
            getdata.formInt[interaction] = {
                interactionTime: 0,
                refil: -1,
                forms: nvAttribute,
            };
        }
    };
    getdata.formBlur = function (event) {
        var intTime = new Date() - focusTime;
        var interactionId = event.target.id;
        var attr = event.target.getAttribute('nvform');
        var nvAttribute = event.target.getAttribute('nvform').split("-");

        getdata.formInt[interactionId].interactionTime += intTime;
        getdata.formInt[interactionId].refil += 1;
        /**
         * check if field value is not empty then the current 
         * id is removed from left blank array and if the field id
         * is dropof then dropof value is left empty 
         * else if field value is empty then vice versa
         */
        var fieldValue = document.getElementById(interactionId).value;
        if (fieldValue.length >= 1) {
            getdata.formLeftBlank[interactionId]['formId'] = [];
            //if previously this field was drop off but not anymore
            if (getdata.dropOf[attr] === interactionId) {
                getdata.dropOf[attr] = '';
            }
            getdata.lastTrack[attr] = interactionId;
            getdata.lastAttr = attr;
        } else {
            if (getdata.formLeftBlank[interactionId]['formId'].length == 0) {
                getdata.formLeftBlank[interactionId]['formId'] = nvAttribute;
            }
            getdata.dropOf[attr] = interactionId;
        }
    };
    /**
     * this function will return a object with property 
     * campaignID,variationID
     * if abTest enabled 
     * and we have a campaignID and variationID 
     * @returns {object/0}
     */
    getdata.getAbData = function () {
        // check if abtest is enabled or not 
        // if abTest property is set then we have a abTest
        if (_nv_hm.data.abTest && typeof _nv_hm.data.abTest === 'object') {
            if (_nv_hm.data.abTest.cid && _nv_hm.data.abTest.vid) {
                // validate the abTest data then only return the data
                return {
                    vid: _nv_hm.data.abTest.vid,
                    cid: _nv_hm.data.abTest.cid,
                    gc: _nv_hm.goals.goalConverts()
                }
            }
        }
        // if any thing fails then this fun will return 0
        return 0;
    };

    getdata.saveData = function () {
        endTime = new Date();

        //stop recording
        _nv_hm.nvRecording.stop();

        //get last scroll data
        getdata.eachScrollData();

        /**
         * if no field is filled then the dropoff == current page this can be 
         * checked if form interaction array is empty
         * 
         */
        if (Object.keys(getdata.formInt).length < 1) {
            getdata.formLeftBlank = {};
        } else if (Object.keys(getdata.formInt).length > 0 && Object.keys(getdata.lastTrack).length > 0) {
            /**
             * if there is no dropof but last track is there then
             * dropof will be the next element of the last tracked and 
             * if the next element is not empty or the last tracked element 
             * is last index in the id_node array then dropof will be
             * last tracked id 
             * @type @exp;
             */

            Object.keys(getdata.lastTrack).forEach(function (key) {
                getdata.dropOf[key] = getdata.lastTrack[key];

                var anode = document.getElementById(getdata.lastTrack[key]);
                var i = getdata.id_node.indexOf(anode);
                var j = getdata.id_node[i + 1];
                if (i + 1 < getdata.id_node.length && j.value.length < 1) {
                    var attr = j.getAttribute('nvform');
                    if (attr === key) {
                        getdata.dropOf[attr] = j.id;
                    }
                }
            });
        }



        var dataToSend = {
            brandID: notify_visitors.data.auth.bid,
            locData: getdata.points,
            moveData: getdata.movePoints,
            scroll: getdata.lastScroll,
            scrollData: getdata.scrollData,
            domain: getdata.oDomain,
            path: location.pathname,
            activeTime: Math.abs(window.TimeMe.getTimeOnCurrentPageInSeconds()).toFixed(3),
            timeOnPage: Math.abs((endTime - startTime) / 1000).toFixed(3),
            pageheight: document.body.clientHeight,
            pagewidth: document.body.clientWidth,
            heatMap: _nv_hm.data.heatMap,
            //// ab test /////
            abTest: getdata.getAbData(),
            ////form analysis///
            formInt: getdata.formInt,
            formLeftBlank: getdata.formLeftBlank,
            dropOf: getdata.dropOf,
            form_id: getdata.form_id,
            subBtn: getdata.subBtn,
            success: getdata.success,
            failed: getdata.failed,
            recording: _nv_hm.nvRecording.getRecData(),
            currentUser: getdata.currentUser,
            updateType: getdata.updateType,
        }
        //dataToSend.recording = dataToSend.timeOnPage > getdata.minSessionTime ?  recData : '';

        window.navigator.sendBeacon ? getdata.sendUsingBeacon(dataToSend) : getdata.makeXMLRequest(dataToSend);
    };
    getdata.makeXMLRequest = function (dataToSend) {
        //        endTime = new Date();
        //        var dataToSend = {
        //            brandID: _nv_hm.data.auth.bid,
        //            locData: getdata.points,
        //            domain: location.origin,
        //            path: location.pathname,
        //            activeTime: window.TimeMe.getTimeOnCurrentPageInSeconds(),
        //            timeOnPage: Math.abs((endTime - startTime) / 1000),
        //            pageheight: document.body.clientHeight,
        //            pagewidth: document.body.clientWidth,
        //            abTest: getdata.getAbData(),
        //            heatMap: _nv_hm.data.heatMap
        //        }
        var request = new XMLHttpRequest();
        request.onreadystatechange = function (res) {

            // Process the server response here.
        };
        request.open('POST', notify_visitors.data.urls.heatmapData, false);
        request.setRequestHeader('Content-Type', 'text/plain');
        request.send(JSON.stringify(dataToSend));
        //console.log("xml request");
    };
    getdata.sendUsingBeacon = function (dataToSend) {
        window.navigator.sendBeacon(notify_visitors.data.urls.heatmapData, JSON.stringify(dataToSend));
    };
    getdata.timeOnSite = function () {
        window.addEventListener('unload', function () {
            var _endTime = new Date();
            var timeOnPage = Math.abs((_endTime - startTime));

            var preTimeSpend = notify_visitors.cookie.get('_nv_ttsOnpage_' + _nv_hm.auth.bid);
            if (typeof preTimeSpend === 'string' && preTimeSpend.length > 0) {
                preTimeSpend = _nv_hm.utils.reverseMS(JSON.parse(preTimeSpend));
            } else {
                preTimeSpend = 0;
            }

            var _date = new Date();
            _date.setTime(_date.getTime() + (30 * 24 * 60 * 60 * 1000));
            var expireTime = _date.toUTCString();

            notify_visitors.cookie.set('_nv_ttsOnpage_' + _nv_hm.auth.bid, JSON.stringify(_nv_hm.utils.convertMS(preTimeSpend + timeOnPage)), expireTime);
        }, false);
    };
    return getdata;
})(window);



_nv_hm.utils = (function (window, undefined) {
    var document = window.document;
    var utils = {};
    utils.nvOffset = function (elt) {
        var rect = elt.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX
        }
    };
    // unique id generator
    utils.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    ////// clickedEl Query start //////////
    utils.selectorQuery = function (node) {
        var ignoreClassList = ["over", "hover", "active", "selected", "scrolled", "collapsed"];
        if (typeof node !== 'object') {
            throw new Error('expects dom node')
        }

        var selector = '';

        if (node.nodeName === 'HTML') {
            return 'html'
        }
        do {
            var elSelector = '';
            if (node.nodeName === 'HTML' | node.nodeName === '#document') {
                selector += elSelector;
                break;
            }
            if (node.id) {
                elSelector += ' #' + node.id
                selector += elSelector;
                break;
            }
            if (node.nodeName === 'BODY') {
                elSelector += ' ' + 'body'
                selector += elSelector;
                continue;
            }
            // refactor me *dying cough*
            if (node.className) {
                elSelector += ' ' + node.nodeName.toLowerCase() + (node.className.trim().split(/\s+/).map(function (x) {
                    if (ignoreClassList.indexOf(x) === -1) {
                        return '.' + x.replace('.', '\\\\.');
                    }
                    return '';
                }).join(''));

                if (node.parentNode.childNodes.length > 1 && node.parentNode.querySelectorAll(elSelector).length > 1) {
                    elSelector += ':nth-child(' + utils.getNth(node) + ')';
                }
            } else {
                elSelector += ' ' + node.nodeName.toLowerCase();
                if (node.parentNode.childNodes.length > 1 && node.parentNode.querySelectorAll(elSelector).length > 1) {
                    elSelector += ':nth-child(' + utils.getNth(node) + ')';
                }
            }

            selector += elSelector;

        } while (node = node.parentNode)

        selector = selector.split(' ').reverse().join(' ')
        return selector || null
    };

    utils.getCssPath = function (node) {
        if (!node) {
            return null;
        }

        function verify(path) {
            try {
                return document.querySelectorAll(path).length === 1;
            } catch (e) {
                return false;
            }
        }

        var nodeName = node.nodeName.toLowerCase();
        if (nodeName === 'body' || nodeName === 'head' || nodeName === 'html') {
            return nodeName;
        }

        // do not use ids for elements that do not get rendered
        var id = node.getAttribute('id');
        if (id && !/base|link|meta|style|iframe|script|noscript/gi.test(node.nodeName) && verify('#' + id)) {
            return '#' + id;
        }

        if (node.hasAttribute('class')) {
            var classNames = node.getAttribute('class').split(/\s+/);
            classNames = classNames.filter(function (className) {
                return !isVwoClass(className);
            });

            var i;

            for (i = 0; i < classNames.length; i++) {
                if (verify('.' + classNames[i]) && !(isDynamicClass(classNames[i]))) {
                    return '.' + classNames[i];
                }
            }

            for (i = 0; i < classNames.length; i++) {
                if (verify('.' + classNames[i]) && !(isDynamicClass(classNames[i]))) {
                    return nodeName + '.' + classNames[i];
                }
            }

            if (classNames.length && verify('.' + classNames.join('.')) && !(isDynamicClass(classNames.join('.')))) {
                return '.' + classNames.join('.');
            }
        }

        var parentPath = this.generateShortPath(node.parentNode);

        var index = 0;
        for (var iterator = node; iterator; iterator = iterator.previousSibling) {
            if (node.nodeName === iterator.nodeName) {
                index++;
            }
        }
        return parentPath + ' > ' + nodeName + ':nth-of-type(' + index + ')';
    }

    utils.getNth = function (node) {
        var startNode = node
        var i = 1
        while (node = node.previousElementSibling) {
            ++i
        }
        return i
    };

    utils.getParams = function (name, url) {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    /**
     * if the @param query is a string this function will 
     *      return its searched 'value' (in query/param) else return 'null'
     * if typeof @param query is object
     *          then keys of the object will represent the query to search
     *          and its value will represent the expected value
     *      if all the keys are found and their expected value is equal to the
     *      to the values found then return true
     *      else false 
     *      
     * @param {string/object} query
     * @param {string} url
     * @return {string/null} 
     */
    utils.checkParams = function (query, url) {
        if (!query) {
            throw new Error('this function need "query" to work');
        }
        if (typeof query === 'string') {
            return _nv_hm.utils.getParams(query, url);
        }
        if (typeof query === 'object') {
            var isPass = true;
            Object.keys(query).forEach(function (name) {
                if (name && typeof name === 'string') {
                    isPass = _nv_hm.utils.getParams(name, url) === query[name] ? true : false;
                }
            });
            return isPass;
        }
    };
    /**
     * check that if the code is in iframe environment or not
     * @return {boolean} return true if in iFrame else return false
     */
    utils.inIframe = function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    };
    /**
     *
     * @param {string} msg
     */
    utils.nvLog = function (msg) {
        console.log('[nvTest] :: ' + msg);
    };
    utils.toDOM = function (obj) {
        if (typeof obj == 'string') {
            obj = JSON.parse(obj);
        }
        var node, nodeType = obj.nodeType;
        switch (nodeType) {
            case 1: //ELEMENT_NODE
                node = document.createElement(obj.tagName);
                var attributes = obj.attributes || [];
                for (var i = 0, len = attributes.length; i < len; i++) {
                    var attr = attributes[i];
                    node.setAttribute(attr[0], attr[1]);
                }
                break;
            case 3: //TEXT_NODE
                node = document.createTextNode(obj.nodeValue);
                break;
            case 8: //COMMENT_NODE
                node = document.createComment(obj.nodeValue);
                break;
            case 9: //DOCUMENT_NODE
                node = document.implementation.createDocument();
                break;
            case 10: //DOCUMENT_TYPE_NODE
                node = document.implementation.createDocumentType(obj.nodeName);
                break;
            case 11: //DOCUMENT_FRAGMENT_NODE
                node = document.createDocumentFragment();
                break;
            default:
                return node;
        }
        if (nodeType == 1 || nodeType == 11) {
            var childNodes = obj.childNodes || [];
            for (i = 0, len = childNodes.length; i < len; i++) {
                node.appendChild(_nv_hm.utils.toDOM(childNodes[i]));
            }
        }
        return node;
    }
    utils.initializeKeysRearrange = function (childArray) {
        for (var i = 0; i < childArray.length; i++) {
            childArray[i].setAttribute("ab-key", i);
        }
    }
    utils.getChildIndex = function (matchingIndex, childArray) {
        var index = 0;
        for (var i = 0; i < childArray.length; i++) {
            var localIndex = childArray[i].getAttribute("ab-key");
            if (parseInt(matchingIndex) === parseInt(localIndex)) {
                index = i;
            }
        }
        return childArray[index];
    }
    utils.resetChildOrder = function (selector) {
        var quoteContainer = selector;
        var childNodes = quoteContainer.children;
        if (childNodes[0].getAttribute("ab-key") == null || typeof childNodes[0].getAttribute("ab-key") == "undefined") {
            utils.initializeKeysRearrange(childNodes);
        }
        for (var i = 0; i < childNodes.length; i++) {
            quoteContainer.insertBefore(utils.getChildIndex(parseInt(i), childNodes), childNodes[i]);
        }
        if (childNodes.length) {
            quoteContainer.insertBefore(utils.getChildIndex(0, childNodes), childNodes[0]);
        }
    }
    utils.rearrangeChilderns = function (selector, array) {
        var quoteContainer = selector;
        var childArray = quoteContainer.children;
        utils.initializeKeysRearrange(childArray);
        var rearrangeArray = array;
        for (var index = 0; index < rearrangeArray.length; index++) {
            if (typeof rearrangeArray[index] == "undefined") {
            } else {
                quoteContainer.insertBefore(utils.getChildIndex(parseInt(rearrangeArray[index]), childArray), childArray[index]);
            }
        }
    }
    utils.resetDragAndDrop = function (srcPath, targetPath) {
        if (srcPath == targetPath) {
            return;
        }

        var srcItemIndex = null;
        var targetItemIndex = null;
        targetPath = (targetPath.match(/\S+/g) || []).join(" ");
        var targetParentPath = targetPath.split(" ").splice(0, targetPath.split(" ").length - 1).join(" ");

        var parentSourceElement = document.querySelector(srcPath).parentElement;
        var parentTargetElement = document.querySelector(targetParentPath);
        if (srcPath.split(":").length == 2) {
            if (srcPath.split(":")[1].split(" ").length > 2) {
            } else {
                srcItemIndex = srcPath.split(":")[1].split("(")[1].split(")")[0];
            }
        }

        if (targetPath.split(":").length == 2) {
            if (targetPath.split(":")[1].split(" ").length > 2) {
            } else {
                targetItemIndex = targetPath.split(":")[1].split("(")[1].split(")")[0];
            }
        } else if (targetPath.split(":")[targetPath.split(":").length - 1] && targetPath.split(":").length != 1) {
            targetItemIndex = targetPath.split(":")[targetPath.split(":").length - 1].split("(")[1].split(")")[0];
        }

        if (targetItemIndex == null) {
            parentTargetElement.appendChild(document.querySelector(srcPath));
        } else {
            var srcElement = {};
            var srcUpdatedElementPath = srcPath;
            srcElement = document.querySelector((srcUpdatedElementPath.match(/\S+/g) || []).join(">"));
            parentTargetElement.insertBefore(srcElement, parentTargetElement.children[targetItemIndex - 1]);
        }
    }
    utils.splitCampaignCheck = function (key) {
        var _vm_queryObject = "";
        var windowCurrentLocation = window.location.href.split("?");
        var queryParamerterArray = windowCurrentLocation[windowCurrentLocation.length - 1].split("&");
        for (var i = 0; i < queryParamerterArray.length; i++) {
            if (queryParamerterArray[i].indexOf(key) != -1) {
                _vm_queryObject = queryParamerterArray[i].split("=")[1];
            }
        }
        ;
        var newQueryParameterArray = [];
        for (var i = 0; i < queryParamerterArray.length; i++) {
            if (queryParamerterArray[i].indexOf(key) == -1) {
                newQueryParameterArray.push(queryParamerterArray[i])
            }
        }
        ;
        if (newQueryParameterArray.join("&") != "") {
            windowCurrentLocation[windowCurrentLocation.length - 1] = newQueryParameterArray.join("&");
        }
        else {
            windowCurrentLocation.pop();
        }
        windowCurrentLocation = windowCurrentLocation.join("?");
        window.history.replaceState(null, null, windowCurrentLocation);
        return _vm_queryObject;
    }

    /**
     * 
     * @param {time diff millisecond} ms
     * @returns {object} of day,hour,minute,second,millisecond
     */
    utils.convertMS = function (ms) {
        var d, h, m, s, mi;
        mi = ms % 1000;
        s = Math.floor(ms / 1000);
        m = Math.floor(s / 60);
        s = s % 60;
        h = Math.floor(m / 60);
        m = m % 60;
        d = Math.floor(h / 24);
        h = h % 24;
        return { d: d, h: h, m: m, s: s, ms: mi };
    };
    utils.reverseMS = function (obj) {
        return obj.d * 86400000 + obj.h * 3600000 + obj.m * 60000 + obj.s * 1000 + obj.ms;
    };
    utils.browser = function () {
        _nv_hm.data.isSafari = 0;
        _nv_hm.data.isChrome = 0;
        _nv_hm.data.isFirefox = 0;
        _nv_hm.data.isIE = 0;

        var ua = window.navigator.userAgent;
        if (document.documentMode || /Edge/.test(navigator.userAgent)) {
            _nv_hm.data.isIE = 1;
        } else if (/chrome/i.test(ua)) {
            _nv_hm.data.isChrome = 1;
        } else if (ua.indexOf("Safari") > 0 && ua.indexOf("Chrome") == -1) {
            _nv_hm.data.isSafari = 1;
        } else if (/firefox/i.test(ua)) {
            _nv_hm.data.isFirefox = 1;
        }
    },
        utils.removeHiddenElement = function () {
            var hiddenElement = document.getElementById("_nv_hm_hidden_element");
            if (hiddenElement != null) {
                if (_nv_hm.data.isIE)
                    hiddenElement.parentNode.removeChild(hiddenElement);
                else
                    hiddenElement.remove();
            }
        }
    return utils;
    ////// selector Query end //////////
})(window);




/////// TimeME.js ///////////////
/*Copyright (c) 2017 Jason Zissman */
(function () {
    !function (e, t) {
        "undefined" != typeof module && module.exports ? module.exports = t() : "function" == typeof define && define.amd ? define([], function () {
            return e.TimeMe = t()
        }) : e.TimeMe = t()
    }(this, function () {
        var e = {
            startStopTimes: {}, idleTimeoutMs: 3e4, currentIdleTimeMs: 0, checkStateRateMs: 250, active: !1, idle: !1, currentPageName: "default-page-name", timeElapsedCallbacks: [], userLeftCallbacks: [], userReturnCallbacks: [], trackTimeOnElement: function (t) {
                var n = document.getElementById(t);
                n && (n.addEventListener("mouseover", function () {
                    e.startTimer(t)
                }), n.addEventListener("mousemove", function () {
                    e.startTimer(t)
                }), n.addEventListener("mouseleave", function () {
                    e.stopTimer(t)
                }), n.addEventListener("keypress", function () {
                    e.startTimer(t)
                }), n.addEventListener("focus", function () {
                    e.startTimer(t)
                }))
            }, getTimeOnElementInSeconds: function (t) {
                var n = e.getTimeOnPageInSeconds(t);
                return n || 0
            }, startTimer: function (t) {
                if (t || (t = e.currentPageName), void 0 === e.startStopTimes[t])
                    e.startStopTimes[t] = [];
                else {
                    var n = e.startStopTimes[t], i = n[n.length - 1];
                    if (void 0 !== i && void 0 === i.stopTime)
                        return
                }
                e.startStopTimes[t].push({ startTime: new Date, stopTime: void 0 }), e.active = !0
            }, stopAllTimers: function () {
                for (var t = Object.keys(e.startStopTimes), n = 0; n < t.length; n++)
                    e.stopTimer(t[n])
            }, stopTimer: function (t) {
                t || (t = e.currentPageName);
                var n = e.startStopTimes[t];
                void 0 !== n && 0 !== n.length && (void 0 === n[n.length - 1].stopTime && (n[n.length - 1].stopTime = new Date), e.active = !1)
            }, getTimeOnCurrentPageInSeconds: function () {
                return e.getTimeOnPageInSeconds(e.currentPageName)
            }, getTimeOnPageInSeconds: function (t) {
                return void 0 === e.getTimeOnPageInMilliseconds(t) ? void 0 : e.getTimeOnPageInMilliseconds(t) / 1e3
            }, getTimeOnCurrentPageInMilliseconds: function () {
                return e.getTimeOnPageInMilliseconds(e.currentPageName)
            }, getTimeOnPageInMilliseconds: function (t) {
                var n = e.startStopTimes[t];
                if (void 0 !== n) {
                    for (var i = 0, s = 0; s < n.length; s++) {
                        var o = n[s].startTime, r = n[s].stopTime;
                        void 0 === r && (r = new Date), i += r - o
                    }
                    return Number(i)
                }
            }, getTimeOnAllPagesInSeconds: function () {
                for (var t = [], n = Object.keys(e.startStopTimes), i = 0; i < n.length; i++) {
                    var s = n[i], o = e.getTimeOnPageInSeconds(s);
                    t.push({ pageName: s, timeOnPage: o })
                }
                return t
            }, setIdleDurationInSeconds: function (t) {
                var n = parseFloat(t);
                if (!1 !== isNaN(n))
                    throw { name: "InvalidDurationException", message: "An invalid duration time (" + t + ") was provided." };
                return e.idleTimeoutMs = 1e3 * t, this
            }, setCurrentPageName: function (t) {
                return e.currentPageName = t, this
            }, resetRecordedPageTime: function (t) {
                delete e.startStopTimes[t]
            }, resetAllRecordedPageTimes: function () {
                for (var t = Object.keys(e.startStopTimes), n = 0; n < t.length; n++)
                    e.resetRecordedPageTime(t[n])
            }, resetIdleCountdown: function () {
                e.idle && e.triggerUserHasReturned(), e.idle = !1, e.currentIdleTimeMs = 0
            }, callWhenUserLeaves: function (e, t) {
                this.userLeftCallbacks.push({ callback: e, numberOfTimesToInvoke: t })
            }, callWhenUserReturns: function (e, t) {
                this.userReturnCallbacks.push({ callback: e, numberOfTimesToInvoke: t })
            }, triggerUserHasReturned: function () {
                if (!e.active)
                    for (var t = 0; t < this.userReturnCallbacks.length; t++) {
                        var n = this.userReturnCallbacks[t], i = n.numberOfTimesToInvoke;
                        (isNaN(i) || void 0 === i || i > 0) && (n.numberOfTimesToInvoke -= 1, n.callback())
                    }
                e.startTimer()
            }, triggerUserHasLeftPage: function () {
                if (e.active)
                    for (var t = 0; t < this.userLeftCallbacks.length; t++) {
                        var n = this.userLeftCallbacks[t], i = n.numberOfTimesToInvoke;
                        (isNaN(i) || void 0 === i || i > 0) && (n.numberOfTimesToInvoke -= 1, n.callback())
                    }
                e.stopAllTimers()
            }, callAfterTimeElapsedInSeconds: function (t, n) {
                e.timeElapsedCallbacks.push({ timeInSeconds: t, callback: n, pending: !0 })
            }, checkState: function () {
                for (var t = 0; t < e.timeElapsedCallbacks.length; t++)
                    e.timeElapsedCallbacks[t].pending && e.getTimeOnCurrentPageInSeconds() > e.timeElapsedCallbacks[t].timeInSeconds && (e.timeElapsedCallbacks[t].callback(), e.timeElapsedCallbacks[t].pending = !1);
                !1 === e.idle && e.currentIdleTimeMs > e.idleTimeoutMs ? (e.idle = !0, e.triggerUserHasLeftPage()) : e.currentIdleTimeMs += e.checkStateRateMs
            }, visibilityChangeEventName: void 0, hiddenPropName: void 0, listenForVisibilityEvents: function () {
                void 0 !== document.hidden ? (e.hiddenPropName = "hidden", e.visibilityChangeEventName = "visibilitychange") : void 0 !== doc.mozHidden ? (e.hiddenPropName = "mozHidden", e.visibilityChangeEventName = "mozvisibilitychange") : void 0 !== document.msHidden ? (e.hiddenPropName = "msHidden", e.visibilityChangeEventName = "msvisibilitychange") : void 0 !== document.webkitHidden && (e.hiddenPropName = "webkitHidden", e.visibilityChangeEventName = "webkitvisibilitychange"), document.addEventListener(e.visibilityChangeEventName, function () {
                    document[e.hiddenPropName] ? e.triggerUserHasLeftPage() : e.triggerUserHasReturned()
                }, !1), window.addEventListener("blur", function () {
                    e.triggerUserHasLeftPage()
                }), window.addEventListener("focus", function () {
                    e.triggerUserHasReturned()
                }), document.addEventListener("mousemove", function () {
                    e.resetIdleCountdown()
                }), document.addEventListener("keyup", function () {
                    e.resetIdleCountdown()
                }), document.addEventListener("touchstart", function () {
                    e.resetIdleCountdown()
                }), window.addEventListener("scroll", function () {
                    e.resetIdleCountdown()
                }), setInterval(function () {
                    e.checkState()
                }, e.checkStateRateMs)
            }, websocket: void 0, websocketHost: void 0, setUpWebsocket: function (t) {
                if (window.WebSocket && t) {
                    var n = t.websocketHost;
                    try {
                        e.websocket = new WebSocket(n), window.onbeforeunload = function (n) {
                            e.sendCurrentTime(t.appId)
                        }, e.websocket.onopen = function () {
                            e.sendInitWsRequest(t.appId)
                        }, e.websocket.onerror = function (e) {
                            console && console.log("Error occurred in websocket connection: " + e)
                        }, e.websocket.onmessage = function (e) {
                            console && console.log(e.data)
                        }
                    } catch (e) {
                        console && console.error("Failed to connect to websocket host.  Error:" + e)
                    }
                }
                return this
            }, websocketSend: function (t) {
                e.websocket.send(JSON.stringify(t))
            }, sendCurrentTime: function (t) {
                var n = { type: "INSERT_TIME", appId: t, timeOnPageMs: e.getTimeOnCurrentPageInMilliseconds(), pageName: e.currentPageName };
                e.websocketSend(n)
            }, sendInitWsRequest: function (t) {
                var n = { type: "INIT", appId: t };
                e.websocketSend(n)
            }, initialize: function (t) {
                var n = e.idleTimeoutMs || 30, i = e.currentPageName || "default-page-name", s = void 0;
                t && (n = t.idleTimeoutInSeconds || n, i = t.currentPageName || i, s = t.websocketOptions), e.setIdleDurationInSeconds(n).setCurrentPageName(i).setUpWebsocket(s).listenForVisibilityEvents(), e.startTimer()
            }
        };
        return e
    })
}).call(this);

/////// TimeME js end ///////////////

var _notify_serverResponse = {
    "n": {
        "data":<?php  print json_encode($data) ?>
   }
   }

var notify_visitors = (function (window, notify_visitors, undefined) {
    return notify_visitors;
})(window, notify_visitors || {});


//manual call
notify_visitors.manual = (function (window, undefined) {
    var document = window.document;
    var manual = {};

    manual.jQuery = false;

    manual.loadjQuery = function () {
        if (window.jQuery === undefined) {
            //if ( window.jQuery === undefined || window.jQuery.fn.jquery !== '1.10.2') {
            var exists = (window.jQuery && window.jQuery.fn.jquery !== '1.10.2') ? true : false;
            var om = document.createElement('script');
            om.src = '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js';
            om.onload = om.onreadystatechange = function () {
                var s = this.readyState;
                if (s)
                    if (s != 'complete')
                        if (s != 'loaded')
                            return;
                try {
                    notify_visitors.manual.loadjQueryHandler(exists);
                } catch (e) { }
            };

            // Attempt to append it to the <head>, otherwise append to the document.
            (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(om);
        } else {
            // The version of jQuery loaded into the window is what we want to use, so we can just load the handler and output content.
            notify_visitors.manual.jQuery = window.jQuery;
            notify_visitors.manual.launch();
        }
    };

    manual.loadjQueryHandler = function (exists) {
        // If jQuery already exists, don't overwrite the global but set noConflict to properly handle multiple versions.
        if (exists) {
            // Don't set global jQuery object - just store in our property.
            notify_visitors.manual.jQuery = window.jQuery.noConflict(true);
        } else {
            // Store the global jQuery object since it does not exist yet.
            jQuery = window.jQuery.noConflict(true);
            notify_visitors.manual.jQuery = jQuery;
        }
        notify_visitors.manual.launch();
    };



    manual.launch = function () {
        notify_visitors.data.pushsubscribe = {};
        notify_visitors.data.auth = {};
        notify_visitors.data.settings = {};

        if (notify_visitors.auth.bid_e) {
            notify_visitors.data.auth.bid_e = notify_visitors.auth.bid_e;
        }
        if (notify_visitors.auth.bid) {
            notify_visitors.data.auth.bid = notify_visitors.auth.bid;
        }
        if (notify_visitors.auth.t) {
            notify_visitors.data.auth.t = notify_visitors.auth.t;
        }

        notify_visitors.data.settings = notify_visitors.data.auth;

        if (notify_visitors.ruleData) {
            notify_visitors.data.ruleData = notify_visitors.ruleData;
            notify_visitors.data.settings.ruleData = JSON.stringify(notify_visitors.data.ruleData);
        }

        if (notify_visitors.tokens) {
            notify_visitors.data.tokens = JSON.stringify(notify_visitors.tokens);
            notify_visitors.data.settings.tokens = notify_visitors.data.tokens;
        }

        notify_visitors.data.settings.trafficSource = document.referrer;
        notify_visitors.data.settings.pageUrl = document.location;
        var localTime = new Date();
        var gmtOffset = localTime.getTimezoneOffset() * 60 * (-1);
        notify_visitors.data.settings.gmOffset = gmtOffset;

        if (notify_visitors.data.isIncognito == 1) {
            notify_visitors.data.settings.incognito = notify_visitors.data.isIncognito;
        }

        notify_visitors.data.settings.screenWidth = screen.width;
        notify_visitors.data.settings.screenHeight = screen.height;

        notify_visitors.cookie.browser();

        var iFrameDetection = (window === window.parent) ? false : true;
        if (iFrameDetection === false) {
            notify_visitors.manual.brandSettingsResponse(_notify_serverResponse.n.data);
        }

        //homescreen
        if (document.location.href.indexOf("webapp=1") > 1) {
            notify_visitors.chrome.stats('web_app_opened');
        }

        if (window.nv != undefined && window.nv.q) {
            var args = window.nv.q;
            for (i = 0; i < args.length; i++) {
                var action = Array.prototype.slice.call(args[i]);
                notify_visitors.manual.actions(action);
            }
        }
        window.nv = function () {
            var action = Array.prototype.slice.call(arguments);
            notify_visitors.manual.actions(action);
        }
    };



    manual.brandSettingsResponse = function (output) {
        console.log(output);
        if (output.Authentication == 'fail') {
            return false;
        }

        if (output.cookie_domain != '') {
            notify_visitors.data.cookie_domain = output.cookie_domain;
        }

        var notifications = output.notifications;
        if (notifications.length > 0) {
            notify_visitors.manual.webSettingsResponse(output);
        }

        if (output.push_details || output.add_to_home_details) {
            notify_visitors.manual.pushLaunchResponse(output);
        }

        if (output.containerInfo) {
            notify_visitors.manual.containerResponse(output);
        }

        if (output.event_integration) {
            var event_val = output.event_integration;
            notify_visitors.manual.event(event_val.event, event_val.attributes, event_val.ltv, event_val.scope);
        }
    };
    return manual;
})(window);


notify_visitors.style = (function (window, undefined) {
    var document = window.document;
    var style = {};
    style.isScrollTrue = false;
    style = {
        style: function (style) {
            var styleNode = document.createElement('style');
            styleNode.type = "text/css";
            styleNode.innerHTML = style;
            document.getElementsByTagName('head')[0].appendChild(styleNode);
        },
        shw_cookie: function (options) {
            if (options.noOfTimesPerUser) {
                var shw = notify_visitors.cookie.get("shw_" + options.notificationID);
                shw = parseInt(shw);
                shw = (!shw) ? 1 : shw + 1;
                notify_visitors.cookie.set('shw_' + options.notificationID, shw);
            }
        },
        scroll: function () {
            window.onload = function () {
                notify_visitors.manual.jQuery(document).scroll(function () {
                    if (notify_visitors.style.isScrollTrue === true) {
                        notify_visitors.style.isScrollTrue = false;
                    } else {
                        notify_visitors.manual.jQuery("._hideOnScroll").fadeOut();
                        clearTimeout(notify_visitors.manual.jQuery.data(this, "scrollCheck"));
                        notify_visitors.manual.jQuery.data(this, "scrollCheck", setTimeout(function () {
                            notify_visitors.manual.jQuery("._hideOnScroll").fadeIn();
                            notify_visitors.style.isScrollTrue = true;
                        }, 1000));
                    }
                });
            }
        },
        close_button: function (id, display) {
            if (display != 0) {
                display = (display == 1) ? 1 : display * 1000;
                setTimeout(function () {
                    document.getElementById(id).style.display = 'block';
                }, display);
            }
        },
        changeHeight: function (data) {
            if (data.template && data.nid) {
                if (data.template == '32') {
                    var el = document.getElementById('nv_js-modal-content');
                } else {
                    var el = document.getElementById('nv_js-box-content_' + data.nid);
                }
                if (el) {
                    var height = Math.min((data.height + 40), window.innerHeight - 20);
                    el.style.height = height + 'px';
                    el.style.transition = 'all 0.3s ease-in';
                }
            }
        },
        nvCenterHeight: function (data) {
            var el = document.getElementById('nv-center-iframe-wrapper');
            if (el) {
                var height = 350;
                if (data.height < 350) {
                    height = Math.min((data.height + 13), window.innerHeight - 20);
                }
                el.style.height = height + 'px';
                el.style.transition = 'all 0.3s ease-in';
            }
        },
        nativePopup_background: function () {
            notify_visitors.nativeBackground_done = 0;
            if (!document.getElementById("nvpush_popup_background")) {
                var nv_push_background = 0;
                if (notify_visitors.data.isChromePush == 1) {
                    nv_push_background = sessionStorage.getItem('nv_push_background');
                    if (!nv_push_background) {
                        sessionStorage.setItem('nv_push_background', '1');
                    }
                }

                if (nv_push_background != 1) {
                    var div = document.createElement('div');
                    div.id = "nvpush_popup_background";
                    div.innerHTML = notify_visitors.data.push_details.iframe_popup_background.iframe_outer;
                    document.body.appendChild(div);

                    if (document.getElementById("nvpush_cross")) {
                        document.getElementById("nvpush_cross").addEventListener("click", function () {
                            document.getElementById("nvpush_popup_background").style.display = "none";
                            notify_visitors.cookie.set('nvpush_overlay', 1);
                        });
                    }

                    if (document.getElementById("nvpush_popup_background_iframe")) {
                        var doc = document.getElementById("nvpush_popup_background_iframe").contentWindow.document;
                        doc.open();
                        doc.write(notify_visitors.data.push_details.iframe_popup_background.iframe);
                        doc.close();
                    }

                    //                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    //                        window.addEventListener("scroll", function () {
                    //                            if (notify_visitors.nativeBackground_done != 1) {
                    //                                var scrollPercent = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());
                    //                                if (scrollPercent <= .5) {
                    //                                    document.getElementById("nvpush_popup_background").style.display = "block";
                    //                                } else {
                    //                                    document.getElementById("nvpush_popup_background").style.display = "none";
                    //                                }
                    //                            }
                    //                        });
                    //                    }
                }
            } else {
                document.getElementById("nvpush_popup_background").style.display = "block";
            }
        }
    };
    return style;
})(window);


//glodal variables
notify_visitors.data = (function (window, undefined) {
    var document = window.document;
    var data = {};
    var docProtocol = 'https://';
    var domainUrl = 'dev1.notifyvisitors.com/';
    var baseUrl = docProtocol + domainUrl;
    var pushUrl = docProtocol + 'devpush.notifyvisitors.com/';
    var analUrl = docProtocol + 'devanal.notifyvisitors.com/';
    var pushUrlHttps = 'https://devpush.notifyvisitors.com/';
    data.urls = {
        brandSettings: baseUrl + 'brand/TestController/settings',
        getNotification: baseUrl + 'brand/TestController/getNotification',
        singleLineBar: baseUrl + 'user/notifications/singleLineBar?brandid=',
        multiLineBar: baseUrl + 'user/notifications/multiLineBar?brandid=',
        mobileBar: baseUrl + 'user/notifications/mobileBar?brandid=',
        modal: baseUrl + 'user/notifications/modal?brandid=',
        box: baseUrl + 'user/notifications/box?brandid=',
        modalSvy: baseUrl + 'user/survey/modal?brandid=',
        boxSvy: baseUrl + 'user/survey/box?brandid=',
        stickyBarSvy: baseUrl + 'user/survey/stickyBar?brandid=',
        container: baseUrl + 'user/container/show?brandid=',
        permissionBox: pushUrlHttps + 'brand/t1/permissionBox',
        schedule_push: pushUrl + 'brand/t1/schedule',
        chrome_subscribe: pushUrl + 'brand/t1/chrome_subscribe',
        safari_subscribe: pushUrl + 'brand/t1/safari_subscribe',
        mozilla_subscribe: pushUrl + 'brand/t1/mozilla_subscribe',
        event: analUrl + 'brand/t1/event',
        user: analUrl + 'brand/t1/users',
        dimensions: analUrl + 'brand/t1/dimensions',
        native_thanks: pushUrlHttps + 'brand/t1/thanksWindow',
        push_stats: pushUrlHttps + 'brand/t1/stats',
        push_unsub: pushUrlHttps + 'brand/t1/unsubscribe',
        push_unsub_moz: pushUrlHttps + 'brand/t1/unsubscribe_mozilla',
        push_center: pushUrlHttps + 'brand/t1/notifications',
        geofencing: pushUrlHttps + 'brand/t1/geofencing'
    };

    return data;
})(window);


//JS Cookie
notify_visitors.cookie = (function (window, undefined) {
    var document = window.document;
    var cookie = {};
    cookie = {
        get: function (cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i].trim();
                if (c.indexOf(name) == 0)
                    return c.substring(name.length, c.length);
            }
            return "";
        },
        set: function (cname, cvalue, expire) {
            var expires = '';
            if (expire || expire === 0) {
                expires = "expires=" + expire;
            } else {
                var midnight = new Date();
                midnight.setHours(23, 59, 59, 0);
                expires = "expires=" + midnight;
            }

            var domain = '';
            if (notify_visitors.data.cookie_domain) {
                domain = 'domain=.' + notify_visitors.data.cookie_domain;
            }

            document.cookie = cname + "=" + cvalue + "; " + expires + "; " + domain + "; path=/";
        },
        ls_get: function (cname) {
            return localStorage.getItem(cname);
        },
        ls_set: function (cname, cvalue) {
            return localStorage.setItem(cname, cvalue);
        },
        bindEvent: function (el, eventName, eventHandler) {
            if (el.addEventListener) {
                return el.addEventListener(eventName, eventHandler);
            } else {
                if (el.attachEvent) {
                    return el.attachEvent("on" + eventName, eventHandler);
                }
            }
        },
        unbindEvent: function (el, eventName, eventHandler) {
            if (el.removeEventListener) {
                return el.removeEventListener(eventName, eventHandler);
            } else {
                if (el.detachEvent) {
                    return el.detachEvent("on" + eventName, eventHandler);
                }
            }
        },
        incognito: function () {
            notify_visitors.data.isIncognito = 0;
            var ua = window.navigator.userAgent;

            if (/chrome/i.test(ua)) {
                var fs = window.RequestFileSystem || window.webkitRequestFileSystem;
                if (fs) {
                    fs(window.TEMPORARY, 100, function (fs) { }, function (err) {
                        notify_visitors.data.isIncognito = 1;
                    });
                }
            } else if (/firefox/i.test(ua)) {
                function retry(isDone, next) {
                    var current_trial = 0,
                        max_retry = 50,
                        interval = 10,
                        is_timeout = false;
                    var id = window.setInterval(
                        function () {
                            if (isDone()) {
                                window.clearInterval(id);
                                next(is_timeout);
                            }
                            if (current_trial++ > max_retry) {
                                window.clearInterval(id);
                                is_timeout = true;
                                next(is_timeout);
                            }
                        },
                        10
                    );
                }

                if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
                    var db;
                    try {
                        db = window.indexedDB.open('test');
                        db.onerror = function () {
                            return true;
                        }
                    } catch (e) {
                        is_private = true;
                        notify_visitors.data.isIncognito = 1;
                    }

                    if (typeof is_private === 'undefined') {
                        retry(
                            function isDone() {
                                return db.readyState === 'done' ? true : false;
                            },
                            function next(is_timeout) {
                                if (!is_timeout) {
                                    is_private = db.result ? false : true;
                                    if (is_private === true) {
                                        notify_visitors.data.isIncognito = 1;
                                    }
                                }
                            }
                        );
                    }
                }
            }
        },
        browser: function () {
            notify_visitors.data.isSafari = 0;
            notify_visitors.data.isChrome = 0;
            notify_visitors.data.isFirefox = 0;
            notify_visitors.data.isIE = 0;
            notify_visitors.data.isSafariPush = 0;
            notify_visitors.data.isChromePush = 0;
            notify_visitors.data.isFirefoxPush = 0;
            var version;

            var ua = window.navigator.userAgent;
            if (document.documentMode || /Edge/.test(navigator.userAgent)) {
                notify_visitors.data.isIE = 1;
            } else if (/chrome/i.test(ua)) {
                notify_visitors.data.isChrome = 1;
                if (/Android|webOS/i.test(navigator.userAgent)) {
                    var uaArray = ua.split('/'),
                        version = uaArray[uaArray.length - 2];
                } else {
                    var uaArray = ua.split(' '),
                        version = uaArray[uaArray.length - 2].substr(7);
                }
                if (version.substring(0, 2) >= 42) {
                    notify_visitors.data.isChromePush = 1;
                }
            } else if (ua.indexOf("Safari") > 0 && ua.indexOf("Chrome") == -1) {
                notify_visitors.data.isSafari = 1;
                version = ua.substring(0, ua.indexOf("Safari")).substring(ua.substring(0, ua.indexOf("Safari")).lastIndexOf("/") + 1);
                if (parseInt(version, 10) >= 7) {
                    notify_visitors.data.isSafariPush = 1;
                }
            } else if (/firefox/i.test(ua)) {
                notify_visitors.data.isFirefox = 1;

                var verOffset = ua.indexOf("Firefox");
                var fullVersion = ua.substring(verOffset + 8);
                var majorVersion = parseInt('' + fullVersion, 10);
                if (isNaN(majorVersion)) {
                    majorVersion = parseInt(navigator.appVersion, 10);
                }

                if ((majorVersion >= 44 && !(/Android|webOS/i.test(navigator.userAgent))) || (majorVersion >= 48 && (/Android|webOS/i.test(navigator.userAgent)))) {
                    notify_visitors.data.isFirefoxPush = 1;
                }
            }
        },
        visibility: function (el, template, pos) {
            var id = document.getElementById(el);
            if (id != null) {
                var visibility = id.style.visibility;
                if (visibility === "hidden") {
                    if (template == '6' || template == '35') {
                        if (pos == 0) {
                            document.getElementById(el).style.height = '80px';
                        }
                    } else if (template == '5') {
                        document.getElementById(el).style.height = '35px';
                    } else if (template == '51') {
                        document.getElementById(el).style.height = '50px';
                    }
                    document.getElementById(el).style.visibility = 'visible';
                    document.getElementById(el).style.transition = 'bottom 1s ease';
                } else {
                    if (template == '6' || template == '5' || template == '35' || template == '51') {
                        document.getElementById(el).style.height = '0px';
                    }
                    document.getElementById(el).style.visibility = 'hidden';
                    document.getElementById(el).style.transition = 'bottom 1s ease';
                }
            }
        },
        gapush: function (id, name, value) {
            if (typeof ga == 'function') {
                ga('send', 'event', 'NotifyVisitors', id + ' - ' + name, value, 1, {
                    nonInteraction: true
                });
            }
            if (typeof cmCreateElementTag == 'function') {
                cmCreateElementTag(id + ' - ' + name, 'NotifyVisitors', value);
            }
        },
        iphone_redirect: function (href, target) {
            if (href) {
                window.location.href = href;
            }
        },
        auto_close: function (id) {
            if (document.getElementById("nv_js-box-close-button_" + id)) {
                document.getElementById("nv_js-box-close-button_" + id).click();
            } else if (document.getElementById("notify-visitors-notification-close-button_" + id)) {
                document.getElementById("notify-visitors-notification-close-button_" + id).click();
            } else if (document.getElementById("notify-visitors-multi-bar-notification-close-button_" + id)) {
                document.getElementById("notify-visitors-multi-bar-notification-close-button_" + id).click();
            } else if (document.getElementById("notify-visitors-notification-mobile-bar-close-button_" + id)) {
                document.getElementById("notify-visitors-notification-mobile-bar-close-button_" + id).click();
            } else if (document.getElementById("nv_js-modal-close-button")) {
                document.getElementById("nv_js-modal-close-button").click();
            }
        },
        push_subscribe: function (code, subscriber) {
            if (code == '301') {
                notify_visitors.push_confirm_popup.native_popup_msg();
            } else if (code == '302') {
                //notify_visitors.push_widget.chickLet(notify_visitors.data.push_details, notify_visitors.push_confirm_popup.thank_popup_msg); 
            } else if (code == '202') {
                notify_visitors.cookie.set("nv_push_neg", 1);
                //notify_visitors.push_widget.chickLet(notify_visitors.data.push_details, notify_visitors.manual.askPushPermission); 
            } else {
                notify_visitors.cookie.set('nv_push_error', code, 'Fri, 31 Dec 9999 23:59:59 GMT');
                if (code == '200') {
                    var expires = 'Fri, 31 Dec 9999 23:59:59 GMT';
                    if (notify_visitors.data.isFirefox) {
                        var date = new Date();
                        date.setTime(date.getTime() + (20 * 24 * 60 * 60 * 1000));
                        expires = date.toGMTString();
                    }
                    notify_visitors.cookie.set('nv_push_subscribe', subscriber, expires);

                    //push event
                    var attr = {};
                    if (notify_visitors.data.pushsubscribe && notify_visitors.data.pushsubscribe.event) {
                        attr = notify_visitors.data.pushsubscribe.event;
                    }
                    notify_visitors.manual.event('Push Subscription', attr, 1, 3);
                }

                if (document.getElementById('notifyvisitor_thank_push_popup')) {
                    document.getElementById('notifyvisitor_thank_push_popup').style.display = 'none';
                }
            }

            if (window.opener != null) {
                var nv_url = location.href;
                if (nv_url.indexOf("nv_url") != -1) {
                    var j = ['nv_push', 'subscribe', code, subscriber];
                    var message = JSON.stringify(j);
                    window.opener.postMessage(message, document.referrer);

                    setInterval(function () {
                        if (!notify_visitors.data.push_win_close) {
                            self.close();
                        }
                    }, 1000);
                }
            }
        },
        getQueryVariable: function (variable) {
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return pair[1];
                }
            }
        },
        isMobile: function () {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return 1;
            } else {
                return 0;
            }
        }
    };

    return cookie;
})(window);




//JSONP CALLBACK
notify_visitors.nv_jsonp = (function (window, undefined) {
    var document = window.document;
    var counter = 0,
        head, query, key, window = this;
    var nv_jsonp = {};

    function load(url) {
        var script = document.createElement('script'),
            done = false;
        script.src = url;
        script.async = true;
        script.onload = script.onreadystatechange = function () {
            if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                done = true;
                script.onload = script.onreadystatechange = null;
                if (script && script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            }
        };
        if (!head) {
            head = document.getElementsByTagName('head')[0];
        }
        head.appendChild(script);
    }

    function jsonp(url, params, callback) {
        if (url.indexOf("?") !== -1) {
            query = "&";
        } else {
            query = "?";
        }
        params = params || {};
        for (key in params) {
            if (params.hasOwnProperty(key)) {
                query += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
            }
        }
        var jsonp = "nv_json" + (++counter);
        window[jsonp] = function (data) {
            callback(data);
            try {
                delete window[jsonp];
            } catch (e) { }
            window[jsonp] = null;
        };
        load(url + query + "js_callback=" + jsonp);
        return jsonp;
    }
    return {
        get: jsonp
    };

}(window));

//add to home screen function
window.addEventListener('beforeinstallprompt', function (e) {
    if (notify_visitors.data.add_to_home_details != undefined && notify_visitors.data.add_to_home_details.allow == 1) {
        e.waitUntil(
            e.userChoice.then(function (choiceResult) {
                if (choiceResult.outcome == 'dismissed') {
                    notify_visitors.chrome.stats('web_app_canceled');
                } else {
                    notify_visitors.chrome.stats('web_app_installed');
                }
            })
        );
    } else {
        e.preventDefault();
        return false;
    }
});


window.addEventListener('message', function (event) {
    try {
        var result = JSON.parse(event.data);
        if (result && typeof result === "object" && result[0] != undefined) {
            if (result[0] == 'NotifyVisitors') {
                notify_visitors.cookie.gapush(result[2], result[1], result[3]);
            } else if (result[0] == 'nv_iphone') {
                notify_visitors.cookie.iphone_redirect(result[1], result[2]);
            } else if (result[0] == 'nv_push') {
                if (result[1] == 'subscribe') {
                    var subscriber = (result[2] == '200') ? result[3] : '';
                    notify_visitors.cookie.push_subscribe(result[2], subscriber);
                }
            } else if (result[0] == 'autoclose') {
                notify_visitors.cookie.auto_close(result[1]);
            } else if (result[0] == 'nvpush_nc_confirm') {
                notify_visitors.push_widget.nvCenterAllow();
            } else if (result[0] == 'nv_changeHeight') {
                notify_visitors.style.changeHeight(result[1]);
            } else if (result[0] == 'nv_centerHeight') {
                notify_visitors.style.nvCenterHeight(result[1]);
            }
        }
    } catch (e) { }
}, false);

function getBrowserPushStatus() {
    var rtValue = false;
    switch (1) {
        case notify_visitors.data.isChrome:
            if (parseInt(_notify_serverResponse.n.data.push_details.chrome) == 1) {
                rtValue = true;
            }
            break;
        case notify_visitors.data.isFirefox:
            if (parseInt(_notify_serverResponse.n.data.push_details.mozilla) == 1) {
                rtValue = true;
            }
            break;
        case notify_visitors.data.isSafari:
            if (parseInt(_notify_serverResponse.n.data.push_details.safari) == 1) {
                rtValue = true;
            }
            break;

    }
    return true;
}





<?php   if($data["push_details"]["chrome"] == "0" && $data["push_details"]["mozilla"] == "0" && $data["push_details"]["safari"] == "0") { ?>
    loadJs("//dev1.notifyvisitors.com/js/unminified/notify-visitors-banner.js");
<?php } ?>
<?php if(count($data["notifications"]) > 0) { ?>

if(getBrowserPushStatus()) {
        loadJs("//dev1.notifyvisitors.com/js/unminified/notify-visitors-push.js");
    }
<?php } ?>



    function notify_mainAction() {
        notify_visitors.manual.loadjQuery();
        var notifyvisitor_location_url = location.href;
        notifyvisitor_str = "" + notifyvisitor_location_url;
        pos = notifyvisitor_str.indexOf("find_xpath=1");
        if (pos != -1) {
            var script = document.createElement('script');
            script.async = true;
            script.src = (document.location.protocol == 'https:' ? "//d2933uxo1uhve4.cloudfront.net" : "//dev1.notifyvisitors.com") + '/js/unminified/notify-visitors-element-selector.js';
            var entry = document.getElementsByTagName('script')[0];
            entry.parentNode.insertBefore(script, entry);
        }
    }

window.addEventListener("load", function (event) {
    if (notify_visitors.auth != undefined) {
        notify_visitors.cookie.incognito();
        if (notify_visitors.async != undefined && notify_visitors.async !== false) {
            if (document.readyState == 'complete') {
                notify_mainAction();
            } else if (window.addEventListener) {
                window.addEventListener('load', notify_mainAction, false);
            } else if (window.attachEvent) {
                window.attachEvent('onload', notify_mainAction);
            }
        } else {
            notify_mainAction();
        }
    }
});
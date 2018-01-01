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
                } catch (e) {
                }
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
            notify_visitors.nv_jsonp.get(notify_visitors.data.urls.brandSettings, notify_visitors.data.settings, notify_visitors.manual.brandSettingsResponse);
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

    


     manual.event = function (name, attributes, ltv, scope) {
        if (name) {
            var data = notify_visitors.data.settings;
            data.event_name = name;
            if (attributes) {
                data.attributes = JSON.stringify(attributes);
            }
            if (ltv) {
                data.ltv = ltv;
            }
            if (scope) {
                data.scope = scope;
            }
            if (notify_visitors.data.pushsubscribe.userID) {
                data.userID = notify_visitors.data.pushsubscribe.userID;
            }
            notify_visitors.nv_jsonp.get(notify_visitors.data.urls.event, data, notify_visitors.manual.eventResponse);
        }
    };

    manual.actions = function (action) {
        if (action[0] == 'user') {
            notify_visitors.manual.user(action[1], action[2]);
        } else if (action[0] == 'pushuser') {
            var nv_push_subscribe = notify_visitors.cookie.get("nv_push_subscribe");
            if (nv_push_subscribe) {
                notify_visitors.manual.user(action[1], action[2]);
            }
        } else if (action[0] == 'event') {
            notify_visitors.manual.event(action[1], action[2], action[3], action[4]);
        } else if (action[0] == 'pushevent') {
            notify_visitors.manual.pushevent(action[1], action[2], action[3], action[4]);
        } else if (action[0] == 'pushsubscribe') {
            notify_visitors.data.pushsubscribe.userID = action[1];
            notify_visitors.data.pushsubscribe.event = action[2];
        } else if (action[0] == 'dimensions') {
            notify_visitors.manual.dimensions(action[1], action[2]);
        }
    };




 
    manual.pushLaunchResponse = function (output) {
        if (output.add_to_home_details) {
            notify_visitors.data.add_to_home_details = output.add_to_home_details;
        }

        if (output.push_details) {
            notify_visitors.data.push_details = output.push_details;
            var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (notify_visitors.data.isIncognito != 1 && !iOS && ((notify_visitors.data.isChromePush && output.push_details.chrome == 1) || (notify_visitors.data.isFirefoxPush && output.push_details.mozilla == 1) || (notify_visitors.data.isSafariPush && output.push_details.safari == 1))) {
                notify_visitors.data.push_white_label = output.white_label;

                if (output.push_details.allow_window) {
                    var ele = document.getElementById("nv-push-custom-html");
                    if (ele) {
                        ele.innerHTML = output.push_details.allow_window;
                    }
                }

                var nv_push_subscribe = notify_visitors.cookie.get("nv_push_subscribe");
                if (!nv_push_subscribe) {
                    if (output.push_details.subscriber != undefined) {
                        nv_push_subscribe = output.push_details.subscriber;
                    }
                }

                if (!nv_push_subscribe) {
                    var nv_push_error = notify_visitors.cookie.get("nv_push_error");
                    if (!nv_push_error || nv_push_error == '200') {
                        var nv_push_neg = notify_visitors.cookie.get("nv_push_neg");
                        var nv_push_pos = notify_visitors.cookie.get("nv_push_pos");
                        var nv_push_times = notify_visitors.cookie.get("nv_push_times");
                        if (nv_push_neg || nv_push_pos || (output.push_details.perm_times > 0 && nv_push_times && nv_push_times >= output.push_details.perm_times)) {
                            notify_visitors.data.showChicklet = 1;
                        } else {
                            setTimeout(function () {
                                notify_visitors.manual.askPushPermission();
                            }, output.push_details.perm_delay * 1000);
                        }
                    }
                } else {
                    notify_visitors.data.push_subscriber = nv_push_subscribe;
                }


                //geo fencing
                if (notify_visitors.data.push_subscriber) {
                    notify_visitors.geofence.location();
                }
            }

            // geo fence ask permission
            if (notify_visitors.data.push_details.location_perm == 1) {
                notify_visitors.geofence.ask();
            }

            //notification center
            if (notify_visitors.data.push_details.chicklet && notify_visitors.data.push_details.chicklet != 0) {
                notify_visitors.push_widget.chickLet(notify_visitors.data.push_details, notify_visitors.push_widget.notificationCenter);
                notify_visitors.push_widget.notificationCenter();
            }
        }

        // register service worker if any one is enabled : push or pwa
        if ((notify_visitors.data.push_details != undefined && notify_visitors.data.push_details.hosted == 1 && (notify_visitors.data.isChromePush && notify_visitors.data.push_details.chrome == 1) || (notify_visitors.data.isFirefoxPush && notify_visitors.data.push_details.mozilla == 1))
                || (notify_visitors.data.add_to_home_details != undefined && notify_visitors.data.add_to_home_details.allow == 1)) {
            notify_visitors.chrome.registerSw();
        }
    };

    manual.askPushPermission = function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            window.scroll(0, 0);
        }

        if ((notify_visitors.data.push_details.hosted == 1 && 'https:' == document.location.protocol) || (notify_visitors.data.isSafariPush && notify_visitors.data.push_details.native == 1)) {
            notify_visitors.data.subscribe = {};
            notify_visitors.data.subscribe = notify_visitors.data.auth;

            if (notify_visitors.data.pushsubscribe && notify_visitors.data.pushsubscribe.userID) {
                notify_visitors.data.subscribe.userID = notify_visitors.data.pushsubscribe.userID;
            }

            var nv_url = notify_visitors.cookie.getQueryVariable("nv_url");
            notify_visitors.data.subscribe.pageUrl = (nv_url) ? nv_url : notify_visitors.data.settings.pageUrl;

            if (notify_visitors.data.isChromePush || notify_visitors.data.isFirefoxPush) {
                notify_visitors.chrome.launch(notify_visitors.data.push_details);
            } else if (notify_visitors.data.isSafariPush) {
                notify_visitors.safari.launch(notify_visitors.data.push_details);
            }
        } else if (notify_visitors.data.push_details.native == 1) {
            if (!notify_visitors.data.isSafariPush) {
                notify_visitors.push_widget.native_iframe(notify_visitors.data.push_details);
            }
        } else {
            notify_visitors.push_widget.confirm_popup(notify_visitors.data.push_details);
        }
        return;
    };

     return manual;
    });


    notify_visitors.chrome = (function (window, undefined) {
    var document = window.document;
    var chrome = {};

    chrome.launch = function (options) {
        if ('serviceWorker' in navigator) {
            var sw_path = (options.sw_path) ? options.sw_path : '/service-worker.js';
            navigator.serviceWorker.register(sw_path)
                    .then(notify_visitors.chrome.initialiseState());
        } else {
            console.log('Service workers aren\'t supported in this browser.');
            notify_visitors.cookie.push_subscribe('101');
        }
    };

    chrome.registerSw = function () {
        if ('https:' == document.location.protocol && (notify_visitors.data.isChromePush || notify_visitors.data.isFirefoxPush)) {
            if ('serviceWorker' in navigator) {
                var sw_path = (notify_visitors.data.push_details != undefined && notify_visitors.data.push_details.sw_path) ? notify_visitors.data.push_details.sw_path : '/service-worker.js';
                navigator.serviceWorker.register(sw_path);

                if (Notification.permission !== 'granted' && notify_visitors.data.push_details != undefined && notify_visitors.data.push_details.hosted == '1') {
                    notify_visitors.chrome.unsubscribe();
                }
            }
        }
    };

    chrome.initialiseState = function () {
        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            console.log('Notifications aren\'t supported.');
            notify_visitors.cookie.push_subscribe('102');
            return;
        }

        if (Notification.permission === 'denied') {
            console.log('The user has blocked notifications.');
            notify_visitors.cookie.push_subscribe('201');
            return;
        }

        // Check if push messaging is supported
        if (!('PushManager' in window)) {
            console.log('Push messaging isn\'t supported.');
            notify_visitors.cookie.push_subscribe('103');
            return;
        }

        // We need the service worker registration to check for a subscription
        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
            serviceWorkerRegistration.pushManager.getSubscription()
                    .then(function (subscription) {
                        if (!subscription) {
                            var nvpush_overlay = notify_visitors.cookie.get("nvpush_overlay");
                            if (notify_visitors.data.push_details.allow_bg && nvpush_overlay !== '1') {
                                notify_visitors.style.nativePopup_background();
                            }

                            notify_visitors.chrome.subscribe();
                            return;
                        }

                        notify_visitors.chrome.sendSubscriptionToServer(subscription);

                    })
                    .catch(function (err) {
                        console.log('Error during getSubscription()', err);
                        notify_visitors.cookie.push_subscribe('104');
                    });
        });
    };

    chrome.sendSubscriptionToServer = function (subscription) {
        console.log(subscription);
        if (notify_visitors.data.isFirefox) {
            notify_visitors.mozilla.sendSubscriptionToServer(subscription);
            return;
        }

        if (subscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') !== 0) {
            console.log('This browser isn\'t currently supported');
            notify_visitors.cookie.push_subscribe('105');
            return;
        }

        var subscriptionId = '';
        if (subscription.subscriptionId) {
            subscriptionId = subscription.subscriptionId;
        } else {
            var endpoint = subscription.endpoint;
            var endpointSections = endpoint.split('/');
            subscriptionId = endpointSections[endpointSections.length - 1];
        }

        console.log('server subscription id', subscriptionId);

        if (subscriptionId != '') {
            notify_visitors.data.subscribe.subscriptionId = subscriptionId;

            var subscription_stringify = JSON.stringify(subscription);
            subscription_stringify = JSON.parse(subscription_stringify);
            if (subscription_stringify.keys) {
                if (subscription_stringify.keys.p256dh) {
                    notify_visitors.data.subscribe.pkey = subscription_stringify.keys.p256dh;
                }
                if (subscription_stringify.keys.auth) {
                    notify_visitors.data.subscribe.authkey = subscription_stringify.keys.auth;
                }
            }

            notify_visitors.nv_jsonp.get(notify_visitors.data.urls.chrome_subscribe, notify_visitors.data.subscribe, notify_visitors.chrome.serverResponse);
        }
    };

    chrome.subscribe = function () {
        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
            serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
                    .then(function (subscription) {
                        if (document.getElementById("nvpush_popup_background_loader")) {
                            document.getElementById("nvpush_popup_background_loader").style.display = "block";
                        }

                        if (document.getElementById("nvpush_popup_background")) {
                            console.log('123');
                            notify_visitors.nativeBackground_done = 1;
                            document.getElementById("nvpush_popup_background").style.display = "none";
                        }
                        return notify_visitors.chrome.sendSubscriptionToServer(subscription);
                    })
                    .catch(function (e) {
                        if (document.getElementById("nvpush_popup_background")) {
                            notify_visitors.nativeBackground_done = 1;
                            document.getElementById("nvpush_popup_background").style.display = "none";
                        }
                        if (Notification.permission === 'denied') {
                            console.log('Permission for Notifications was denied');
                            if (notify_visitors.data.isFirefox) {
                                notify_visitors.chrome.stats('mozilla_denied');
                            } else {
                                notify_visitors.chrome.stats('chrome_denied');
                            }
                            notify_visitors.cookie.push_subscribe('201');
                        } else if (Notification.permission === 'default') {
                            console.log('Permission box closed');
                            if (notify_visitors.data.isFirefox) {
                                //notify_visitors.chrome.stats('mozilla_closed');
                            } else {
                                notify_visitors.chrome.stats('chrome_closed');
                                notify_visitors.cookie.push_subscribe('202');
                            }
                        }
                    });
        });
    };

    chrome.serverResponse = function (output) {
        if (output.subscriber) {
            notify_visitors.cookie.push_subscribe('200', output.subscriber);
        }
    };

    chrome.unsubscribe = function () {
        if (notify_visitors.data.push_subscriber) {
            notify_visitors.cookie.set('nv_push_error', 0, 'Fri, 31 Dec 1999 23:59:59 GMT');
            notify_visitors.cookie.set('nv_push_subscribe', 0, 'Fri, 31 Dec 1999 23:59:59 GMT');

            notify_visitors.data.push_unsub = {};
            notify_visitors.data.push_unsub = notify_visitors.data.auth;

            notify_visitors.data.push_unsub.subscriptionID = notify_visitors.data.push_subscriber;
            notify_visitors.data.push_subscriber = '';

            var url = notify_visitors.data.urls.push_unsub;
            if (notify_visitors.data.isFirefox) {
                url = notify_visitors.data.urls.push_unsub_moz;
            }
            notify_visitors.nv_jsonp.get(url, notify_visitors.data.push_unsub, notify_visitors.chrome.unsubscribeResponse);
        }
    };

    chrome.unsubscribeResponse = function (output) {

    };

    chrome.stats = function (action) {
        notify_visitors.data.push_win_close = 1;
        if (action) {
            notify_visitors.data.push_stats = {};
            notify_visitors.data.push_stats = notify_visitors.data.auth;

            notify_visitors.data.push_stats.action = action;
            notify_visitors.nv_jsonp.get(notify_visitors.data.urls.push_stats, notify_visitors.data.push_stats, notify_visitors.chrome.statsResponse);
        }
        return;
    };

    chrome.statsResponse = function (output) {
        notify_visitors.data.push_win_close = 0;
    };

    return chrome;
})(window); // We call our anonymous function immediately

notify_visitors.mozilla = (function (window, undefined) {
    var document = window.document;
    var mozilla = {};

    mozilla.sendSubscriptionToServer = function (subscription) {
        if (!subscription.endpoint) {
            console.log('This browser isn\'t currently supported for this demo');
            notify_visitors.cookie.push_subscribe('105');
            return;
        }

        console.log('mozilla endpoint', subscription.endpoint);
        notify_visitors.data.subscribe.endpoint = subscription.endpoint;

        var subscription_stringify = JSON.stringify(subscription);
        subscription_stringify = JSON.parse(subscription_stringify);
        if (subscription_stringify.keys) {
            if (subscription_stringify.keys.p256dh) {
                notify_visitors.data.subscribe.pkey = subscription_stringify.keys.p256dh;
            }
            if (subscription_stringify.keys.auth) {
                notify_visitors.data.subscribe.authkey = subscription_stringify.keys.auth;
            }
        }

        notify_visitors.nv_jsonp.get(notify_visitors.data.urls.mozilla_subscribe, notify_visitors.data.subscribe, notify_visitors.mozilla.serverResponse);
    };

    mozilla.serverResponse = function (output) {
        if (output.subscriber) {
            notify_visitors.cookie.push_subscribe('200', output.subscriber);
        }
    };

    return mozilla;
})(window); // We call our anonymous function immediately

notify_visitors.safari = (function (window, undefined) {
    var document = window.document;
    var safari = {};

    safari.launch = function (value) {
        value.safari_push_id = (value.safari_push_id) ? value.safari_push_id : 'web.com.notifyvisitors';
        var pResult = window.safari.pushNotification.permission(value.safari_push_id);
        if (pResult.permission === 'default') {
            notify_visitors.safari.requestPermissions(value);
        } else if (pResult.permission === 'granted') {
            var token = pResult.deviceToken;
            notify_visitors.safari.sendSubscriptionToServer(token);
        } else if (pResult.permission === 'denied') {
            console.log('Permission for Notifications was denied');
        }
    };

    safari.requestPermissions = function (value) {
        value.safari_push_id = (value.safari_push_id) ? value.safari_push_id : 'web.com.notifyvisitors';
        var userInfo = {
            id: notify_visitors.data.auth.bid
        };

        window.safari.pushNotification.requestPermission('https://devpush.notifyvisitors.com/safari/hosted', value.safari_push_id, userInfo, function (c) {
            if (c.permission === 'granted') {
                var token = c.deviceToken;
                notify_visitors.safari.sendSubscriptionToServer(token);
            }
            else if (c.permission === 'denied') {
                console.log('Permission for Notifications was denied');
                notify_visitors.chrome.stats('safari_denied');
                notify_visitors.cookie.push_subscribe('201');
            }
        });
    };

    safari.sendSubscriptionToServer = function (subscription) {
        console.log('safari token', subscription);

        notify_visitors.data.subscribe.subscriptionId = subscription;
        notify_visitors.nv_jsonp.get(notify_visitors.data.urls.safari_subscribe, notify_visitors.data.subscribe, notify_visitors.safari.serverResponse);
    };

    safari.serverResponse = function (output) {
        if (output.subscriber) {
            notify_visitors.cookie.push_subscribe('200', output.subscriber);
        }
    };

    return safari;
})(window); // We call our anonymous function immediately

notify_visitors.geofence = (function (window, undefined) {
    var document = window.document;
    var geofence = {};

    geofence.location = function () {
        if (navigator.geolocation) {
            navigator.permissions.query({name: 'geolocation'}).then(function (result) {
                if (result.state == 'granted') {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        //console.log(position);

                        var time = new Date().toJSON().slice(0, 10).replace(/-/g, '/');

                        if (notify_visitors.cookie.ls_get("nvpush_geofence") && notify_visitors.cookie.ls_get("nvpush_geofence") == time) {
                            return;
                        }

                        notify_visitors.data.geofencing = notify_visitors.data.auth;
                        notify_visitors.data.geofencing.latitude = position.coords.latitude;
                        notify_visitors.data.geofencing.longitude = position.coords.longitude;
                        notify_visitors.data.geofencing.subscriptionID = notify_visitors.data.push_subscriber;

                        if (notify_visitors.data.isChrome == 1) {
                            notify_visitors.data.geofencing.platform = '1';
                        } else if (notify_visitors.data.isFirefox == 1) {
                            notify_visitors.data.geofencing.platform = '2';
                        } else if (notify_visitors.data.isSafari == 1) {
                            notify_visitors.data.geofencing.platform = '5';
                        }

                        if (notify_visitors.cookie.ls_get("nvpush_geo_coord")) {
                            var ls_value = JSON.parse(notify_visitors.cookie.ls_get("nvpush_geo_coord"));
                            var lat_value = ls_value.coords.lat;
                            var long_value = ls_value.coords.long;

//                                    alert('long coodinate' + long_value);
//                                    alert('geo long coodinate' + position.coords.longitude);
//                                    if(long_value == position.coords.longitude){
//                                        alert('same long coodinate');
//                                    } else {
//                                        alert('diff long coodinate');
//                                    }
//                                    if(lat_value == position.coords.latitude){
//                                        alert('same lat coodinate');
//                                    } else {
//                                        alert('diff lat coodinate');
//                                    }
//                                    alert('before done'); 
//                                    if(long_value.toPrecision(6) != position.coords.longitude.toPrecision(6) && lat_value.toPrecision(6) != position.coords.latitude.toPrecision(6) && time != ls_value.timestamp){
//                                       alert('done'); notify_visitors.nv_jsonp.get(notify_visitors.data.urls.geofencing, notify_visitors.data.geofencing, notify_visitors.geofence.locationResponse);
//                                    }
                        } else {
                            var coords = {lat: position.coords.latitude, long: position.coords.longitude};
                            var data = {coords: coords, timestamp: time};
                            notify_visitors.cookie.ls_set("nvpush_geo_coord", JSON.stringify(data));
                            //alert('done2'); 
                            notify_visitors.nv_jsonp.get(notify_visitors.data.urls.geofencing, notify_visitors.data.geofencing, notify_visitors.geofence.locationResponse);
                        }
                    });
                }
            });
        }
        return;
    };

    geofence.locationResponse = function (output) {
        if (output.geofence) {
            if (output.geofence !== 1) {
                var geofence = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
                notify_visitors.cookie.ls_set("nvpush_geofence", geofence);
            }
        }
    };

    geofence.ask = function () {
        var geoCookie = notify_visitors.cookie.get("nv_geo_neg");
        if (!geoCookie) {
            navigator.geolocation.getCurrentPosition(geofence.askSuccess, geofence.askError);
        }
    };

    geofence.askSuccess = function () {
        console.log('geo access');
    };

    geofence.askError = function () {
        notify_visitors.cookie.set("nv_geo_neg", 1);
        console.log('geo denied');
    };

    return geofence;
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
                    
                    if(document.getElementById("nvpush_cross")){
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


notify_visitors.push_widget = (function (window, undefined) {
    var document = window.document;
    var push_widget = {};

    push_widget.native_iframe = function (value) {
        if (value.hosted == 1) {
            var href = value.hosted_link + "/notifyvisitors_push/chrome/native.html" + '?bid=' + notify_visitors.data.auth.bid + '&bid_e=' + notify_visitors.data.auth.bid_e + '&t=' + notify_visitors.data.auth.t;
        } else {
            var href = notify_visitors.data.urls.permissionBox + '?bid=' + notify_visitors.data.auth.bid + '&bid_e=' + notify_visitors.data.auth.bid_e + '&t=' + notify_visitors.data.auth.t;
        }
        href += '&pageUrl=' + notify_visitors.data.settings.pageUrl;

        if (!document.getElementById('nvpush_native_iframe')) {
            nvFrame = document.createElement("IFRAME"),
                    nvFrame.setAttribute("src", href + "&redirect=prompt"),
                    nvFrame.setAttribute("id", "nvpush_native_iframe"),
                    nvFrame.style.width = "0px", nvFrame.style.height = "0px", nvFrame.style.border = "0px",
                    nvFrame.setAttribute("visibility", "hidden"),
                    nvFrame.style.display = "none",
                    null != document.body ? document.body.appendChild(nvFrame) : document.head.appendChild(nvFrame);
        } else {
            document.getElementById('nvpush_native_iframe').setAttribute("src", href + "&redirect=prompt");
        }
    };

    push_widget.confirm_popup = function (value) {
        var div = document.createElement('div');

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            div.innerHTML = value.perm_box_view.mobile;
        } else {
            div.innerHTML = value.perm_box_view.desktop;
        }

        div.id = 'notify-visitors-push-confirm-popup';

        if (document.body.firstChild) {
            document.body.insertBefore(div, document.body.firstChild);
        } else {
            document.body.appendChild(div);
        }

        notify_visitors.push_confirm_popup.initialize(value);
    };

    push_widget.chickLet = function (value, onclick) {
        if (value.chicklet != 1) {
            return;
        }

        if (document.getElementById('notify-visitors-push-chicklet')) {
            var element = document.getElementById("notify-visitors-push-chicklet");
            element.parentNode.removeChild(element);
        }

        var sheet = document.createElement('style');
        sheet.innerHTML = value.chicklet_view.style;
        document.head.appendChild(sheet);

        var div = document.createElement('div');

        if (screen.width > 600) {
            div.innerHTML = value.chicklet_view.desktop;
        } else {
            div.innerHTML = value.chicklet_view.mobile;
        }

        setTimeout(function () {
            document.getElementById("nv-hover_text").className = "nv-text-point nv-chicklet_none";
        }, 5000);

        div.id = 'notify-visitors-push-chicklet';
        div.onclick = onclick;

        if (document.body.firstChild) {
            document.body.insertBefore(div, document.body.firstChild);
        } else {
            document.body.appendChild(div);
        }
    };

    push_widget.notificationCenter = function () {
        var client_element_id = document.getElementById('nv_notification_center_button');
        if (notify_visitors.data.push_details.chicklet == "2" || notify_visitors.data.push_details.chicklet == "3") {
            var elms = document.querySelectorAll("[id='" + notify_visitors.data.push_details.chicklet_onclick_id + "']");
            if (elms.length >= 2) {
                for (var i = 0; i < elms.length; i++) {
                    if (elms[i].offsetWidth !== 0 && elms[i].offsetHeight !== 0) {
                        client_element_id = elms[i];
                        break;
                    }
                }
            } else {
                client_element_id = document.getElementById(notify_visitors.data.push_details.chicklet_onclick_id);
            }
        }

        if (client_element_id) {
            if (notify_visitors.data.push_details.notification_center_count_css) {
                notify_visitors.notificationCenterCount.successResultNC(notify_visitors.data.push_details, client_element_id);
            }

            var div = document.createElement("div");
            div.id = "notification_center_iframe_parent_div";
            client_element_id.appendChild(div);

            if (notify_visitors.data.push_details.chicklet == "3" && notify_visitors.cookie.isMobile() !== 1) {
                client_element_id.onmouseover = function () {
                    notify_visitors.notificationCenterCount.hideCount();
                    notify_visitors.push_widget.nvCenterData();
                };
                var el_out = document.getElementById('notification_center_iframe_parent_div');
                if (el_out) {
                    client_element_id.onmouseleave = function () {
                        if (el_out.onmouseover) {
                            el_out.onmouseout = function () {
                                el_out.style.display = 'none';
                            };
                        } else {
                            el_out.style.display = 'none';
                        }
                    };
                }
            } else {
                client_element_id.onclick = function () {
                    notify_visitors.notificationCenterCount.hideCount();
                    if (notify_visitors.cookie.isMobile() === 1) {
                        notify_visitors.push_widget.mobNvCenterData();
                    } else {
                        notify_visitors.push_widget.nvCenterData();
                    }
                };
            }
        }
    };

    push_widget.mobNvCenterData = function (e) {
        var d = document.getElementById("nvpush_nvcenter_mobileiframe_parent");
        if (!d) {
            var div = document.createElement('div');
            div.innerHTML = notify_visitors.data.push_details.notification_center_iframe.iframe;
            document.body.appendChild(div);

            if (document.getElementById("nvpush_notification_center_mobile_iframe")) {
                if (notify_visitors.data.push_details.notification_center_iframe.resize != undefined && notify_visitors.data.push_details.notification_center_iframe.resize === '1') {
                    var iFrameHeight = document.getElementById("nvpush_notification_center_mobile_iframe").scrollHeight;
                    if (iFrameHeight <= 300) {
                        iFrameHeight += 75;
                        document.getElementById("nvpush_nvcenter_mobileiframe_parent").style.height = iFrameHeight + 'px';
                    }
                }
                var doc = document.getElementById("nvpush_notification_center_mobile_iframe").contentWindow.document;
                doc.open();
                doc.write(notify_visitors.data.push_details.notification_center_iframe_svg);
                doc.close();
            }
            setTimeout(function () {
                notify_visitors.data.push_center = {};
                notify_visitors.data.push_center = notify_visitors.data.auth;

                if (notify_visitors.data.push_subscriber != undefined) {
                    notify_visitors.data.push_center.subscriptionID = notify_visitors.data.push_subscriber;
                }
                if (notify_visitors.data.showChicklet != undefined) {
                    notify_visitors.data.push_center.showChicklet = notify_visitors.data.showChicklet;
                }
                notify_visitors.nv_jsonp.get(notify_visitors.data.urls.push_center, notify_visitors.data.push_center, notify_visitors.push_widget.mobNvCenterResponse);
            }, 1);
        } else {
            notify_visitors.push_widget.mobNvCenterVisibility();
        }
    };

    push_widget.mobNvCenterResponse = function (output) {
        if (document.getElementById("nvpush_notification_center_mobile_iframe")) {
            var doc = document.getElementById("nvpush_notification_center_mobile_iframe").contentWindow.document;
            doc.open();
            doc.write(output.view);
            doc.close();
        }
    };

    push_widget.mobNvCenterVisibility = function () {
        var d = document.getElementById('nvpush_nvcenter_mobileiframe_parent');
        if (d.style.display === 'block') {
            d.style.display = 'none';
        } else {
            d.style.display = 'block';
        }
    };

    push_widget.nvCenterData = function (e) {
        var d = document.getElementById("nvpush_notification_center_iframe");
        if (!d) {
            var div = document.getElementById('notification_center_iframe_parent_div');
            div.innerHTML = notify_visitors.data.push_details.notification_center_iframe.iframe;
            if (document.getElementById("nvpush_notification_center_iframe")) {
                var doc = document.getElementById("nvpush_notification_center_iframe").contentWindow.document;
                doc.open();
                doc.write(notify_visitors.data.push_details.notification_center_iframe_svg);
                doc.close();
            }
            setTimeout(function () {
                notify_visitors.data.push_center = {};
                notify_visitors.data.push_center = notify_visitors.data.auth;

                if (notify_visitors.data.push_subscriber != undefined) {
                    notify_visitors.data.push_center.subscriptionID = notify_visitors.data.push_subscriber;
                }
                if (notify_visitors.data.showChicklet != undefined) {
                    notify_visitors.data.push_center.showChicklet = notify_visitors.data.showChicklet;
                }
                notify_visitors.nv_jsonp.get(notify_visitors.data.urls.push_center, notify_visitors.data.push_center, notify_visitors.push_widget.nvCenterResponse);
            }, 1);
        } else {
            if (notify_visitors.data.push_details.chicklet == "3" && !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
                document.getElementById("notification_center_iframe_parent_div").style.display = 'block';
            } else {
                notify_visitors.push_widget.nvCenterVisibility();
            }
        }
    };

    push_widget.nvCenterResponse = function (output) {
        if (document.getElementById("nvpush_notification_center_iframe")) {
            var doc = document.getElementById("nvpush_notification_center_iframe").contentWindow.document;
            doc.open();
            doc.write(output.view);
            doc.close();
        }
    };

    push_widget.nvCenterVisibility = function () {
        var d = document.getElementById('nvpush_notification_center_iframe');
        if (d.style.visibility === 'visible') {
            d.style.visibility = 'hidden';
            document.getElementById("notification_center_iframe_parent_div").style.display = "none";
            document.getElementById('nv-pick').style.visibility = 'hidden';
        } else {
            d.style.visibility = 'visible';
            document.getElementById("notification_center_iframe_parent_div").style.display = "block";
            document.getElementById('nv-pick').style.visibility = 'visible';
        }
    };

    push_widget.nvCenterAllow = function () {
        if (notify_visitors.data.push_details.native == 1 || (notify_visitors.data.push_details.hosted == 1 && 'https:' == document.location.protocol)) {
            notify_visitors.manual.askPushPermission();
        } else {
            notify_visitors.push_confirm_popup.positive();
        }
    };

    return push_widget;
})(window);// We call our anonymous function immediately


notify_visitors.push_confirm_popup = (function (window, undefined) {
    var document = window.document;
    var push_confirm_popup = {};
    push_confirm_popup = {
        initialize: function (options) {
            var positive;
            positive = document.getElementById("notify-visitors-confirm-popup-btn-positive");
            notify_visitors.cookie.bindEvent(positive, "click", function () {
                return notify_visitors.push_confirm_popup.positive();
            });
            var negative;
            negative = document.getElementById("notify-visitors-confirm-popup-btn-negative");
            notify_visitors.cookie.bindEvent(negative, "click", function () {
                return notify_visitors.push_confirm_popup.negative(options);
            });
            return this;
        },
        positive: function () {
            //notify_visitors.cookie.set("nv_push_pos",1);

            if (document.getElementById('notify-visitors-push-confirm-popup')) {
                document.getElementById('notify-visitors-push-confirm-popup').style.display = "none";
            }
            var w = 600;
            var h = 600;
            var left = Number((screen.width / 2) - (w / 2));
            var tops = Number((screen.height / 2) - (h / 2));

            if (notify_visitors.data.push_details.hosted == 1) {
                var href = notify_visitors.data.push_details.hosted_link;
                href += (href.indexOf('?') === -1) ? '?' : '&';
                href += 'nv_url=' + encodeURIComponent(notify_visitors.data.settings.pageUrl);

                if (href.indexOf('notifyvisitors_push/chrome/custom.html') !== -1) {
                    href += '&bid=' + notify_visitors.data.auth.bid + '&bid_e=' + notify_visitors.data.auth.bid_e + '&t=' + notify_visitors.data.auth.t;
                }
            } else {
                var href = notify_visitors.data.urls.permissionBox + '?bid=' + notify_visitors.data.auth.bid + '&bid_e=' + notify_visitors.data.auth.bid_e + '&t=' + notify_visitors.data.auth.t;
                if (notify_visitors.data.pushsubscribe && notify_visitors.data.pushsubscribe.userID) {
                    href += '&userID=' + notify_visitors.data.pushsubscribe.userID;
                }
                href += '&pageUrl=' + notify_visitors.data.settings.pageUrl;
            }

            window.open(href, "_blank", 'width=500, height=500,top=' + tops + ', left=' + left + '');
        },
        negative: function (options) {
            if (document.getElementById('notify-visitors-push-confirm-popup')) {
                document.getElementById('notify-visitors-push-confirm-popup').style.display = "none";
            }

            notify_visitors.cookie.set("nv_push_neg", 1);

            var c = notify_visitors.cookie.get("nv_push_times");
            c = parseInt(c);
            c = (!c) ? 1 : c + 1;
            var date = new Date();
            date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
            var expires = date.toGMTString();
            notify_visitors.cookie.set("nv_push_times", c, expires);

            //notify_visitors.push_widget.chickLet(options, notify_visitors.push_confirm_popup.positive);
        },
        native_popup_msg: function () {
            var div = document.createElement('div');
            div.id = 'notifyvisitor_thank_push_popup';

            var sheet = document.createElement('style');
            sheet.type = "text/css";
            sheet.innerHTML = ".notifyvisitors_push_btn{margin-top: 11px !important; background: #fff; border: 1px solid #828282;color: #1a1a1a; margin-bottom: 30px !important; padding: 10px !important; border-radius: 4px !important; width: 140px !important; font-size: 13px !important; letter-spacing: 4px !important;  transition: all .3s ease-out; cursor: pointer; !important}.notifyvisitors_push_btn:hover{box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);cursor:pointer;}.notifyvisitors_push_txt{margin-top: 15px; font-size: 14px; color: #FF9595;}  @media only screen and (max-width: 600px) and (min-height: 300px){ .notifyvisitors_push_content{background: #fff none repeat scroll 0 0; border-radius: 10px; display: inline-block; left: 50%; position: absolute; text-align: center; top: 50%; transform: translate(-50%, -50%); width: 90%!important;} .notifyvisitors_push_txt{color: #ff9595; font-size: 100%; margin-top: 15px;}} @media only screen and (max-width: 800px){ .notifyvisitors_push_content{background: #fff none repeat scroll 0 0; border-radius: 10px; display: inline-block; left: 50%; position: absolute; text-align: center; top: 50%; transform: translate(-EUNITNO50%, -50%); width: 85%;}.notifyvisitors_push_head_txt{font-size: 120%;} .notifyvisitors_push_txt{color: #ff9595; font-size: 100%; margin-top: 15px;}}";
            document.body.appendChild(sheet);

            var white_label = '';
            if (notify_visitors.data.push_white_label === false) {
                white_label = '<div style="text-align: right !important;position: absolute !important; right: 0px !important;margin-top: 5px !important;">'
                        + '<a href="https://www.notifyvisitors.com" target="_blank" style="text-decoration: none !important;cursor: pointer !important; color: rgb(255, 255, 255) !important; font-size: 10px !important; position: absolute !important;margin-top: 3px !important; top: 88px !important; right: 9px !important; width: 126px !important;color:#888888; !important"> Powered by NotifyVisitors</a>'
                        + '</div>';
            }
            div.innerHTML = '<div onclick="notify_visitors.push_confirm_popup.thank_popup_msg();" style="position:fixed !important;top:0px !important;left:0px !important;width:100% !important;height:100% !important;background:rgba(0, 0, 0, 0.32) !important; z-index: 9999999 !important;"class="notifyvisitors_push_overlay">'
                    + '<div style="text-align: center !important; display:table-cell !important; vertical-align:middle !important;" class="notifyvisitors_push_container"> '
                    + '<div style="position:absolute !important;top:50% !important;left:50% !important;width:330px !important;transform:translate(-50%,-50%) !important;background:#fff !important;border-radius:10px 10px 0px 0px !important;border-radius:10px !important;text-align: center !important; display:inline-block !important;" class="notifyvisitors_push_content">'
                    + '<center>'
                    + '<div style="padding-bottom: 10px !important;border-radius:10px 10px 0px 0px !important;background: #fff !important; color: #414141 !important;padding: 30px 30px 13px 30px; !important"class="notifyvisitors_push_top">'
                    + '<div style="font-size: 21px !important;letter-spacing: 0px !important;line-height: 30px !important;color: #494949; !important" class="notifyvisitors_push_head_txt">Thank you for subscribing to push notifications!</div>'
                    + white_label
                    + '</div>'
                    + '<div class="notifyvisitors_push_btn">CLOSE</div>'
                    + '</center> </div></div></div>';
            document.body.appendChild(div);
        },
        thank_popup_msg: function () {
            if (document.getElementById('notifyvisitor_thank_push_popup')) {
                document.getElementById('notifyvisitor_thank_push_popup').style.display = 'none';
            }

            var href = (notify_visitors.data.push_details.hosted == 1) ? notify_visitors.data.push_details.hosted_link + "/notifyvisitors_push/chrome/native.html" : notify_visitors.data.urls.native_thanks;
            href += '?bid=' + notify_visitors.data.auth.bid + '&bid_e=' + notify_visitors.data.auth.bid_e + '&t=' + notify_visitors.data.auth.t;
            if (notify_visitors.data.pushsubscribe && notify_visitors.data.pushsubscribe.userID) {
                href += '&userID=' + notify_visitors.data.pushsubscribe.userID;
            }
            href += '&pageUrl=' + notify_visitors.data.settings.pageUrl;

            var w = 150;
            var h = 150;
            var left = Number(innerWidth - w);
            var tops = Number(innerHeight - h);
            window.open(href, "_blank", 'width=190, height=130,left=0,top=' + tops + '');
        }

    };
    return push_confirm_popup;
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
        brandSettings: baseUrl + 'brand/t2/settings',
        getNotification: baseUrl + 'brand/t2/getNotification',
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
                    fs(window.TEMPORARY, 100, function (fs) {
                    }, function (err) {
                        notify_visitors.data.isIncognito = 1;
                    });
                }
            } else if (/firefox/i.test(ua)) {
                function retry(isDone, next) {
                    var current_trial = 0, max_retry = 50, interval = 10, is_timeout = false;
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
            }
            else if (/chrome/i.test(ua)) {
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
            }
            else if (ua.indexOf("Safari") > 0 && ua.indexOf("Chrome") == -1) {
                notify_visitors.data.isSafari = 1;
                version = ua.substring(0, ua.indexOf("Safari")).substring(ua.substring(0, ua.indexOf("Safari")).lastIndexOf("/") + 1);
                if (parseInt(version, 10) >= 7) {
                    notify_visitors.data.isSafariPush = 1;
                }
            }
            else if (/firefox/i.test(ua)) {
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
                ga('send', 'event', 'NotifyVisitors', id + ' - ' + name, value, 1, {nonInteraction: true});
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
    var counter = 0, head, query, key, window = this;
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
        window[ jsonp ] = function (data) {
            callback(data);
            try {
                delete window[ jsonp ];
            } catch (e) {
            }
            window[ jsonp ] = null;
        };
        load(url + query + "js_callback=" + jsonp);
        return jsonp;
    }
    return {
        get: jsonp
    };

}(window));



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
    
    /////code for heatmap/////////
    if (notify_visitors.auth.bid == '2137' || notify_visitors.auth.bid == '2429') {
        (function (n, o, t, i, f, y) {
    //                var a = o.createElement('style'),
    //                b = 'body{opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important;}',
    //                h = o.getElementsByTagName('head')[0];
    //                a.setAttribute('id', '_nv_hm_hidden_element');
    //                a.setAttribute('type', 'text/css');
    //                if (a.styleSheet) a.styleSheet.cssText = b;
    //                else a.appendChild(o.createTextNode(b));
    //                h.appendChild(a);
            n[i] = function () {
                (n[i].q = n[i].q || []).push(arguments)
            };
            n[i].l = new Date;
            n[t] = {};
            n[t].auth = {bid_e: notify_visitors.data.auth.bid_e, bid: notify_visitors.data.auth.bid, t: '420'};
            n[t].async = false;
            n[t].tokens = notify_visitors.tokens;
            n[t].ruleData = notify_visitors.ruleData;
            (y = o.createElement('script')).type = 'text/javascript';
            y.src = "https://cdnhm.notifyvisitors.com/js/notify-visitors-heatmap-1.0.js";
            (f = o.getElementsByTagName('script')[0]).parentNode.insertBefore(y, f);
        })(window, document, '_nv_hm', 'nvheat');
    }     
}




function notify_mainAction() {
    notify_visitors.manual = notify_visitors.manual(document);
    notify_visitors.manual.loadjQuery();

    //find xpath script
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
    } catch (e) {
    }
}, false);

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
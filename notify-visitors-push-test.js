notify_visitors.manual.event = function (name, attributes, ltv, scope) {
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


notify_visitors.manual.actions = function (action) {
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

notify_visitors.manual.dimensions = function (key, value) {
    if (key && value) {
        if (typeof (Storage) !== "undefined") {

            var oldDimen = {};
            var fwd = 0;
            var oldDimenStr = localStorage.getItem("nv_dimen");
            if (oldDimenStr) {
                oldDimen = JSON.parse(oldDimenStr);
                if (oldDimen[key] !== "undefined" && oldDimen[key] != value) {
                    fwd = 1;
                }
            } else {
                fwd = 1;
            }

            if (fwd == 1) {
                oldDimen[key] = value;
                localStorage.setItem("nv_dimen", JSON.stringify(oldDimen));

                var data = notify_visitors.data.settings;
                data.dimension = JSON.stringify({
                    key: key,
                    value: value
                });
                notify_visitors.nv_jsonp.get(notify_visitors.data.urls.dimensions, data, notify_visitors.manual.dimensionsResponse);
            }
        }
    }
};

notify_visitors.manual.dimensionsResponse = function (output) {
    //console.log(output);
};

notify_visitors.manual.user = function (userID, attributes) {
    if (userID) {
        notify_visitors.data.settings.userID = userID;
        notify_visitors.data.settings.userParams = attributes ? JSON.stringify(attributes) : '';

        notify_visitors.nv_jsonp.get(notify_visitors.data.urls.user, notify_visitors.data.settings, notify_visitors.manual.userResponse);
    }
};

notify_visitors.manual.userResponse = function (output) {

};


notify_visitors.manual.pushevent = function (name, attributes, ltv, scope) {
    var nv_push_subscribe = notify_visitors.cookie.get("nv_push_subscribe");
    if (nv_push_subscribe) {
        notify_visitors.manual.event(name, attributes, ltv, scope);
    }
};


notify_visitors.manual.pushLaunchResponse = function (output) {
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

notify_visitors.manual.askPushPermission = function () {
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


notify_visitors.manual.schedulePush = function (options) {
    if (options && options.tag && options.notificationID && options.time) {
        var nv_push_subscribe;
        if (notify_visitors.data.push_subscriber) {
            nv_push_subscribe = notify_visitors.data.push_subscriber;
        } else {
            nv_push_subscribe = notify_visitors.cookie.get("nv_push_subscribe");
        }

        if (nv_push_subscribe) {
            var data = notify_visitors.data.settings;
            data.subscriptionID = nv_push_subscribe;
            data.notificationID = options.notificationID;
            data.tag = options.tag;
            data.time = options.time;
            if (options.title) {
                data.title = options.title;
            }
            if (options.message) {
                data.message = options.message;
            }
            if (options.icon) {
                data.icon = options.icon;
            }
            if (options.url) {
                data.url = options.url;
            }
            notify_visitors.nv_jsonp.get(notify_visitors.data.urls.schedule_push, data, notify_visitors.manual.schedulePushResponse);
        }
    }
};



notify_visitors.manual.schedulePushResponse = function (output) {
    //console.log(output);
};




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
            serviceWorkerRegistration.pushManager.subscribe({ userVisibleOnly: true })
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
            navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
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
                            var coords = { lat: position.coords.latitude, long: position.coords.longitude };
                            var data = { coords: coords, timestamp: time };
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


notify_visitors.notificationCenterCount = (function (window, undefined) {
    var document = window.document;
    var notificationCenterCount = {};
    notificationCenterCount = {
        hideCount: function () {
            var lastSeenDate = notify_visitors.notificationCenterCount.setDateFormat();
            notify_visitors.cookie.ls_set('nv_center_count_date', lastSeenDate);
            var el = document.getElementById('_nv-notification-count');
            if (el) {
                el.style.display = 'none';
            }
        },
        setDateFormat: function () {
            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + ' ' + time;
            return dateTime;
        },
        successResultNC: function (result, client_id) {
            var currentDate = notify_visitors.cookie.ls_get('nv_center_count_date');
            if (!currentDate) {
                currentDate = '1970-01-01 00:00:00';
            }

            var dateArray = result.notification_center_count;
            var c = 0;
            if (dateArray.length) {
                for (i = 0; i < dateArray.length; i++) {
                    var inboxDate = dateArray[i];
                    if (inboxDate > currentDate) {
                        c++;
                    }
                }
            }
            if (c > 0) {
                var div = document.createElement('div');
                div.id = '_nv-notification-count';
                var style = result.notification_center_count_css;
                div.innerHTML = '<div class="_nv-notification-inner-count">' + c + '</div>' + style;
                client_id.appendChild(div);
            }
        }
    };
    return notificationCenterCount;
})(window);


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





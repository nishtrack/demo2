notify_visitors.manual.webSettingsResponse = function (output) {
    if (notify_visitors.data.tokens) {
        notify_visitors.data.tokensQuery = '&tokens=' + encodeURIComponent(notify_visitors.data.tokens);
    } else {
        notify_visitors.data.tokensQuery = '';
    }

    if (output.brand_custom_rule_data !== undefined && notify_visitors.data.ruleData) {
        notify_visitors.data.ruleData = output.brand_custom_rule_data;
    }

    //visitor type - all,new,returning
    var vt = 0;
    var vt_ls = notify_visitors.cookie.ls_get("no_vi_vt");
    vt_ls = parseInt(vt_ls);
    if (!vt_ls) {
        notify_visitors.cookie.ls_set("no_vi_vt", 1);
        notify_visitors.cookie.set("no_vi_vt", 1, 0);
    } else {
        var vt_c = notify_visitors.cookie.get("no_vi_vt");
        vt_c = parseInt(vt_c);
        if (!vt_c) {
            vt = 1;
        }
    }

    //time spent by visitor
    var ts = notify_visitors.cookie.get("ts");
    ts = parseInt(ts);
    if (!ts) {
        ts = 0;
    }
    setInterval(function () {
        ts = ts + 1;
        notify_visitors.cookie.set("ts", ts);
    }, 1000);

    //visitor page views
    var pv = notify_visitors.cookie.get("pv");
    var pv = parseInt(pv);
    var pv = (!pv) ? 1 : pv + 1;
    notify_visitors.cookie.set("pv", pv);

    var sequence = 0;

    var notifications = output.notifications;
    if (notifications.length > 0) {
        for (var i = 0; i < notifications.length; i++) {

            //cookies disabled
            if (!navigator.cookieEnabled && notifications[i].template == 2 && notifications[i].noOfTimesPerUser < 5) {
                continue;
            }

            //do not show if closed by user
            var shw_x = notify_visitors.cookie.get("shw_x_" + notifications[i].notificationID);
            if (shw_x && shw_x == 1 && notifications[i].notificationID != '11163') {
                continue;
            }

            //check dynamic tokens
            var dynamicTokens = notifications[i].dynamicTokens;
            if (notifications[i].hideTokens == 1 && dynamicTokens) {
                var forword = 1;
                var tokens = (notify_visitors.data.tokens) ? JSON.parse(notify_visitors.data.tokens) : {};
                for (var k in dynamicTokens) {
                    if (!dynamicTokens[k] && !tokens[k]) {
                        forword = 0;
                        break;
                    }
                }
                if (!forword) {
                    continue;
                }
            }

            if (pv <= notifications[i].pageviews) {
                continue;
            }

            //visitor type - all,new,returning
            if ((!vt && notifications[i].visitorType == 2) || (vt && notifications[i].visitorType == 1)) {
                continue;
            }

            //cookie rule
            var forword = 1;
            var cookieRule = notifications[i].cookie;
            if (cookieRule.length > 0) {
                forword = 0;
                for (var l = 0; l < cookieRule.length; l++) {
                    forword = 0;
                    var cr = notify_visitors.cookie.get(cookieRule[l]['n']);
                    var length = cookieRule[l]['v'].length;
                    if ((cookieRule[l]['c'] == 4 && cr) || (cookieRule[l]['c'] == 5 && !cr) || (cookieRule[l]['c'] == 0 && cr == cookieRule[l]['v'])
                        || (cookieRule[l]['c'] == 1 && cr.substring(0, length) == cookieRule[l]['v'])
                        || (cookieRule[l]['c'] == 2 && cr.indexOf(cookieRule[l]['v'], cr.length - cookieRule[l]['v'].length) !== -1)
                        || (cookieRule[l]['c'] == 3 && cr.indexOf(cookieRule[l]['v']) > -1)) {
                        forword = 1;
                    }
                    if ((notifications[i].cookieGC == 1 && !forword) || (notifications[i].cookieGC == 0 && forword)) {
                        break;
                    }
                }
            }
            if (!forword) {
                continue;
            }

            //custom rule
            var forword = 1;
            var customRules = notifications[i].customRule;
            if (customRules.length > 0) {
                forword = 0;
                for (var j = 0; j < customRules.length; j++) {
                    forword = 0;

                    if (notify_visitors.data.ruleData && notify_visitors.data.ruleData[customRules[j]['e']] != undefined) {
                        var rule_value = notify_visitors.data.ruleData[customRules[j]['e']];
                    } else if (customRules[j]['h']) {
                        var xpath_value = document.evaluate('' + customRules[j]['h'], document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (xpath_value != null) {
                            var rule_value = xpath_value.innerHTML;
                        }
                    }

                    if (rule_value != undefined) {
                        if (customRules[j]['d'] == 0) {
                            if (customRules[j]['c'] == 0 && rule_value == customRules[j]['v']) {
                                forword = 1;
                            } else if (customRules[j]['c'] == 1 && rule_value != customRules[j]['v']) {
                                forword = 1;
                            } else if (customRules[j]['c'] == 4 && rule_value.indexOf(customRules[j]['v']) > -1) {
                                forword = 1;
                            } else if (customRules[j]['c'] == 5 && rule_value.indexOf(customRules[j]['v']) == -1) {
                                forword = 1;
                            }
                        } else if (customRules[j]['d'] == 1) {
                            if (customRules[j]['c'] == 0 && Number(rule_value) == customRules[j]['v']) {
                                forword = 1;
                            } else if (customRules[j]['c'] == 1 && Number(rule_value) != customRules[j]['v']) {
                                forword = 1;
                            } else if (customRules[j]['c'] == 2 && Number(rule_value) > customRules[j]['v']) {
                                forword = 1;
                            } else if (customRules[j]['c'] == 3 && Number(rule_value) < customRules[j]['v']) {
                                forword = 1;
                            }
                        } else if (customRules[j]['d'] == 2) {
                            var first = new Date(rule_value).getTime();
                            var second = new Date(customRules[j]['v']).getTime();
                            if (customRules[j]['c'] == 0 && first == second) {
                                forword = 1;
                            } else if (customRules[j]['c'] == 1 && first != second) {
                                forword = 1;
                            } else if (customRules[j]['c'] == 2 && first > second) {
                                forword = 1;
                            } else if (customRules[j]['c'] == 3 && first < second) {
                                forword = 1;
                            }
                        } else if (customRules[j]['d'] == 3) {
                            if (customRules[j]['c'] == 0 && rule_value === customRules[j]['v']) {
                                forword = 1;
                            } else if (customRules[j]['c'] == 1 && rule_value !== customRules[j]['v']) {
                                forword = 1;
                            }
                        }
                    }

                    if ((notifications[i].customRuleGC == 1 && !forword) || (notifications[i].customRuleGC == 0 && forword)) {
                        break;
                    }
                }
            }
            if (!forword) {
                continue;
            }

            //no of times per visitor
            var shw = notify_visitors.cookie.get("shw_" + notifications[i].notificationID);
            shw = parseInt(shw);
            if (shw && notifications[i].noOfTimesPerUser && shw >= notifications[i].noOfTimesPerUser) {
                continue;
            }

            //sequence
            if (sequence != 0 && notifications[i].sequence != sequence) {
                continue;
            } else {
                sequence = notifications[i].sequence;
            }

            if (ts < notifications[i].timeSpentOnSite) {
                var timeDelay = notifications[i].timeSpentOnSite - ts;
                if (timeDelay > notifications[i].timeDelayPage) {
                    notifications[i].timeDelayPage = timeDelay;
                }
            }

            if (notifications[i].leaveIntent == 1) {
                notify_visitors.widget.leaveIntent(notifications[i]);
                continue;
            }

            if (notifications[i].scroll != undefined && notifications[i].scroll > 0) {
                notify_visitors.widget.scrollEvent(notifications[i]);
                continue;
            }

            notify_visitors.style.style('.nv-animated{-webkit-animation-duration:1s;animation-duration:1s;-webkit-animation-fill-mode:both;animation-fill-mode:both}.nv-animated.infinite{-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite}.nv-animated.hinge{-webkit-animation-duration:2s;animation-duration:2s}.nv-animated.bounceIn,.nv-animated.bounceOut,.nv-animated.flipOutX,.nv-animated.flipOutY{-webkit-animation-duration:.75s;animation-duration:.75s}');

            if (['1', '5'].indexOf(notifications[i].template) >= 0) {
                notify_visitors.widget.singleLineBar(notifications[i]);
            } else if (['2', '52', '32', '33', '10', '11', '36', '38'].indexOf(notifications[i].template) >= 0) {
                notify_visitors.widget.modal(notifications[i]);
            } else if (['3', '7', '31'].indexOf(notifications[i].template) >= 0) {
                notify_visitors.widget.box(notifications[i]);
            } else if (['4', '6', '35'].indexOf(notifications[i].template) >= 0) {
                notify_visitors.widget.multiLineBar(notifications[i]);
            } else if (['51', '53', '37'].indexOf(notifications[i].template) >= 0) {
                notify_visitors.widget.mobileBar(notifications[i]);
            } else if (['34', '8'].indexOf(notifications[i].template) >= 0) {
                notify_visitors.widget.classic(notifications[i]);
            } else if (['9', '12', '54'].indexOf(notifications[i].template) >= 0) {
                notify_visitors.widget.floatingHtml(notifications[i]);
            }
        }
    }
};


//widget
notify_visitors.widget = (function (window, undefined) {
    var document = window.document;
    var widget = {};

    widget.singleLineBar = function (value, leaveIntent) {
        if (leaveIntent != undefined && leaveIntent == 1) {
            value.timeDelayPage = 0;
        }
        //delay per page
        var delay = value.timeDelayPage * 1000;
        setTimeout(function () {
            var element = document.getElementById('notify-visitors-notification_' + value.notificationID);
            if (!element) {
                notify_visitors.style.shw_cookie(value);

                var div = document.createElement('div');

                notify_visitors.style.close_button('notify-visitors-notification-close-button_' + value.notificationID, value.close_btn);


                //                var iframe = value.html.iframe
                //                        + closeBtn;

                notify_visitors.style.style(value.animation_style);

                //                if (value.minimise == 1) {
                //                    var minBtnStyle = '';
                //                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                //                        minBtnStyle = 'right: 2px;';
                //                    } else {
                //                        minBtnStyle = 'right: 24px;';
                //                    }
                //
                //                    if (value.pos == 0) {
                //                        var position = (value.fixTop == 1) ? 'fixed' : 'absolute';
                //
                //                        div.innerHTML = '<div style="height:35px;" id="notify-visitors-notification-bar_' + value.notificationID + '">'
                //                                + '<div style="z-index: 9999999; position:' + position + '; background-color: transparent; border: medium none; overflow: hidden;top: 0px; left: auto; height: 35px; right: 0px; width: 100%; display: block;">'
                //                                + iframe
                //                                + '<a style="cursor: pointer;position: absolute;top: 7px;' + minBtnStyle + 'display: inline-block;text-align: center;width: 20px;height: 20px;color: white;z-index: 10000001;" id="notify-visitors-notification-top-minimise-button_' + value.notificationID + '" href="javascript:void(0);">'
                //                                + notify_visitors.ui.arrowUpImg(11, 11, value.ctaBgColor)
                //                                + '</a>'
                //                                + '</div>'
                //                                + '</div>'
                //                                + '<a style="cursor: pointer;position:  ' + position + ';border-bottom-left-radius: 5px;border-bottom-right-radius: 5px;top: 0px;right: 15px;text-align: center;width: 30px;color: white;z-index: 10000001;visibility:hidden;background-color:' + value.bgColor + '; border: 2px solid ' + value.ctaBgColor + ';border-top: 0px;" id="notify-visitors-notification-top-maximise-button_' + value.notificationID + '" href="javascript:void(0);">'
                //                                + notify_visitors.ui.arrowDownImg(13, 13, value.ctaBgColor)
                //                                + '</a>';
                //                    } else {
                //                        div.innerHTML = '<div id="notify-visitors-notification-bar_' + value.notificationID + '" style="z-index: 9999999; position: fixed; background-color: transparent; border: medium none; overflow: hidden; bottom: 0px; left: auto; height: 35px; right: 0px; width: 100%; display: block;">'
                //                                + iframe
                //                                + '<a style="cursor: pointer;position: absolute;bottom: 8px;' + minBtnStyle + 'display: inline-block;text-align: center;width: 20px;height: 20px;color: white;z-index: 10000001;"  id="notify-visitors-notification-bottom-minimise-button_' + value.notificationID + '" href="javascript:void(0);">'
                //                                + notify_visitors.ui.arrowDownImg(11, 11, value.ctaBgColor)
                //                                + '</a>'
                //                                + '</div>'
                //                                + '<a style=" cursor: pointer;position: fixed;padding-top: 8px;border-top-left-radius: 5px;border-top-right-radius: 5px;bottom: 0px;right: 15px;text-align: center;width: 30px; color: white;z-index: 10000001;visibility:hidden;background-color:' + value.bgColor + '; border: 2px solid ' + value.ctaBgColor + ';border-bottom: 0px;" id="notify-visitors-notification-bottom-maximise-button_' + value.notificationID + '" href="javascript:void(0);">'
                //                                + notify_visitors.ui.arrowUpImg(13, 13, value.ctaBgColor)
                //                                + '</a>';
                //                    }
                //                } else {
                //                    var pos = (value.pos == 0) ? 'top: 0px;' : 'bottom: 0px;';
                //                    div.innerHTML = '<div id="notify-visitors-notification-bar_' + value.notificationID + '" style="z-index: 9999999; position: fixed; background-color: transparent; border: medium none; overflow: hidden; visibility: visible; ' + pos + ' left: auto; height: 35px; right: 0px; width: 100%; display: block;">'
                //                            + iframe
                //                            + '</div>';
                //
                //                    if (value.pos == 0) {
                //                        div.style.height = '35px';
                //                    }
                //                }

                div.innerHTML = value.html.innerHTML;
                div.id = 'notify-visitors-notification_' + value.notificationID;

                if (document.body.firstChild) {
                    document.body.insertBefore(div, document.body.firstChild);
                } else {
                    document.body.appendChild(div);
                }

                if (value.html.iframe_data) {
                    var doc = document.getElementById("notify-visitors-notification-bar-iframe_" + value.notificationID).contentWindow.document;
                    doc.open();
                    doc.write(value.html.iframe_data);
                    doc.close();
                }

                if (value.hideOnScroll == 1) {
                    notify_visitors.manual.jQuery('#notify-visitors-notification_' + value.notificationID).addClass("_hideOnScroll");
                    notify_visitors.style.scroll();
                }

                notify_visitors.notifyBar.initialize(value);
            }
        }, delay);
    };

    widget.modal = function (value, leaveIntent) {
        if (leaveIntent != undefined && leaveIntent == 1) {
            value.timeDelayPage = 0;
        }
        var delay = value.timeDelayPage * 1000;
        setTimeout(function () {
            var element = document.getElementById('nv_js-modal-content');
            if (!element) {

                var href = notify_visitors.data.urls.modal;
                if (['32', '33', '36', '38'].indexOf(value.template) >= 0) {
                    href = notify_visitors.data.urls.modalSvy;
                }
                href += notify_visitors.data.auth.bid + '&notificationid=' + value.notificationID + notify_visitors.data.tokensQuery;

                notify_visitors.style.shw_cookie(value);


                notify_visitors.style.close_button('nv_js-modal-close-button', value.close_btn);

                if (['52', '33'].indexOf(value.template) >= 0) {
                    var width = window.innerWidth - 30;
                    var height = window.innerHeight - 30;
                } else if (['10'].indexOf(value.template) >= 0 && window.innerWidth < value.width) {
                    var ratio = value.width / value.height;
                    var width = window.innerWidth - 30;
                    var height = width / ratio;
                } else if (['11', '38'].indexOf(value.template) >= 0) {
                    var width = window.innerWidth;
                    var height = window.innerHeight;
                } else if (['36'].indexOf(value.template) >= 0) {
                    var width = window.innerWidth - 30;
                    var height = value.height;
                } else {
                    var width = (value.width) ? value.width : '400';
                    var height = (value.height) ? value.height : '250';
                }
                var modal = notify_visitors.nvJSModal.initialize(value);
                modal.openViaLink({ href: href, width: width + 'px', height: height + 'px', ctaBgColor: value.ctaBgColor, bgColor: value.bgColor, close_btn: value.close_btn, template: value.template, iframe: value.html });
            }
        }, delay);
    };

    widget.box = function (value, leaveIntent) {
        if (leaveIntent != undefined && leaveIntent == 1) {
            value.timeDelayPage = 0;
        }
        var delay = value.timeDelayPage * 1000;
        setTimeout(function () {
            var element = document.getElementById('notify-visitors-box-notification_' + value.notificationID);
            if (!element) {
                notify_visitors.style.shw_cookie(value);

                notify_visitors.style.close_button('nv_js-box-close-button_' + value.notificationID, value.close_btn);

                notify_visitors.style.style(value.animation_style);

                var div = document.createElement('div');
                div.innerHTML = value.html.box_view;
                div.id = 'notify-visitors-box-notification_' + value.notificationID;

                if (document.body.firstChild) {
                    document.body.insertBefore(div, document.body.firstChild);
                } else {
                    document.body.appendChild(div);
                }

                if (value.html.iframe_data) {
                    var doc = document.getElementById("nv_box_content-iframe_" + value.notificationID).contentWindow.document;
                    doc.open();
                    doc.write(value.html.iframe_data);
                    doc.close();
                }

                if (value.hideOnScroll == 1) {
                    notify_visitors.manual.jQuery('#notify-visitors-box-notification_' + value.notificationID).addClass("_hideOnScroll");
                    notify_visitors.style.scroll();
                }

                notify_visitors.nvJSBox.initialize(value);
            }
        }, delay);
    };

    widget.classic = function (value, leaveIntent) {
        if (leaveIntent != undefined && leaveIntent == 1) {
            value.timeDelayPage = 0;
        }
        var delay = value.timeDelayPage * 1000;
        setTimeout(function () {
            var element = document.getElementById('notify-visitors-box-notification_' + value.notificationID);
            if (!element) {
                notify_visitors.style.shw_cookie(value);

                var div = document.createElement('div');

                var href = notify_visitors.data.urls.box;
                if (value.template == 34) {
                    href = notify_visitors.data.urls.boxSvy;
                }
                href += notify_visitors.data.auth.bid + '&notificationid=' + value.notificationID + notify_visitors.data.tokensQuery;

                var closeBtn = '<a href="javascript:void(0);" onclick="notify_visitors.cookie.gapush(\'' + value.notificationID + '\',\'' + value.name + '\',\'Close\')" id="nv_js-box-close-button_' + value.notificationID + '" style=" cursor: pointer;position: absolute;display: inline-block;text-align: center;width: 20px;height: 20px;color: white;font-family: sans-serif;right: 6px; top: -18px; border-radius:0px; background: ' + value.bgColor + ';">'
                    + notify_visitors.ui.closeImg(10, 10, value.fontColor)
                    + '</a>';
                var minBtn = '<a id="nv_js-box-minimise-button_' + value.notificationID + '" href="javascript:void(0);" style="position:absolute; display:inline-block;right: 36px; top: -22px; background: ' + value.bgColor + ';">'
                    + notify_visitors.ui.arrowDownImg2(18, 18, value.fontColor)
                    + '</a>';
                var closeDiv = '<div style="right: -2px;top: -23px; background: ' + value.bgColor + ';width: 67px;height: 23px;border: 1px solid ' + value.ctaBgColor + ';border-right-bottom-radius: 24px;position: absolute;border-radius: 12px;border-bottom-right-radius: 0px;border-bottom-left-radius: 0px; border-bottom:0px;"></div>';

                var iframe = value.html.iframe
                    + closeBtn;

                notify_visitors.style.style(value.animation_style);

                var pos = "right:10px;";
                if (value.pos == 1) {
                    pos = "left:10px;";
                }

                if (value.minimise == 1) {
                    div.innerHTML = '<div id="nv_js-box_' + value.notificationID + '" class="nv-animated ' + value.animation + '" style="' + pos + 'bottom:0px; visibility: visible;position: fixed;z-index: 10000010;background: white;border-radius: 5px;">'
                        + '<div id="nv_js-box-content_' + value.notificationID + '" style="height: ' + value.height + 'px; width: ' + value.width + 'px;border-radius: 5px;background: white;">'
                        + closeDiv
                        + iframe
                        + minBtn
                        + '</div>'
                        + '</div>'
                        + '<a style="visibility:hidden; position:fixed; ' + pos + ' padding:10px; border-top-right-radius: 5px;border-top-left-radius: 5px;z-index: 1000001000; background-color:' + value.bgColor + '; border: 2px solid ' + value.ctaBgColor + ';border-bottom: 0px; bottom:0px;" id="nv_js-box-maximise-button_' + value.notificationID + '" href="javascript:void(0);">'
                        + notify_visitors.ui.arrowUpImg2(18, 18, value.fontColor)
                        + '</a>';
                } else {
                    div.innerHTML = '<div id="nv_js-box_' + value.notificationID + '" class="nv-animated ' + value.animation + '" style="' + pos + 'bottom:0px; visibility: visible;position: fixed;z-index: 10000010;background: white;border-radius: 5px;">'
                        + '<div id="nv_js-box-content_' + value.notificationID + '" style="height: ' + value.height + 'px; width: ' + value.width + 'px;border-radius: 5px;background: white;">'
                        + closeDiv
                        + iframe
                        + '</div>'
                        + '</div>';
                }

                div.id = 'notify-visitors-box-notification_' + value.notificationID;

                if (document.body.firstChild) {
                    document.body.insertBefore(div, document.body.firstChild);
                } else {
                    document.body.appendChild(div);
                }

                if (value.html.iframe_data) {
                    var doc = document.getElementById("nv_box_content-iframe_" + value.notificationID).contentWindow.document;
                    doc.open();
                    doc.write(value.html.iframe_data);
                    doc.close();
                }

                if (value.hideOnScroll == 1) {
                    notify_visitors.manual.jQuery('#notify-visitors-box-notification_' + value.notificationID).addClass("_hideOnScroll");
                    notify_visitors.style.scroll();
                }

                notify_visitors.nvJSBox.initialize(value);
            }
        }, delay);
    };

    widget.multiLineBar = function (value, leaveIntent) {
        if (leaveIntent != undefined && leaveIntent == 1) {
            value.timeDelayPage = 0;
        }
        //delay per page
        var delay = value.timeDelayPage * 1000;
        setTimeout(function () {
            var element = document.getElementById('notify-visitors-multi-bar-notification_' + value.notificationID);
            if (!element) {
                notify_visitors.style.shw_cookie(value);
                var div = document.createElement('div');

                if (value.template == 35) {
                    var href = notify_visitors.data.urls.stickyBarSvy + value.brandID + '&notificationid=' + value.notificationID;
                } else {
                    var href = notify_visitors.data.urls.multiLineBar + value.brandID + '&notificationid=' + value.notificationID;
                }

                var top = (value.template == 35) ? '30' : (value.height - 20) / 2;
                var height = (value.template == 35) ? '80' : value.height;

                var iframe = value.html.iframe
                    + '<a style="cursor: pointer;position: absolute;display:none;top: ' + top + 'px;right: 8px;text-align: center;width: 20px;height: 20px; border-radius: 3px;color: white;z-index: 10000001;" id="notify-visitors-multi-bar-notification-close-button_' + value.notificationID + '" onclick="notify_visitors.cookie.gapush(\'' + value.notificationID + '\',\'' + value.name + '\',\'Close\')" href="javascript:void(0);">'
                    + notify_visitors.ui.closeImg(15, 15, value.ctaBgColor)
                    + '</a>';

                notify_visitors.style.close_button('notify-visitors-multi-bar-notification-close-button_' + value.notificationID, value.close_btn);

                notify_visitors.style.style(value.animation_style);
                var border = (value.pos == 0) ? 'border-bottom : 1px solid ' + value.ctaBgColor + ';' : 'border-top : 1px solid ' + value.ctaBgColor + ';';

                //                if (value.minimise == 1) {
                //                    if (value.pos == 0) {
                //                        var position = (value.fixTop == 1) ? 'fixed' : 'absolute';
                //                        div.innerHTML = '<div style="height:' + height + 'px"  id="notify-visitors-multi-bar_' + value.notificationID + '">'
                //                                + '<div style="z-index: 9999999; position: ' + position + '; background-color: transparent; border: medium none; overflow: hidden; top:0px; left: auto; height: ' + height + 'px; right: 0px;' + border + ' width: 100%; display: block;">'
                //                                + iframe
                //                                + '<a style="cursor: pointer;position: absolute;top: ' + top + 'px;right: 40px;display: inline-block;text-align: center;width: 20px;height: 20px; border-radius: 3px;color: white;z-index: 10000001;" id="notify-visitors-multi-bar-top-minimise-button_' + value.notificationID + '" href="javascript:void(0);">'
                //                                + notify_visitors.ui.arrowUpImg(17, 17, value.ctaBgColor)
                //                                + '</a>'
                //                                + '</div>'
                //                                + '</div>'
                //                                + '<a style="cursor: pointer;position: ' + position + ';padding-top: 8px;border-bottom-left-radius: 5px;border-bottom-right-radius: 5px;top: 0px;right: 15px;display: inline-block;text-align: center;width: 35px;height: 35px; color: white;z-index: 10000001;visibility:hidden;background-color:' + value.bgColor + '; border: 3px solid ' + value.ctaBgColor + ';border-top: 0px;" id="notify-visitors-multi-bar-top-maximise-button_' + value.notificationID + '" href="javascript:void(0);">'
                //                                + notify_visitors.ui.arrowDownImg(16, 16, value.ctaBgColor)
                //                                + '</a>';
                //                    } else {
                //                        div.innerHTML = '<div  id="notify-visitors-multi-bar_' + value.notificationID + '">'
                //                                + '<div id="notify-visitors-multi-bar_' + value.notificationID + '" style="z-index: 9999999; position: fixed; background-color: transparent; border: medium none; overflow: hidden; bottom: 0px; left: auto; height: ' + height + 'px;right: 0px; width: 100%;' + border + ' display: block;">'
                //                                + iframe
                //                                + '<a style="cursor:pointer;position: absolute;top: ' + top + 'px;right: 40px;text-align: center;width: 20px;height: 20px;border-radius: 3px;color: white;z-index: 10000001;" id="notify-visitors-multi-bar-bottom-minimise-button_' + value.notificationID + '" href="javascript:void(0);">'
                //                                + notify_visitors.ui.arrowDownImg(17, 17, value.ctaBgColor)
                //                                + '</a>'
                //                                + '</div>'
                //                                + '</div>'
                //                                + '<a style="visibility:hidden;cursor: pointer;position: fixed;padding-top: 8px;border-top-left-radius: 5px;border-top-right-radius: 5px;bottom: 0px;right: 15px;text-align: center;width: 35px;height: 35px; color: white;z-index: 10000001;background-color:' + value.bgColor + '; border: 3px solid ' + value.ctaBgColor + ';border-bottom: 0px;" id="notify-visitors-multi-bar-bottom-maximise-button_' + value.notificationID + '" href="javascript:void(0);">'
                //                                + notify_visitors.ui.arrowUpImg(16, 16, value.ctaBgColor)
                //                                + '</a>';
                //                    }
                //                } else {
                //                    var pos = (value.pos == 0) ? 'top: 0px;' : 'bottom: 0px;';
                //                    div.innerHTML = '<div id="notify-visitors-multi-bar_' + value.notificationID + '" style="z-index: 9999999; position: fixed; background-color: transparent; border: medium none; overflow: hidden; visibility: visible; ' + pos + ' left: auto; height: ' + height + 'px; right: 0px; width: 100%; display: block;">'
                //                            + iframe
                //                            + '</div>';
                //
                //                    if (value.pos == 0) {
                //                        div.style.height = height + 'px';
                //                    }
                //                }

                div.id = 'notify-visitors-multi-bar-notification_' + value.notificationID;

                if (document.body.firstChild) {
                    document.body.insertBefore(div, document.body.firstChild);
                } else {
                    document.body.appendChild(div);
                }
                console.log(value.html.iframe_data);
                if (value.html.iframe_data) {
                    var doc = document.getElementById("notify-visitors-multi-bar-iframe_" + value.notificationID).contentWindow.document;
                    doc.open();
                    doc.write(value.html.iframe_data);
                    doc.close();
                }

                if (value.hideOnScroll == 1) {
                    notify_visitors.manual.jQuery('#notify-visitors-multi-bar-notification_' + value.notificationID).addClass("_hideOnScroll");
                    notify_visitors.style.scroll();
                }

                notify_visitors.notifyMultiBar.initialize(value);
            }
        }, delay);
    };

    widget.leaveIntent = function (value) {
        notify_visitors.nvLeaveIntent.initialize(value);
    };

    widget.scrollEvent = function (value) {
        notify_visitors.nvScroll.initialize(value);
    };

    widget.mobileBar = function (value) {
        //delay per page
        var delay = value.timeDelayPage * 1000;
        setTimeout(function () {
            var element = document.getElementById('notify-visitors-mobile-bar-notification_' + value.notificationID);
            if (!element) {
                notify_visitors.style.shw_cookie(value);

                var div = document.createElement('div');

                if (value.template == 37) {
                    var href = notify_visitors.data.urls.stickyBarSvy + value.brandID + '&notificationid=' + value.notificationID + notify_visitors.data.tokensQuery;
                } else {
                    var href = notify_visitors.data.urls.mobileBar + value.brandID + '&notificationid=' + value.notificationID + notify_visitors.data.tokensQuery;
                }

                notify_visitors.style.close_button('notify-visitors-notification-mobile-bar-close-button_' + value.notificationID, value.close_btn);

                var closeBtn = '<a style="cursor: pointer;position: absolute;top: 15px;right: 2px;display:none;text-align: center;width: 20px;height: 20px; border-radius: 50%;color: white;z-index: 10000001;" id="notify-visitors-notification-mobile-bar-close-button_' + value.notificationID + '" onclick="notify_visitors.cookie.gapush(\'' + value.notificationID + '\',\'' + value.name + '\',\'Close\')" href="javascript:void(0);">'
                    + notify_visitors.ui.closeImg(8, 8, value.ctaBgColor)
                    + '</a>';


                if (['53'].indexOf(value.template) >= 0) {
                    var width = window.innerWidth;
                    var ratio = value.width / value.height;
                    var height = width / ratio;
                } else if (value.template == 37) {
                    var width = window.innerWidth;
                    var height = value.height;
                } else {
                    var width = window.innerWidth;
                    var height = '50';
                }

                var iframe = value.html.iframe;



                notify_visitors.style.style(value.animation_style);

                var position = 'fixed';
                var pos = 'bottom: 0px;';
                if (value.pos == 0) {
                    pos = 'top: 0px;';
                    position = (value.fixTop == 1) ? 'fixed' : 'absolute';
                }

                div.innerHTML = '<div  id="notify-visitors-notification-mobile-bar_' + value.notificationID + '" class="nv-animated ' + value.animation + '" style="z-index: 9999999; position: ' + position + '; background-color: transparent; border: medium none; overflow: hidden; visibility: visible; ' + pos + ' left: auto; height: ' + height + 'px; right: 0px; width:100%; display: block;">'
                    + iframe
                    + closeBtn
                    + '</div>';

                if (value.pos == 0) {
                    div.style.height = height + 'px';
                }

                div.id = 'notify-visitors-mobile-bar-notification_' + value.notificationID;

                if (document.body.firstChild) {
                    document.body.insertBefore(div, document.body.firstChild);
                } else {
                    document.body.appendChild(div);
                }

                if (value.html.iframe_data) {
                    var doc = document.getElementById("notify-visitors-notification-mobile-bar-iframe_" + value.notificationID).contentWindow.document;
                    doc.open();
                    doc.write(value.html.iframe_data);
                    doc.close();
                }

                if (value.hideOnScroll == 1) {
                    notify_visitors.manual.jQuery('#notify-visitors-mobile-bar-notification_' + value.notificationID).addClass("_hideOnScroll");
                    notify_visitors.style.scroll();
                }

                notify_visitors.notifyMobileBar.initialize(value);
            }
        }, delay);
    };

    widget.floatingHtml = function (value) {
        //delay per page
        var delay = value.timeDelayPage * 1000;
        setTimeout(function () {
            var element = document.getElementById('notify-visitors-floating-html-notification_' + value.notificationID);
            if (!element) {
                notify_visitors.style.shw_cookie(value);

                var div = document.createElement('div');
                div.innerHTML = value.html.html;
                div.id = 'notify-visitors-floating-html-notification_' + value.notificationID;

                if (document.body.firstChild) {
                    document.body.insertBefore(div, document.body.firstChild);
                } else {
                    document.body.appendChild(div);
                }
            }
        }, delay);
    };

    return widget;
})(window);


//JS NOTIFICATION
notify_visitors.notifyBar = (function (window, undefined) {
    var document = window.document;
    var notifyBar = {};
    notifyBar = {
        initialize: function (options) {
            if (options.minimise == 1) {
                //minimize by default
                var shw_min = notify_visitors.cookie.get("shw_min_" + options.notificationID);
                if (shw_min && shw_min == 1) {
                    notify_visitors.notifyBar.minimise(options);
                }
            }

            var barCloseLink, barTopMinLink, barTopMaxLink, barBottomMinLink, barBottomMaxLink;
            barCloseLink = document.getElementById("notify-visitors-notification-close-button_" + options.notificationID);
            if (barCloseLink) {
                notify_visitors.cookie.bindEvent(barCloseLink, "click", function () {
                    return notify_visitors.notifyBar.close(options);
                });
            }
            barTopMinLink = document.getElementById("notify-visitors-notification-top-minimise-button_" + options.notificationID);
            if (barTopMinLink) {
                notify_visitors.cookie.bindEvent(barTopMinLink, "click", function () {
                    return notify_visitors.notifyBar.minimise(options, 1);
                });
            }
            barTopMaxLink = document.getElementById("notify-visitors-notification-top-maximise-button_" + options.notificationID);
            if (barTopMaxLink) {
                notify_visitors.cookie.bindEvent(barTopMaxLink, "click", function () {
                    return notify_visitors.notifyBar.minimise(options);
                });
            }
            barBottomMinLink = document.getElementById("notify-visitors-notification-bottom-minimise-button_" + options.notificationID);
            if (barBottomMinLink) {
                notify_visitors.cookie.bindEvent(barBottomMinLink, "click", function () {
                    return notify_visitors.notifyBar.minimise(options, 1);
                });
            }
            barBottomMaxLink = document.getElementById("notify-visitors-notification-bottom-maximise-button_" + options.notificationID);
            if (barBottomMaxLink) {
                notify_visitors.cookie.bindEvent(barBottomMaxLink, "click", function () {
                    return notify_visitors.notifyBar.minimise(options);
                });
            }
            return this;
        },
        minimise: function (options, click) {
            if (click != undefined) {
                notify_visitors.cookie.set('shw_min_' + options.notificationID, 1);
            }
            notify_visitors.cookie.visibility('notify-visitors-notification-bar-iframe_' + options.notificationID);
            notify_visitors.cookie.visibility('notify-visitors-notification-bar_' + options.notificationID, options.template);
            notify_visitors.cookie.visibility('notify-visitors-notification-top-maximise-button_' + options.notificationID);
            notify_visitors.cookie.visibility('notify-visitors-notification-bottom-maximise-button_' + options.notificationID);
            notify_visitors.cookie.visibility('notify-visitors-notification_' + options.notificationID);
        },
        close: function (options) {
            notify_visitors.cookie.set('shw_x_' + options.notificationID, 1);
            var contentIFrame = document.getElementById('notify-visitors-notification_' + options.notificationID);
            contentIFrame.parentNode.removeChild(contentIFrame);
        }
    };
    return notifyBar;
})(window);

//JS NOTIFICATION
notify_visitors.notifyMultiBar = (function (window, undefined) {
    var document = window.document;
    var notifyMultiBar = {};
    notifyMultiBar = {
        initialize: function (options) {
            if (options.minimise == 1) {
                //minimize by default
                var shw_min = notify_visitors.cookie.get("shw_min_" + options.notificationID);
                if (shw_min && shw_min == 1) {
                    notify_visitors.notifyMultiBar.minimise(options);
                }
            }

            var barCloseLink, barTopMinLink, barTopMaxLink, barBottomMinLink, barBottomMaxLink;
            barCloseLink = document.getElementById("notify-visitors-multi-bar-notification-close-button_" + options.notificationID);
            notify_visitors.cookie.bindEvent(barCloseLink, "click", function () {
                return notify_visitors.notifyMultiBar.close(options);
            });
            barTopMinLink = document.getElementById("notify-visitors-multi-bar-top-minimise-button_" + options.notificationID);
            if (barTopMinLink) {
                notify_visitors.cookie.bindEvent(barTopMinLink, "click", function () {
                    return notify_visitors.notifyMultiBar.minimise(options, 1);
                });
            }
            barTopMaxLink = document.getElementById("notify-visitors-multi-bar-top-maximise-button_" + options.notificationID);
            if (barTopMaxLink) {
                notify_visitors.cookie.bindEvent(barTopMaxLink, "click", function () {
                    return notify_visitors.notifyMultiBar.minimise(options);
                });
            }
            barBottomMinLink = document.getElementById("notify-visitors-multi-bar-bottom-minimise-button_" + options.notificationID);
            if (barBottomMinLink) {
                notify_visitors.cookie.bindEvent(barBottomMinLink, "click", function () {
                    return notify_visitors.notifyMultiBar.minimise(options, 1);
                });
            }
            barBottomMaxLink = document.getElementById("notify-visitors-multi-bar-bottom-maximise-button_" + options.notificationID);
            if (barBottomMaxLink) {
                notify_visitors.cookie.bindEvent(barBottomMaxLink, "click", function () {
                    return notify_visitors.notifyMultiBar.minimise(options);
                });
            }
            return this;
        },
        minimise: function (options, click) {
            if (click != undefined) {
                notify_visitors.cookie.set('shw_min_' + options.notificationID, 1);
            }
            notify_visitors.cookie.visibility('notify-visitors-multi-bar-iframe_' + options.notificationID);
            notify_visitors.cookie.visibility('notify-visitors-multi-bar_' + options.notificationID, options.template, options.pos);
            notify_visitors.cookie.visibility('notify-visitors-multi-bar-top-maximise-button_' + options.notificationID);
            notify_visitors.cookie.visibility('notify-visitors-multi-bar-bottom-maximise-button_' + options.notificationID);
            notify_visitors.cookie.visibility('notify-visitors-multi-bar-notification_' + options.notificationID);
        },
        close: function (options) {
            notify_visitors.cookie.set('shw_x_' + options.notificationID, 1);
            var contentIFrame = document.getElementById('notify-visitors-multi-bar-notification_' + options.notificationID);
            contentIFrame.parentNode.removeChild(contentIFrame);
        }
    };
    return notifyMultiBar;
})(window);

notify_visitors.notifyMobileBar = (function (window, undefined) {
    var document = window.document;
    var notifyMobileBar = {};
    notifyMobileBar = {
        initialize: function (options) {
            var barCloseLink;
            barCloseLink = document.getElementById("notify-visitors-notification-mobile-bar-close-button_" + options.notificationID);
            notify_visitors.cookie.bindEvent(barCloseLink, "click", function () {
                return notify_visitors.notifyMobileBar.close(options);
            });
            return this;
        },
        close: function (options) {
            notify_visitors.cookie.set('shw_x_' + options.notificationID, 1);
            var contentIFrame = document.getElementById('notify-visitors-mobile-bar-notification_' + options.notificationID);
            contentIFrame.parentNode.removeChild(contentIFrame);
        }
    };
    return notifyMobileBar;
})(window);

notify_visitors.nvJSBox = (function (window, undefined) {
    var document = window.document;
    var nvJSBox = {};
    nvJSBox = {
        initialize: function (options) {
            if (options.minimise == 1) {
                //minimize by default
                var shw_min = notify_visitors.cookie.get("shw_min_" + options.notificationID);
                if (shw_min && shw_min == 1) {
                    notify_visitors.nvJSBox.minimise(options);
                }
            }

            var boxCloseLink, boxMinLink, boxMaxLink;
            boxCloseLink = document.getElementById("nv_js-box-close-button_" + options.notificationID);
            notify_visitors.cookie.bindEvent(boxCloseLink, "click", function () {
                return notify_visitors.nvJSBox.close(options);
            });
            boxMinLink = document.getElementById("nv_js-box-minimise-button_" + options.notificationID);
            if (boxMinLink) {
                notify_visitors.cookie.bindEvent(boxMinLink, "click", function () {
                    return notify_visitors.nvJSBox.minimise(options);
                });
            }
            boxMaxLink = document.getElementById("nv_js-box-maximise-button_" + options.notificationID);
            if (boxMaxLink) {
                notify_visitors.cookie.bindEvent(boxMaxLink, "click", function () {
                    return notify_visitors.nvJSBox.minimise(options, 1);
                });
            }
            return this;
        },
        minimise: function (options, click) {
            if (click != undefined) {
                notify_visitors.cookie.set('shw_min_' + options.notificationID, 1);
            }
            notify_visitors.cookie.visibility('nv_box_content-iframe_' + options.notificationID);
            notify_visitors.cookie.visibility('nv_js-box_' + options.notificationID);
            notify_visitors.cookie.visibility('nv_js-box-maximise-button_' + options.notificationID);
        },
        close: function (options) {
            notify_visitors.cookie.set('shw_x_' + options.notificationID, 1);
            var contentIFrame = document.getElementById('notify-visitors-box-notification_' + options.notificationID);
            contentIFrame.parentNode.removeChild(contentIFrame);
        }
    };
    return nvJSBox;
})(window);

//JS POPUP
notify_visitors.nvJSModal = (function (window, undefined) {
    var document = window.document;
    var nvJSModal = {};
    nvJSModal = {
        modals: function (options) {
            var modal, _i, _len, _results;
            notify_visitors.nvJSModal.initialize();
            _results = [];
            for (_i = 0, _len = options.length; _i < _len; _i++) {
                modal = options[_i];
                _results.push(this.addModalFor({
                    anchorId: modal.anchorId,
                    width: modal.width,
                    height: modal.height
                }));
            }
            return _results;
        },
        initialize: function (options) {
            var dialog, modalCloseLink, modalContent, modalOverlay;
            modalOverlay = document.createElement("div");
            modalOverlay.setAttribute("id", "nv_js-modal-overlay");
            modalOverlay.style.cssText = ' visibility: hidden;z-index: 10000008;position: fixed;left: 0;top: 0;height: 100%;width: 100%;background: black;opacity: 0.5;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=40)";filter: alpha(opacity=40);';
            dialog = document.createElement("div");
            dialog.setAttribute("id", "nv_js-modal");
            notify_visitors.style.style(options.animation_style);
            dialog.setAttribute("class", "nv-animated " + options.animation);
            modalContent = document.createElement("div");
            modalContent.setAttribute("id", "nv_js-modal-content");
            modalCloseLink = document.createElement("a");
            modalCloseLink.setAttribute("href", "javascript:void(0);");
            modalCloseLink.setAttribute("id", "nv_js-modal-close-button");
            modalCloseLink.setAttribute("onclick", "notify_visitors.cookie.gapush('" + options.notificationID + "','" + options.name + "','Close')");
            if (options.template == '11' || options.template == '38') {
                modalCloseLink.innerHTML = notify_visitors.ui.fullscreen_cross(30, 30, options.ctaBgColor);
                modalCloseLink.style.cssText = 'margin-top:5px;cursor: pointer;position: absolute;top: 10px;right: 55px;display:none;text-align: center;width: 20px;height: 20px; border-radius: 50%;font-family: sans-serif';
            } else {
                modalCloseLink.innerHTML = notify_visitors.ui.closeImg(10, 10, options.bgColor);
                modalCloseLink.style.cssText = 'margin-top:5px;cursor: pointer;position: absolute;top: -14px;right: -10px;display: none;text-align: center;width: 20px;height: 20px; border-radius: 50%;font-family: sans-serif;background: ' + options.ctaBgColor;
            }
            notify_visitors.cookie.bindEvent(modalCloseLink, "click", function () {
                return notify_visitors.nvJSModal.close(options, 1);
            });

            if (options.close_btn != 0) {
                setTimeout(function () {
                    notify_visitors.cookie.bindEvent(document, "keydown", function (e) {
                        if (e.keyCode === 27) {
                            return notify_visitors.nvJSModal.close(options);
                        }
                    });
                    notify_visitors.cookie.bindEvent(modalOverlay, "click", function (e) {
                        return notify_visitors.nvJSModal.close(options);
                    });
                }, options.close_btn * 1000);
            }

            modalContent.appendChild(modalCloseLink);
            dialog.appendChild(modalContent);
            document.body.appendChild(dialog);
            document.body.appendChild(modalOverlay);
            return this;
        },
        openViaLink: function (options) {
            var contentIFrame, modal, modalContent;
            modal = document.getElementById('nv_js-modal');
            modal.style.cssText = ' position: fixed;visibility: hidden;left: 50%;top:50%;z-index: 10000010;border-radius: 5px;-webkit-background-clip: padding-box;-moz-background-clip: padding-box;background-clip: padding-box;font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", "HelveticaNeue", "HelveticaNeueLT", Helvetica, Arial, "Lucida Grande", sans-serif;-webkit-transition: all 0.5s ease;-moz-transition: all 0.5s ease;-o-transition: all 0.5s ease;-ms-transition: all 0.5s ease;transition: all 0.5s ease;margin-top: ' + (-options.height.replace("px", "")) / 2 + 'px;' + 'margin-left:' + (-options.width.replace("px", "")) / 2 + 'px;';
            contentIFrame = document.createElement("iframe");
            contentIFrame.setAttribute('id', 'nv_content-iframe');
            if (options.iframe.href) {
                contentIFrame.setAttribute('src', options.iframe.href);
            }
            contentIFrame.setAttribute('frameBorder', 0);
            contentIFrame.style.cssText = 'border: 0;height: 100%;width: 100%;padding: 0;margin: 0;outline: 0;overflow: auto;border-radius: 5px; border: 1px solid ' + options.ctaBgColor;
            modalContent = document.getElementById('nv_js-modal-content');
            modalContent.style.cssText = "border-radius: 5px;height: " + options.height + "; width: " + options.width + ";";
            modalContent.appendChild(contentIFrame);
            if (options.iframe.iframe_data) {
                var doc = document.getElementById("nv_content-iframe").contentWindow.document;
                doc.open();
                doc.write(options.iframe.iframe_data);
                doc.close();
            }
            this.changeVisibility("nv_js-modal-overlay", "visible");
            return this.changeVisibility("nv_js-modal", "visible");
        },
        close: function (options, cross) {
            if (cross) {
                notify_visitors.cookie.set('shw_x_' + options.notificationID, 1);
            }
            var contentIFrame;
            contentIFrame = document.getElementById('nv_content-iframe');
            contentIFrame.parentNode.removeChild(contentIFrame);
            var contentIFrame;
            contentIFrame = document.getElementById('nv_js-modal-overlay');
            contentIFrame.parentNode.removeChild(contentIFrame);
            var contentIFrame;
            contentIFrame = document.getElementById('nv_js-modal');
            contentIFrame.parentNode.removeChild(contentIFrame);
            //notify_visitors.nvJSModal.initialize(options);
            //this.changeVisibility("nv_js-modal-overlay", "hidden");
            //return this.changeVisibility("nv_js-modal", "hidden");
        },
        changeVisibility: function (elementId, visibility) {
            var element;
            element = document.getElementById(elementId);
            return element.style.visibility = visibility;
        }
    };
    return nvJSModal;
})(window);

//JS LEAVE INTENT POPUP
notify_visitors.nvLeaveIntent = (function (window, undefined) {
    var document = window.document;
    var nvLeaveIntent = {};
    nvLeaveIntent = {
        initialize: function (value) {
            var nv_li = notify_visitors.cookie.get("nv_li_" + value.notificationID);
            nv_li = parseInt(nv_li);
            nv_li = (!nv_li) ? 1 : nv_li + 1;
            var again = 0;
            notify_visitors.cookie.bindEvent(document, "mouseout", function (e) {
                //alert(again);
                e = e ? e : window.event;
                var from = e.relatedTarget || e.toElement;
                if (!from || from.nodeName == "HTML") {

                    if (e.pageY - document.body.scrollTop <= 1) {
                        if (again != 1 && (!nv_li || nv_li <= value.noOfTimesPerUser)) {
                            again = 1;
                            //alert(again);
                            notify_visitors.cookie.set("nv_li_" + value.notificationID, nv_li);
                            if (['1', '5'].indexOf(value.template) >= 0) {
                                notify_visitors.widget.singleLineBar(value, 1);
                            } else if (['2', '52', '32', '33', '10', '11', '36', '38'].indexOf(value.template) >= 0) {
                                notify_visitors.widget.modal(value, 1);
                            } else if (['3', '7', '31'].indexOf(value.template) >= 0) {
                                notify_visitors.widget.box(value, 1);
                            } else if (['4', '6', '35'].indexOf(value.template) >= 0) {
                                notify_visitors.widget.multiLineBar(value, 1);
                            } else if (['51', '53', '37'].indexOf(value.template) >= 0) {
                                notify_visitors.widget.mobileBar(value, 1);
                            } else if (['34', '8'].indexOf(value.template) >= 0) {
                                notify_visitors.widget.classic(value, 1);
                            }
                        }
                    }
                }
            });
            return this;
        }
    };
    return nvLeaveIntent;
})(window);


//JS NOTIFICATION
notify_visitors.ui = (function (window, undefined) {
    var document = window.document;
    var ui = {};
    ui = {
        closeImg: function (width, height, color) {
            return '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + width + 'px" height="' + height + 'px" viewBox="0 0 348.333 348.334" style="enable-background:new 0 0 348.333 348.334;margin-top:5px;margin-bottom:5px;" xml:space="preserve">'
                + '<g><path fill="' + color + '" d="M336.559,68.611L231.016,174.165l105.543,105.549c15.699,15.705,15.699,41.145,0,56.85 c-7.844,7.844-18.128,11.769-28.407,11.769c-10.296,0-20.581-3.919-28.419-11.769L174.167,231.003L68.609,336.563 c-7.843,7.844-18.128,11.769-28.416,11.769c-10.285,0-20.563-3.919-28.413-11.769c-15.699-15.698-15.699-41.139,0-56.85 l105.54-105.549L11.774,68.611c-15.699-15.699-15.699-41.145,0-56.844c15.696-15.687,41.127-15.687,56.829,0l105.563,105.554 L279.721,11.767c15.705-15.687,41.139-15.687,56.832,0C352.258,27.466,352.258,52.912,336.559,68.611z"/>'
                + '</g></svg>';
        },
        arrowUpImg: function (width, height, color) {
            return '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + width + 'px" height="' + height + 'px" viewBox="0 0 466.667 466.667" style="enable-background:new 0 0 466.667 466.667;margin-top:5px;" xml:space="preserve">'
                + '<g><path fill="' + color + '" d="M423.571,176.43L256.904,9.764c-13.017-13.018-34.122-13.018-47.14,0L43.098,176.43c-13.018,13.018-13.018,34.123,0,47.141 c13.018,13.018,34.123,13.018,47.141,0l109.762-109.764v319.527c0,18.408,14.924,33.333,33.333,33.333 c18.409,0,33.333-14.925,33.333-33.333V113.807l109.764,109.764c6.509,6.508,15.039,9.762,23.57,9.762 c8.53,0,17.062-3.254,23.569-9.764C436.588,210.552,436.588,189.448,423.571,176.43z"/>'
                + '</g></svg>';
        },
        arrowUpImg2: function (width, height, color) {
            return '<svg version="1.0" x="0px" y="0px" width="' + width + 'px" height="' + height + 'px" viewBox="0 0 48 48" style="null" class="icon icons8-Collapse-Arrow" style="margin-top:5px;"><polygon fill="' + color + '" points="5,30.9 8.1,34 24,18.1 39.9,34 43,30.9 24,12 "></polygon></svg>';
        },
        arrowDownImg: function (width, height, color) {
            return '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + width + 'px" height="' + height + 'px" viewBox="0 0 448 448" style="enable-background:new 0 0 448 448;margin-top:5px;" xml:space="preserve">'
                + '<g><path fill="' + color + '" d="M41.373,278.627l160,160c12.496,12.497,32.758,12.497,45.255,0l160-160c12.495-12.497,12.495-32.758,0-45.255 c-12.497-12.497-32.759-12.497-45.256,0L256,338.745V32c0-17.673-14.327-32-32-32c-17.673,0-32,14.327-32,32v306.745 L86.627,233.372C80.379,227.124,72.189,224,64,224s-16.379,3.124-22.627,9.372C28.876,245.869,28.876,266.13,41.373,278.627z"/>'
                + '</g></svg>';
        },
        arrowDownImg2: function (width, height, color) {
            return '<svg  version="1.0" x="0px" y="0px" width="' + width + 'px" height="' + height + 'px" viewBox="0 0 48 48" class="icon icons8-Expand-Arrow" style="margin-top:5px;"><polygon fill="' + color + '" points="43,17.1 39.9,14 24,29.9 8.1,14 5,17.1 24,36 "></polygon></svg>';
        },
        fullscreen_cross: function (width, height, color) {
            return '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="' + width + 'pt" height="' + height + 'pt" viewBox="0 0 128.000000 128.000000">'
                + '<g transform="translate(0.000000,128.000000) scale(0.100000,-0.100000)" fill="' + color + '" stroke="none">'
                + '<path d="M262 998 c-9 -11 25 -51 168 -193 l180 -180 -181 -181 c-145 -145 -178 -183 -167 -192 11 -9 51 25 193 168 l180 180 181 -181 c145 -145 183 -178 192 -167 9 11 -25 51 -168 193 l-180 180 181 181 c145 145 178 183 167 192 -11 9 -51 -25 -193 -168 l-180 -180 -181 181 c-145 145 -183 178 -192 167z"/>'
                + '</g>'
                + '</svg>';
        },
        logo: function (color, width) {
            return '<svg width="' + width + 'pt" height="' + width + 'pt" viewBox="0 0 40 40" version="1.1" xmlns="http://www.w3.org/2000/svg">'
                + '<path fill="rgba(255,255,255,0)" d=" M 0.00 0.00 L 32.00 0.00 L 32.00 4.20 C 28.40 4.20 24.80 4.21 21.20 4.20 C 21.21 12.07 21.19 19.93 21.21 27.80 C 23.00 26.21 24.80 24.64 26.59 23.04 C 28.40 24.63 30.25 26.18 32.00 27.85 L 32.00 32.00 L 0.00 32.00 L 0.00 25.84 C 6.04 25.84 12.07 25.84 18.11 25.84 C 18.11 25.07 18.11 23.52 18.10 22.74 C 12.07 22.74 6.03 22.74 0.00 22.74 L 0.00 19.66 C 6.04 19.66 12.07 19.66 18.11 19.66 C 18.11 18.88 18.11 17.33 18.10 16.56 C 12.07 16.55 6.03 16.55 0.00 16.55 L 0.00 13.49 C 6.04 13.49 12.07 13.49 18.11 13.48 C 18.11 12.71 18.11 11.16 18.11 10.38 C 12.07 10.37 6.04 10.38 0.00 10.38 L 0.00 7.31 C 6.03 7.31 12.07 7.31 18.10 7.30 C 18.10 6.53 18.11 4.98 18.11 4.20 C 12.07 4.20 6.04 4.20 0.00 4.20 L 0.00 0.00 Z" />'
                + '<path fill="' + color + '" d=" M 0.00 4.20 C 6.04 4.20 12.07 4.20 18.11 4.20 C 18.11 4.98 18.10 6.53 18.10 7.30 C 12.07 7.31 6.03 7.31 0.00 7.31 L 0.00 4.20 Z" />'
                + '<path fill="' + color + '" d=" M 21.20 4.20 C 24.80 4.21 28.40 4.20 32.00 4.20 L 32.00 27.85 C 30.25 26.18 28.40 24.63 26.59 23.04 C 24.80 24.64 23.00 26.21 21.21 27.80 C 21.19 19.93 21.21 12.07 21.20 4.20 Z" />'
                + '<path fill="' + color + '" d=" M 0.00 10.38 C 6.04 10.38 12.07 10.37 18.11 10.38 C 18.11 11.16 18.11 12.71 18.11 13.48 C 12.07 13.49 6.04 13.49 0.00 13.49 L 0.00 10.38 Z" />'
                + '<path fill="' + color + '" d=" M 0.00 16.55 C 6.03 16.55 12.07 16.55 18.10 16.56 C 18.11 17.33 18.11 18.88 18.11 19.66 C 12.07 19.66 6.04 19.66 0.00 19.66 L 0.00 16.55 Z" />'
                + '<path fill="' + color + '" d=" M 0.00 22.74 C 6.03 22.74 12.07 22.74 18.10 22.74 C 18.11 23.52 18.11 25.07 18.11 25.84 C 12.07 25.84 6.04 25.84 0.00 25.84 L 0.00 22.74 Z" />'
                + '</svg>';
        }
    };
    return ui;
})(window);


//Scroll Rule
notify_visitors.nvScroll = (function (window, undefined) {
    var document = window.document;
    var nvScroll = {};
    nvScroll = {
        initialize: function (value) {
            notify_visitors.manual.jQuery(document).ready(function ($) {

                var scrollFunc = function (e) {
                    var scrollTop = $(window).scrollTop();
                    var docHeight = $(document).height();
                    var winHeight = $(window).height();
                    var scrollPercent = (scrollTop) / (docHeight - winHeight);
                    var scrollPercentRounded = Math.round(scrollPercent * 100);
                    if (scrollPercentRounded == value.scroll) {
                        if (['1', '5'].indexOf(value.template) >= 0) {
                            notify_visitors.widget.singleLineBar(value, 1);
                        } else if (['2', '52', '32', '33', '10', '11', '36', '38'].indexOf(value.template) >= 0) {
                            notify_visitors.widget.modal(value, 1);
                        } else if (['3', '7', '31'].indexOf(value.template) >= 0) {
                            notify_visitors.widget.box(value, 1);
                        } else if (['4', '6', '35'].indexOf(value.template) >= 0) {
                            notify_visitors.widget.multiLineBar(value, 1);
                        } else if (['51', '53', '37'].indexOf(value.template) >= 0) {
                            notify_visitors.widget.mobileBar(value, 1);
                        } else if (['34', '8'].indexOf(value.template) >= 0) {
                            notify_visitors.widget.classic(value, 1);
                        }

                        notify_visitors.cookie.unbindEvent(document, "scroll", scrollFunc);
                    }
                }

                notify_visitors.cookie.bindEvent(document, "scroll", scrollFunc);
            });

            return this;
        }
    };
    return nvScroll;
})(window);

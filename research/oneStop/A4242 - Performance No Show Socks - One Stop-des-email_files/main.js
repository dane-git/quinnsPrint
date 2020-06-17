jQuery.fn.centerFixed = function() {
    this.css("position", "fixed");
    this.css("top", "40%");
    this.css(
        "left",
        Math.max(
            0,
            ($(window).width() - $(this).outerWidth()) / 2 +
                $(window).scrollLeft()
        ) + "px"
    );
    return this;
};

jQuery.fn.center = function() {
    this.css("position", "absolute");
    this.css(
        "top",
        Math.max(
            0,
            ($(window).height() - $(this).outerHeight()) / 2 +
                $(window).scrollTop()
        ) + "px"
    );
    this.css(
        "left",
        Math.max(
            0,
            ($(window).width() - $(this).outerWidth()) / 2 +
                $(window).scrollLeft()
        ) + "px"
    );
    return this;
};

//trim blank spaces from string
function trim(str) {
    return str.replace(/^\s+|\s+$/g, "");
}
//format long numbers by adding commas
function numberWithCommas(x) {
    return x
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

Onestop = {
    init: function() {
        this.registerObjects();
        this.registerEvents();
        this.initTabs();
        this.checkPricing();
        this.sampleCatHackOrder();
        this.sampleCatMobileHackOrder();
    },
    registerObjects: function() {
        this.search = $("#search");
        this.tabs = $(".tabbed");
        this.tablinks = $(".tab_links span");
        this.pop_up_map_links = $("a.pop_up_map");
        this.tab = "features_tab";
        this.header_cart_quantity = $(".header_cart_quantity");
        this.mobile_header_cart_quantity = $(".mobile_header_cart_quantity");
        this.header_cart_total = $(".header_cart_total");
        this.mobile_header_cart_total = $(".mobile_header_cart_total");
        this.nwindow = "";
        this.loader = $("#loader");
        this.links = $('a').not('.ez_link');
        this.account_options = $('#account_options');
        this.hide_pricing = $('.hide_pricing');
        this.hide_notifications = $('.hide_notification_btn');
        this.notification_back = $('.notification_back_button');
        this.notification_bar = $('.notification_bar');
        this.notification_list = Array();
        this.notification_index = 0;
    },
    registerEvents: function() {
        this.search.submit(this.events.search);
        this.links.click(function() {
            Onestop.events.showLoader();
        });
        this.account_options.change(this.events.goToOption);
        this.hide_pricing.click(this.events.checkHidePricing);
    },
    initTabs: function() {
        this.tabs.hide();
        this.tablinks.click(this.events.tabClicked);
        this.pop_up_map_links.click(this.events.popupShippingMap);
        this.events.fetchTab();
    },
    checkLogin: function() {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "/loggedin",
            success: Onestop.callbacks.checkLogin
        });
    },
    checkPricing: function() {
        if (typeof Storage !== "undefined") {
            var hide = sessionStorage.getItem("hide_pricing");
            if (hide == "true") {
                this.events.hidePricing();
            }
        }
    },
    /* following functions are a category order navigation hack*/
    sampleCatHackOrder: function() {
        // grabs all of the sidebar menues
        var lists = $(".menu.catalog_menu>div>div");
        $.map(lists, function(list) {
            // maps over the sidebar menus, grabs Rebates or Samples, and places it at the top of the list
            var gameDay = $(list)
                .find("a:contains('Game Day')")
                .detach();
            gameDay.prependTo(list);
        });
    },
    sampleCatMobileHackOrder: function() {
        // grabs all of the sidebar menues
        var lists = $(".hide-on-large-only>ul>li>div.collection");
        $.map(lists, function(list) {
            // maps over the sidebar menus, grabs Rebates or Samples, and places it at the top of the list
            var gameDay = $(list)
                .find("a:contains('Game Day')")
                .detach();
            gameDay.prependTo(list);
        });
    },
    getNotifications: function() {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "/notifications",
            success: Onestop.callbacks.setNotifications
        });
    },
    showNotification: function() {
        if (Onestop.notification_bar.is(":visible")) {
            Onestop.notification_bar.slideUp(300);
        }

        setTimeout(function() {
            if (Onestop.notification_index < Onestop.notification_list.length) {
                let notif =
                    Onestop.notification_list[Onestop.notification_index];
                let notifClasses = "";
                let notifTextClass = "";
                let notifBtn = "";

                let notifString = "<div>" + notif.notification_message;
                if (
                    notif.notification_url &&
                    notif.notification_url.length > 0
                ) {
                    notifString +=
                        " - <u><a style='color: white' href='" +
                        notif.notification_url +
                        "'>Click here to learn more</a></u>";
                }
                notifString += "</div>";

                if (notif.notification_type === "AL") {
                    notifClasses = "red lighten-1";
                    notifTextClass = "nav_bar_light";
                } else if (notif.notification_type === "WN") {
                    notifClasses = "yellow";
                    notifTextClass = "nav_bar_dark";
                } else if (notif.notification_type === "IN") {
                    notifClasses = "green lighten-1";
                    notifTextClass = "nav_bar_light";
                } else {
                    notifClasses = "blue lighten-1";
                    notifTextClass = "nav_bar_light";
                }

                notifBtn =
                    notif.id !=
                    Onestop.notification_list[
                        Onestop.notification_list.length - 1
                    ].id
                        ? "chevron_right"
                        : "close";
                if (Onestop.notification_index > 0) {
                    $(".notification_back_button").show();
                } else {
                    $(".notification_back_button").hide();
                }

                $(".notification_background").removeClass(
                    "red yellow green blue grey lighten-1 darken-1"
                );
                $(".notification_background").addClass(notifClasses);
                $(".notification_display").removeClass(
                    "nav_bar_light nav_bar_dark"
                );
                $(".notification_display").addClass(notifTextClass);
                $(".notification_button").html(notifBtn);
                $(".notification_display").html(notifString);
                Onestop.notification_bar.slideDown();
            } else {
                // Close notification bar
                Onestop.notification_bar.slideUp();
                localStorage.setItem(
                    "notificationTimestampOnClose",
                    new Date(Date.now())
                );
                localStorage.setItem(
                    "notificationCountOnClose",
                    Onestop.notification_list.length
                );
            }
        }, 300);
    },
    checkNotificationCookies: function(data) {
        let latestUpdate = new Date(
            Math.max.apply(
                null,
                data.map(function(e) {
                    return new Date(e.last_updated_on);
                })
            )
        );
        let oldTimestamp = new Date(
            localStorage.getItem("notificationTimestampOnClose")
        );
        let oldCount = localStorage.getItem("notificationCountOnClose");
        if (data.length != oldCount || oldTimestamp < latestUpdate) {
            return true;
        } else return false;
    }
};

Onestop.callbacks = {
    checkLogin: function(res) {
        if (res) {
            Onestop.events.getCart();
        }
    },
    getCart: function(res) {
        // make sure quantity never drops below 0
        if (0 > res.pieces) {
            Onestop.header_cart_quantity.html(0);
        } else {
            Onestop.header_cart_quantity.html(
                '<a class="header_cart_quantity" href="/cart">(' +
                    res.pieces +
                    ")</a>"
            );
            Onestop.mobile_header_cart_quantity.html(
                '<a class="mobile_header_cart_quantity" href="/cart">(' +
                    res.pieces +
                    ")</a>"
            );
        }

        // make sure total never drops below 0
        if (0 > res.total) {
            Onestop.header_cart_total.html("$0.00");
        } else {
            Onestop.header_cart_total.html(
                '<a class="header_cart_total" href="/cart">$' +
                    res.total +
                    "</a>"
            );
            Onestop.mobile_header_cart_total.html(
                '<a class="mobile_header_cart_total" href="/cart">$' +
                    res.total +
                    "</a>"
            );
        }
    },
    setNotifications: function(result) {
        if (result.success && result.data) {
            if (Onestop.checkNotificationCookies(result.data)) {
                Onestop.notification_list = result.data;
                Onestop.showNotification();
            }
        }
    }
};

Onestop.events = {
    goToOption: function() {
        Onestop.events.showLoader();
        window.location = this.value;
    },
    checkHidePricing: function() {
        Onestop.events.hideLoader();
        if (typeof Storage !== "undefined") {
            var hide = sessionStorage.getItem("hide_pricing");
            if (hide == null || hide == "false") Onestop.events.hidePricing();
            if (hide == "true") Onestop.events.showPricing();
        }
    },
    hidePricing: function() {
        Onestop.hide_pricing.html(
            '<i class="material-icons">attach_money</i>Show Pricing'
        );
        Onestop.hide_pricing.attr("title", "Pricing is currently hidden");
        // customers don't want to see logo when prices are hidden
        $("img.main_logo, img.main_logo_mobile").hide();
        $("tr.pricing_row").hide();
        $("div.bulk-order-btn").hide();
        
        sessionStorage.setItem("hide_pricing", true);
    }, 
    showPricing: function() {
        Onestop.hide_pricing.attr("title", "Pricing is currently visible");
        Onestop.hide_pricing.html(
            '<i class="material-icons">money_off</i>Hide Pricing'
        );
        $("img.main_logo, img.main_logo_mobile").show();
        $("tr.pricing_row").show();
        $("div.bulk-order-btn").show();
        sessionStorage.setItem("hide_pricing", false);
    },
    showLoader: function(msg) {
        if (msg !== undefined) {
            Onestop.loader.html(
                '<div class="progress"><div class="indeterminate"></div></div><br />' +
                    msg
            );
        }
        Onestop.loader
            .show()
            .centerFixed()
            .fadeOut(4000);
    },
    showCheckoutLoader: function(msg) {
        if (msg !== undefined) {
            Onestop.loader.html(
                '<div class="progress"><div class="indeterminate"></div></div><br />' +
                    msg
            );
        }
        Onestop.loader
            .show()
            .centerFixed();
    },
    showOrderHistoryLoader: function(msg) {
        if (msg !== undefined) {
            Onestop.loader.html(
                '<div class="progress"><div class="indeterminate"></div></div><br />' +
                    msg
            );
        }
        Onestop.loader
            .show()
            .centerFixed()
            .fadeOut(30000);
    },
    hideLoader: function() {
        Onestop.loader
            .stop(true, true)
            .hide()
            .html("Loading...");
    },
    getCart: function() {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "/cart/totals",
            success: Onestop.callbacks.getCart
        });
    },
    search: function() {
        if (this.q.value == "") return false;
    },
    tabClicked: function() {
        var id = this.getAttribute("data-tab-id");
        if (id !== "techsheet" && id !== "sds") {
            Onestop.tab = id;
            Onestop.tablinks.addClass("unselected");
            $(this).removeClass("unselected");
            Onestop.tabs.hide();
            $("#" + Onestop.tab).fadeIn();
        } else {
            var url = this.getAttribute("data-url");
            window.open(url);
        }
    },
    fetchTab: function() {
        if (Onestop.tablinks.length > 0) {
            if (Onestop.tab !== "") {
                $("span[data-tab-id='" + Onestop.tab + "']").click();
            } else Onestop.tablinks[0].click();
        }
    },
    popupShippingMap: function() {
        var location = parseInt(this.getAttribute("data-location"), 10);
        var default_map = media_url + "/images/info/mill-direct-maps.jpg";
        if (Onestop.nwindow.location && !Onestop.nwindow.closed) {
            Onestop.nwindow.location.href = default_map;
            Onestop.nwindow.focus();
        } else {
            var img_url = this.getAttribute("href") || default_map;
            var img_dimensions = (isNaN(location) || location < 2 || location > 20) ?
                "width=612, height=576" :
                "width=612, height=753";

            Onestop.nwindow = window.open(img_url, "MillDirectShippingMap", img_dimensions);
        }
        return false;
    },
    nextNotification: function() {
        Onestop.showNotification();
        if (Onestop.notification_index < Onestop.notification_list.length)
            Onestop.notification_index++;
    },
    prevNotification: function() {
        if (Onestop.notification_index > 0) Onestop.notification_index--;
        Onestop.showNotification();
    }
}

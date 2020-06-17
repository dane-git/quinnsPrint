(function(window, $) {
    var renderCounter = 0;

    var KIND_FG_COLOR_MAP = {
        AL: "nav_bar_light",
        WN: "nav_bar_light",
        IN: "nav_bar_light",
        SL: "nav_bar_light"
    };

    var KIND_BG_COLOR_MAP = {
        AL: "red darken-1",
        WN: "yellow darken-4",
        IN: "blue darken-2",
        SA: "green darken-2"
    };

    var KIND_BUTTON_COLOR_MAP = {};

    var CLOSED_ON_KEY = "notification.timestamp.closedOn";
    var CLOSED_ON_COUNT_KEY = "notification.timestamp.count";

    function resetClose() {
        localStorage.removeItem(CLOSED_ON_KEY);
        localStorage.removeItem(CLOSED_ON_COUNT_KEY);
    }

    function getClosedOnCount() {
        return parseInt(localStorage.getItem(CLOSED_ON_COUNT_KEY)) || 0;
    }

    function getClosedOn() {
        return parseInt(localStorage.getItem(CLOSED_ON_KEY)) || -1;
    }

    function setClosedOn() {
        localStorage.setItem(CLOSED_ON_KEY, new Date().getTime());
    }

    function setClosedOnCount(count) {
        localStorage.setItem(CLOSED_ON_COUNT_KEY, count);
    }

    function findNotificationByLastUpdatedOn(nodes) {
        return Math.max.apply(
            null,
            nodes.toArray().map(function(n) {
                return parseInt(n.dataset.lastUpdatedOn);
            })
        );
    }

    function NotificationBar() {
        var $bar = $("#notification_bar");
        var $background = $(".notification_background", $bar);
        var $display = $("#notification_display", $bar);
        var $notifications = $(".notification", $bar);
        var state = {
            notificationIndex: 0,
            closed: true
        };

        var init = function() {
            if ($bar.length === 0) {
                resetClose();
                return;
            }

            if ($notifications.length === 0) {
                resetClose();
                return;
            }

            $notifications.hide();
            var count = getClosedOnCount();
            if (count !== $notifications.length) {
                resetClose();
            }

            count = $notifications.length;
            var mostRecent = findNotificationByLastUpdatedOn($notifications);

            var closedOn = getClosedOn();

            if (mostRecent > closedOn) {
                state.closed = false;
                if (closedOn !== -1) {
                    resetClose();
                }
            }

            if (!state.closed) {
                $bar.find(".notification_btn.prev").on("click", function() {
                    prev();
                });

                $bar.find(".notification_btn.next").on("click", function() {
                    (state.notificationIndex === $notifications.length - 1
                        ? close
                        : next)();
                });
                $bar.find(".notification_btn.close").on("click", function() {
                    close();
                });
                render(true);
            }
        };

        var close = function() {
            state.closed = true;
            render();
            setClosedOn();
            setClosedOnCount($notifications.length);
        };

        var next = function() {
            state.notificationIndex += 1;
            if (state.notificationIndex >= $notifications.length) {
                state.notificationIndex = $notifications.length - 1;
            }
            render();
        };

        var prev = function() {
            state.notificationIndex -= 1;
            if (state.notificationIndex <= 0) {
                state.notificationIndex = 0;
            }
            render();
        };

        var renderBtns = function() {
            if (state.notificationIndex > 0) {
                $bar.find("#prev_text").text("Prev");
                $bar.find(".notification_btn.prev").removeClass("disabled");
            } else {
                $bar.find("#prev_text").text("");
                $bar.find(".notification_btn.prev").addClass("disabled");
            }

            if (state.notificationIndex === $notifications.length - 1) {
                $bar.find(".notification_btn.next .material-icons").text("");
                $bar.find(".notification_btn.next").addClass("disabled");
                $bar.find("#next_text").text("");
            } else {
                $bar.find(".notification_btn.next .material-icons").text(
                    "chevron_right"
                );
                $bar.find(".notification_btn.next").removeClass("disabled");
                $bar.find("#next_text").text("Next");
            }
        };

        var renderColors = function(kind) {
            $display
                .removeClass(Object.values(KIND_FG_COLOR_MAP).join(" "))
                .addClass(
                    KIND_FG_COLOR_MAP[kind]
                        ? KIND_FG_COLOR_MAP[kind]
                        : KIND_FG_COLOR_MAP.AL
                );
            $background
                .removeClass(Object.values(KIND_BG_COLOR_MAP).join(" "))
                .addClass(
                    KIND_BG_COLOR_MAP[kind]
                        ? KIND_BG_COLOR_MAP[kind]
                        : KIND_BG_COLOR_MAP.AL
                );
        };

        var renderURL = function(url) {
            $url = $display.find(".url");

            if (url.length > 0) {
                $url.attr("href", url).show();
            } else {
                $url.attr("href", "").hide();
            }
        };

        var renderMessage = function(msg) {
            $display.find(".message").text(msg);
        };

        var render = function(initial) {
            $n = $notifications.eq(state.notificationIndex);
            var data = $n.data();
            renderColors(data.kind);
            renderURL(data.url);
            renderMessage($n.text());
            renderBtns();
            if (initial && !state.closed) {
                $bar.slideDown(300);
            } else if (state.closed) {
                $bar.slideUp(300);
            }
        };

        init();

        return Object.freeze({
            prev: prev,
            next: next,
            close: close
        });
    }

    $(document).ready(function() {
        window.bar = NotificationBar();
    });
})(window, jQuery);

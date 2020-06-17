Style = {
    init: function (style_code, section, path, holo_image, color_code, more_than_one_color, holo_thumbs, img_base) {
        this.path = path;
        this.style_code = style_code;
        this.color_code = color_code;
        this.section = section;
        this.holo_image = holo_image;
        // checks if /supply/ is in the url bar on load
        this.isSupply = location.href.indexOf('/supplies/') != -1;
        this.more_than_one_color = more_than_one_color;
        this.holo_thumbs = holo_thumbs;
        this.img_base = img_base;

        this.registerObjects();
        this.registerEvents();
        this.main();
    },
    registerObjects: function () {
        this.favorites_link = $('a.favorite');
        this.designer_link = $('#open-designer');
        this.color_selector = $('#color_selector');
        this.style_image = $('#style_image_original');
        this.image_span = $('#show_hide_holo');
        this.original_image = $('#style_thumbnail_original');
        this.color_image = $('#style_thumbnail_color');
        this.back_image = $('#style_thumbnail_back');
        this.form = $('#stock');
        this.quantity_interval_message = $('#quantity_interval_message');
        this.quantity_inputs = $('input.quantity');
        this.style_images = $('.holo_thumbnail .style_image');
        this.img_nolink = $('.easyzoom').not('.is-ready').children('a.ez_link');
        this.bulk_order_btn = $('#bulk-order-btn');
        this.bulk_btn_help_text = $('.bulk-btn-help-text');
        this.bulk_order = $('.bulk-order');
        this.bulk_order_table = $('#bulk-order-table');
        this.bulk_order_locations = $('#bulk-order-locations');
        this.bulk_order_btn_close = $('#bulk-order-btn-close');

        this.current_image = 'style';
    },
    registerEvents: function () {
        this.favorites_link.click(this.events.setFavorite);
        this.color_selector.change(this.events.changeColor);
        this.form.submit(this.events.formSubmit);
        this.quantity_inputs.change(this.events.validateQuantity);
        this.original_image.click(function () {
            Style.events.showClickedThumbnail('original');
        });
        this.style_images.click(function () {
            Style.style_image.attr('src', $(this).attr('src'));
        });
        this.img_nolink.click(function () {
            return false;
        });
        this.bulk_order_btn.click(function () {
            Style.bulk_order_btn.css('visibility', 'hidden');
            Style.bulk_btn_help_text.css('visibility', 'hidden');
            Style.events.openBulkOrder(1);
        });
        this.bulk_order_locations.change(function () {
            let location = Style.bulk_order_locations.find(":selected").val();
            Style.events.openBulkOrder(location);
            document.getElementById('bulk-location').value = location;
        });
        this.bulk_order_btn_close.click(function () {
            Style.bulk_order.css('display', 'none');
            Style.bulk_order_btn.css('visibility', 'visible');
            Style.bulk_btn_help_text.css('visibility', 'visible');
            document.getElementById('bulk-order-locations').innerHTML = '';
        });
    },
    main: function () {
        // catches if a colored holo image doesn't exist, a user has selected a color,
        // they are not looking at a supply item, and there is more than one color
        if (
            !this.holo_image &&
            this.color_code != '' &&
            !this.isSupply &&
            this.more_than_one_color &&
            !this.holo_thumbs
        ) {
            this.events.showMissingImage();
            this.image_span
                .hover(
                    function () {
                        $(this).css('cursor', 'pointer');
                    },
                    function () {
                        $(this).css('cursor', 'auto');
                    }
                )
                .show()
                .click(this.events.showHideHolo);
        }
        this.quantity_inputs.trigger('change');
        /*
        if (this.color_code) {
            this.events.trim_color_selection_value();
        }
        */
    }
};

Style.events = {
    setFavorite: function () {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: this.href,
            success: Style.callbacks.setFavorite
        });
        return false;
    },
    openBulkOrder: function (location) {
        Style.bulk_order.css('display', 'block');
        document.getElementById('bulk-order').scrollIntoView();
        document.getElementById('bulk-order-table').innerHTML = "<h4>Loading...</h4>";

        $.ajax({
            type: "POST",
            data: {
                style: Style.style_code,
                location: location,
                csrfmiddlewaretoken: $('[name="csrfmiddlewaretoken"]').val(),
            },
            url: "/catalog/bulk/fetch/",
            success: function (data) {
                if (jQuery.isEmptyObject(data)) {
                    // No stock available in any color at any location.
                    document.getElementById('bulk-order-submit').innerHTML = '';
                    document.getElementById('bulk-order-table').innerHTML = '';
                    Style.bulk_order_table.append('<h4 style="text-align:center;">There is no stock available in any color.</h4>');
                } else {
                    table = '<table style="border: 1px solid #CCC;">';
                    i = 0;
                    for (var d in data) {
                        if (d == 'locations') {
                            if (Object.entries(data[d]).length == 1) {
                                for (const [key, value] of Object.entries(data[d])) {
                                    select = '<span class="bulk-location-single">Location: ' + value['name'] + ' - ' + value['city'] + ', ' + value['state'] + '</span>';
                                }
                            } else {
                                select = '<label for="bulk-location-select" class="bulk-location-label">Location:</label><select class="browser-default" id="bulk-location-select">';
                                for (const [key, value] of Object.entries(data[d])) {
                                    if (key == location) {
                                        select += '<option value="' + key + '" selected="selected">' + value['name'] + ' - ' + value['city'] + ', ' + value['state'] + '</option>';
                                    } else {
                                        select += '<option value="' + key + '">' + value['name'] + ' - ' + value['city'] + ', ' + value['state'] + '</option>';
                                    }
                                }
                                select += '</select>';
                            }
                        } else {
                            if (d == 'location') {
                                document.getElementById('bulk-location').value = data[d];
                            }

                            if (d != 'location') {
                                table += data[d]['row'];
                                i++;
                            }
                        }
                    }

                    table += '</table>';

                    document.getElementById('bulk-order-locations').innerHTML = '';
                    document.getElementById('bulk-order-table').innerHTML = '';

                    if (i == 0) {
                        document.getElementById('bulk-order-submit').innerHTML = '';
                        Style.bulk_order_locations.append(select);
                        Style.bulk_order_table.append('<h4 style="text-align:center;">There is no stock available at this location.</h4>');
                    } else {
                        document.getElementById('bulk-help-text').innerHTML = "Click 'Add Location Quantities To Cart' to save your entered quantities for each location.";
                        Style.bulk_order_locations.append(select);
                        Style.bulk_order_table.append(table);
                    }
                }
            },
            dataType: 'json'
        });
    },
    changeColor: function () {
        var send =
            '/catalog/' +
            Style.section +
            '/' +
            Style.style_code +
            '/' +
            this.value +
            (Style.path ? '?path=' + Style.path : '');
        window.location = send;
    },
    trim_color_selection_value: function () {
        var check_for_color_selection = setInterval(function () {
            dropdown = '#color_selection_div .select-wrapper input.select-dropdown';
            if ($(dropdown) !== undefined) {
                $('li.disabled > span')[0].innerText = $('li.disabled > span')[0].innerText.trim();
                $('option[disabled]')[0].innerText = $('option[disabled]')[0].innerText.trim();
                $(dropdown)[0].value = $(dropdown)[0].value.trim();
                clearInterval(check_for_color_selection);
            }
        }, 100);
    },
    showClickedThumbnail: function (thumbnail) {
        img_prefix = Style.img_base + Style.style_code;
        img_patterns = {
            original: '',
            color: '-' + Style.color_code,
            back: '-' + Style.color_code + '-B'
        };
        img = img_prefix + img_patterns[thumbnail] + '.jpg';
        Style.style_image.attr('src', img);
        Style.current_image = 'thumbnail';
    },
    showHoloImage: function () {
        var img = Style.img_base + Style.style_code + '-' + Style.color_code + '.jpg';
        Style.style_image.attr('src', img);
        Style.current_image = 'holo';
        Style.image_span.html('Show Catalog Image');
    },
    //  alternates showing the default 'image coming soon' and catalog image
    showMissingImage: function (show_catalog_image = false) {
        var img = Style.img_base + Style.style_code + '.jpg';
        if (show_catalog_image === true) {
            Style.style_image.attr('src', img);
            Style.current_image = 'catalog_missing';
            Style.image_span.html('Show Color Image');
            Style.style_image.removeClass('missing_img');

            // also toggle the style designer depending on whether image exists
            Style.designer_link.show();
        } else {
            var src = Style.img_base + 'IMAGECOMINGSOON.jpg';
            Style.style_image.attr('src', src);
            Style.current_image = 'missing';
            Style.image_span.html('Show Catalog Image');
            Style.style_image.addClass('missing_img');

            // also toggle the style designer depending on whether image exists
            Style.designer_link.hide();
        }
    },
    showCatalogImage: function () {
        var img = Style.img_base + Style.style_code + '.jpg';
        Style.style_image.attr('src', img);
        Style.current_image = 'style';
        Style.image_span.html('Show Color Image');
    },
    showHideHolo: function () {
        if (Style.current_image == 'style') Style.events.showHoloImage();
        else if (Style.current_image == 'missing') Style.events.showMissingImage(true);
        else if (Style.current_image == 'catalog_missing') Style.events.showMissingImage();
        else Style.events.showCatalogImage();
    },
    formSubmit: function () {
        Onestop.events.showLoader('Adding Items to Cart..');
        $('input.quantity').each(function () {
            this.readonly = true;
            $(this).css('background-color', '#dadada');
        });
    },
    validateQuantity: function (e) {
        var input = e.target;
        var quantity = $(input).val();
        var quantityInterval = $(input).attr('data-quantity-interval');

        if (quantity % quantityInterval === 0) {
            $(input).removeClass('error');
        } else {
            $(input).addClass('error');
        }

        Style.events.toggleQuantityErrorMessage();
    },
    toggleQuantityErrorMessage: function () {
        var inputsWithErrors = $('input.quantity.error');

        // display error message if there is a least one problematic input
        if (inputsWithErrors.length > 0) {
            Style.quantity_interval_message.addClass('error');
        } else {
            Style.quantity_interval_message.removeClass('error');
        }
    }
};

Style.callbacks = {
    setFavorite: function (res) {
        if (res.success) location.reload();
    },
    submitForm: function (res) {
        $('input.quantity').each(function () {
            this.disabled = false;
        });
    }
};

$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has('bulk')) {
        Style.bulk_order_btn.css('visibility', 'hidden');
        Style.bulk_btn_help_text.css('visibility', 'hidden');

        let location = searchParams.get('bulk');
        if (location == 'true') {
            location = 1;
        }
        Style.events.openBulkOrder(location);
    }
});
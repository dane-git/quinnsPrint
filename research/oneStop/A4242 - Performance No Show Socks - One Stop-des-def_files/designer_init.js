$(document).ready(function StyleDesignerDocReady() {
    if (window.Designer == null) {
        return;
    }

    var styleData = document.getElementById('style-data');
    var colorsData = document.getElementById('colors-data');
    var colorData = document.getElementById('color-data');
    if (!styleData || !colorsData) {
        return;
    }

    var parsedStyle = JSON.parse(styleData.textContent);
    var parsedColors = JSON.parse(colorsData.textContent);
    var color = JSON.parse((colorData || { textContent: 'null' }).textContent);

    var style = Object.assign({ id: parsedStyle[0].pk }, parsedStyle[0].fields);
    var colors = parsedColors.map(function(parsedColor) {
        return Object.assign({ id: parsedColor.pk }, parsedColor.fields);
    });

    var csrfToken = $('[name=csrfmiddlewaretoken]').val();
    var baseImageAddress = window.media_url;

    grecaptcha.ready(function() {
        var designer = new Designer({
            baseImageAddress: baseImageAddress,
            style: style,
            colors: colors,
            csrfToken: csrfToken,
            grecaptcha: window.grecaptcha,
            getFileName: function(style) {
                if (color && color.name) {
                    return style.code + '_' + color.name.toLowerCase().replace(/\s/g, '') + '.png';
                }
                return style.code + '.png';
            },
            email: {
                url: '/catalog/designer/email/',
                onProcess: function() {
                    var send = designer.emailEditor.$el.find('.send');
                    send.hide();
                    send.after("<div class='loading-message'>Sending...</div>");
                },
                onProcessFinished: function() {
                    var send = designer.emailEditor.$el.find('.send');
                    send.show();
                    designer.emailEditor.$el.find('.loading-message').remove();
                }
            }
        });

        $('#open-designer').on('click', function(event) {
            event.preventDefault();
            designer.open($('#style_image_original').attr('src'));
        });
        src = $('#style_image_original').attr('src');
        if (src.indexOf('IMAGECOMINGSOON') === -1) {
            $('#open-designer').show();
        }
    });
});

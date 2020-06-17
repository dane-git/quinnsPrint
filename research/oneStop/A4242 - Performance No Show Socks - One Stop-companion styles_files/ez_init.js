$(document).ready(function(){
    var $easyzoom = $('.easyzoom').easyZoom();
    // Setup sku hollo images
    var ez = $easyzoom.filter('.easyzoom--style-detail').data('easyZoom');

    $('div.holo_thumbnail').on('click', 'a', function(e) {
        var $this = $(this);

        e.preventDefault();

        // Use EasyZoom's `swap` method
        ez.swap($this.data('standard'), $this.attr('href'));
    });

    // Disable for Image Coming Soon
    var img_src = $("#style_image_original").attr("src");
    if(img_src && img_src.indexOf('IMAGECOMINGSOON') > -1){
        $('#show_hide_holo').data('active', false);
        ez.teardown();
    }

    $('#show_hide_hollo').on('click', function() {
        var $this = $(this);

        var current_img = $("#style_image_original").attr("src");
        if(current_img && current_img.indexOf('IMAGECOMINGSOON') > -1){
            $this.data('active', false);
            ez.teardown();
        } else {
            $this.data("active", true);
            ez._init();
        }
    });
});

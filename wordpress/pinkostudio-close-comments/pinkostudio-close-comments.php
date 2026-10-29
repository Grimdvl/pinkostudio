<?php
/**
 * Plugin Name: Pinko Studio — Close Comments
 * Description: Closes native WordPress comments and pings without deleting existing data.
 * Version: 1.0.0
 */

defined('ABSPATH') || exit;

add_filter('comments_open', '__return_false', PHP_INT_MAX);
add_filter('pings_open', '__return_false', PHP_INT_MAX);

add_filter('get_default_comment_status', function () {
    return 'closed';
}, PHP_INT_MAX);

<?php

namespace de\orcas\wordpress;

defined('ABSPATH') or die('No script kiddies please!');

require_once("metatrait.php");

foreach(array("class-wp-widget", "widgets") as $module) {
    require_once ABSPATH . "/wp-includes/$module.php";
}

class Widget extends \WP_Widget {

    use MetaTrait;

    protected $properties = [];
    protected $widget_id = [];

    public function widgetContent(/** @noinspection PhpUnusedParameterInspection */ $args, $instance) {
        sprintf(__('The %s has no own widgetContent-function yet.', 'de.orcas'), $this->get_title($instance));
    }

    public function __construct($id_base, $name, $widget_options = array(), $control_options = array()) {
        $id_base=$id_base?:self::$id_base_s;
        parent::__construct($id_base, $name, $widget_options, $control_options);
        $this->addProperty("title", "", "text", __("Title", "de.orcas"));
    }

    public function addProperty($name, $default, $type, $title) {
        $this->properties[$name] = ["type" => $type, "title" => $title];
        $this->addMethod('get_' . $name, function($instance) use ($default, $name) {
            if ($this->atts!=null && array_key_exists ($name, $this->atts)) {
                return $this->atts[$name];
            }
            $ret = $default;
            if( ! $instance) {
                return $ret;
            }
            if( ! empty($instance["$name"])) {
                $ret = $instance[$name];
            }

            return $ret;
        });
    }


    public $atts = null;

    public static function short_code($atts) {
        $w = new static();
        $w->atts = $atts;
        return $w->widgetContent(null, null);
    }

    public function widget($args, $instance) {
        echo $args["before_widget"] . $args['before_title'] . apply_filters('widget_title', $this->get_title($instance), $instance, $this->id_base) . $args['after_title'];
        echo '<div>';
        $this->widgetContent($args, $instance);
        echo '</div>';
        echo $args["after_widget"];
    }

    static $id_base_s;

    static function register($shortcode_name) {
        self::$id_base_s = $shortcode_name;
        add_action('widgets_init', static::class . '::registerWidget');
        if ($shortcode_name!=null) add_shortcode($shortcode_name, static::class.'::short_code');
    }

    static function registerWidget() {
        register_widget(static::class);
    }

    public function form($instance) {
        $this->widget_id = explode('-', $this->get_field_id('widget_id'));

        foreach($this->properties as $name => $val) {
            $id       = esc_attr($this->get_field_id($name));
            $web_name = esc_attr($this->get_field_name($name));
            $value    = $this->{"get_$name"}($instance);
            $title    = $val["title"];
            echo "<p><label for=\"$id\">$title: </label>";
            switch($val["type"]) {
                case "text" :
                    echo "<br/><input type=\"text\" name=\"$web_name\" id=\"$id\" value=\"$value\"/>";
                    break;
                case "textarea9" :
                    echo "<br/><textarea rows=\"9\" name=\"$web_name\" id=\"$id\">$value</textarea>";
                    break;
                case "color" :
                    echo "<input type=\"color\" name=\"$web_name\" id=\"$id\" value=\"$value\"/>";
                    break;
                case "bool" :
                    $value=json_decode($value);
                    echo "<input type=\"checkbox\" name=\"$web_name\" id=\"$id\" " . ($value ? "checked" : "") . "></input>";
                    break;
            }
            echo "</p>";
        }
    }

    public function update($new_instance, $old_instance) {
        $ret = [];
        if (!is_array($new_instance) || count($new_instance) == 0) {
            return $ret;
        }
        foreach($this->properties as $name => $val) {
            if($val["type"] == "bool") {
                $ret[$name] = json_encode(array_key_exists($name, $new_instance));
            } else {
                $ret[$name] = strip_tags($new_instance[$name]);
            }
        }

        return $ret;
    }
}

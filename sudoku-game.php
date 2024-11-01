<?php
/*
Plugin Name: Sudoku Game
Plugin URI: https://wordpress.org/plugins/sudoku-game/
Version: 1.0.9
Description: Let visitors play the famous Sudoku-Game on your website
Author: orcas2016
Author URI: http://orcas.de
License: GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/
namespace de\orcas\wordpress;

  if (!class_exists(__NAMESPACE__."\\Widget")) {require_once(__DIR__ . "/widget.php");}

  class S extends \de\orcas\wordpress\Widget {
    static $widgetTitle = "Sudoku-Game";

    public function __construct() {
      parent::__construct(null, "Sudoku-Game");
      $this->addProperty("game", "2_3_876_5\n___2_____\n__4___2__\n_4752_39_\n6__7_4__8\n____19___\n__9___8__\n_____5___\n3_546_1_9", "textarea9", "Game");
      $this->addProperty("color", "black", "color", "Border-Color");
      $this->addProperty("font_color", "black", "color", "Font-Color");
      $this->addProperty("wandering_control", "true", "bool", "Wandering control");
    }

    public function sudoku_id()
    {
      return "sudoku_".$this->get_field_id('widget_id');
    }

    public function controller_id()
    {
      return "sudoku_controller".$this->get_field_id('widget_id');
    }

    public function widgetContent($args, $instance)
    {
      $game = preg_replace("/[^0-9_]/", "", $this->get_game($instance));
      $wc = $this->get_wandering_control($instance);
      $c = $this->get_color($instance);
      ?>


<div id="<?php echo $this->sudoku_id(); ?>"></div>
<div id="<?php echo $this->controller_id(); ?>"></div>

<script>
    $ = jQuery;
    $(document).ready(function () {
      var config =  {"wandering_control":<?php echo $wc;?>};
      var cont=$("#<?php echo $this->sudoku_id(); ?>");
      var widget = sudoku_widget(cont, config).initString('<?php echo $game;?>');
      var control_container = $("#<?php echo $this->controller_id(); ?>");
      var control = sudoku_control(control_container, widget, config);

      $("#<?php echo $this->sudoku_id(); ?> .field, #<?php echo $this->controller_id(); ?> .field").css("color", "<?php echo $this->get_font_color($instance);?>").css("box-shadow", "2px 0 0 0 <?php echo $c;?>,\n 0 2px 0 0 <?php echo $c;?>,\n 2px 2px 0 0 <?php echo $c;?>,\n 2px 0 0 0 <?php echo $c;?> inset\n, 0 2px 0 0 <?php echo $c;?> inset");
      $("#<?php echo $this->controller_id(); ?> .field").css("background-color", "lightgrey");
    });
</script>

      <?php
    }

    static function registerScripts() {
      wp_enqueue_script( 'resize_sensor', plugin_dir_url( __FILE__ ) . '/ResizeSensor.js', array( 'jquery' ), '1.0.0', true);
      wp_enqueue_script( 'element_queries', plugin_dir_url( __FILE__ ) . '/ElementQueries.js', array( 'jquery' ), '1.0.0', true);
      wp_enqueue_script( 'sudoku', plugin_dir_url( __FILE__ ) . '/sudoku.js', array( 'jquery' ), '1.0.0', true);
      wp_enqueue_script( 'sudoku_widget', plugin_dir_url( __FILE__ ) . '/sudoku_widget.js', array( 'jquery' ), '1.0.0', true);
      wp_enqueue_style( 'sudoku_css', plugin_dir_url( __FILE__ ) . '/sudoku.css' );
    }

    static function register($shortcode_name = null) {
      parent::register($shortcode_name);
      add_action('widgets_init', static::class.'::registerScripts');
    }
  }

  S::register("sudoku_game");



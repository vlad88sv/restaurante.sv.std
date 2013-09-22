<?php
require_once('configuracion.php');

$_html['titulo'] = '';
if (empty($_GET['TPL'])) $_GET['TPL'] = 'admin';

ob_start();
require_once('TPL/'.$_GET['TPL'].'.php');
$_html['contenido'] = ob_get_clean();
?>
<!DOCTYPE html> 
<html> 
<head> 
    <title><?php echo NOMBRE_RESTAURANTE . ' - ' . $_html['titulo']; ?></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="Content-Style-type" content="text/css" />
    <meta http-equiv="Content-Script-type" content="text/javascript" />
    <meta http-equiv="Content-Language" content="es" />
    <link rel="stylesheet" href="CSS/estilo.css" />
    <script type="text/javascript" src="JS/jquery.js"></script>
    <script type="text/javascript" src="JS/jquery.simplemodal.js"></script>
    <script type="text/javascript" src="JS/jquery-jqprint.js"></script>
    <script type="text/javascript" src="JS/date.js"></script>
    <script type="text/javascript">
        $(function(){
            $.extend($.modal.defaults, {
                minHeight: '95%',
        	minWidth: '95%'
            });
            
            $.ajax({
                cache: false,
                beforeSend: function(){
                    $("#ajax_cargando").show();
                },
                complete: function(){
                    $("#ajax_cargando").hide();
                },
		error: function(jqXHR, textStatus, errorThrown) {
		    alert('La comunicación ha fallado, posiblemente sus datos no se enviaron');
		}
            });
        });
    </script>
    <script type="text/javascript" src="JS/comun.js"></script>
</head> 
<body> 
<div id="page" >
    <div id="content">
        <?php echo $_html['contenido']; ?>
    </div>
</div>

<img id="ajax_cargando" src="IMG/cargando.gif" style="position:fixed;top:50%;left:50%;z-index:20;display: none;" />
</body>
</html>

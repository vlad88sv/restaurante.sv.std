<?php
require_once('configuracion.php');
$_html['titulo'] = '';
?>
<!DOCTYPE html> 
<html> 
<head> 
    <title>IMPRESIONES</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="Content-Style-type" content="text/css" />
    <meta http-equiv="Content-Script-type" content="text/javascript" />
    <meta http-equiv="Content-Language" content="es" />
    <meta http-equiv="refresh" content="3600">

    <link rel="stylesheet" media="screen" href="CSS/estilo.css" />
    <link rel="stylesheet" media="print" href="CSS/estilo.impresion.css" />
    
    <script type="text/javascript" src="JS/jquery.js"></script>
    <script type="text/javascript" src="JS/jquery-jqprint.js"></script>
    <script type="text/javascript" src="JS/date.js"></script>
    <script type="text/javascript" src="JS/comun.js"></script>
    <script type="text/javascript" src="JS/impresion.js"></script>
</head> 
<body>
<h1>Impresiones</h1>
<div style="position: fixed; top:0; right:0; left:0; bottom:0; overflow-y: auto; margin:5px;padding:5px;border:1px solid black;" id="ajaxi" >
</div>
</body>
</html>

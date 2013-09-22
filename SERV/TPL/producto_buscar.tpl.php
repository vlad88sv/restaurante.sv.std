<?php
$c = "SELECT `ID_producto`, `ID_grupo`, `nombre`, `orden`, `descripcion`, `precio`, `disponible`, `descontinuado`, `creacion` FROM `productos` WHERE `ID_menu` = '".db_codex($_POST['grupo'])."' ORDER BY `precio`, `nombre` ASC";
$r = db_consultar($c);

while ($r && $f = db_fetch($r))
{
    $json['aux'][] = $f;
}
?>

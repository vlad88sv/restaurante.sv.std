<?php    

if (empty($_POST['fecha']))
{
    $fecha = mysql_date();
} else {
    $fecha = db_codex($_POST['fecha']);
}

$c = 'SELECT t5.nota AS "historia", t0.ID_mesero, t4.usuario AS "nombre_mesero", t0.cuenta, t0.`fechahora_pedido` , unix_timestamp(t0.`fechahora_pedido`) AS "fechahora_pedido_uts" , t0.`fechahora_entregado` , t0.`fechahora_pagado` , t0.`flag_nopropina` , t0.`flag_pagado` , t0.`flag_elaborado` , t0.`flag_anulado` , t0.`metodo_pago` , t0.`ID_orden` , t0.`ID_mesa` , t0.`ID_usuario` , `ID_pedido` , `ID_producto` , `precio_grabado` , t2.`nombre` AS "nombre_producto", `tmpID`, `flag_cancelado`, t2.ID_grupo, t3.descripcion AS "grupo_desc"
FROM `ordenes` AS t0
LEFT JOIN `pedidos` AS t1
USING ( ID_orden )
LEFT JOIN `productos` AS t2
USING ( ID_producto )
LEFT JOIN productos_grupos AS t3
USING ( ID_grupo )
LEFT JOIN usuarios AS t4
ON t0.ID_mesero = t4.ID_usuarios
LEFT JOIN historial AS t5
USING (ID_pedido)
WHERE DATE(fechahora_pedido) = "'.$fecha.'" AND t0.`flag_pagado` = 1
ORDER BY ID_mesa ASC, fechahora_pedido ASC
';
$r = db_consultar($c);

while ($r && $f = db_fetch($r))
{    
    $c = 'SELECT t2.nombre, t1.precio_grabado FROM `pedidos_adicionales` AS t1 LEFT JOIN `adicionables` AS t2 USING(ID_adicional) WHERE ID_pedido='.$f['ID_pedido'];
    $rAdicionales = db_consultar($c);

    while ($rAdicionales && $fAdicionales = db_fetch($rAdicionales))
    {
        $f['adicionales'][] = $fAdicionales;
    }
    
    $grupo = $f['cuenta'];
    
    $json['aux']['pendientes'][$grupo][] = $f;
}
?>
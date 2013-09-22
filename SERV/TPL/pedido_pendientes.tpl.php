<?php
$c = 'SELECT t2.`nombre` AS "nombre_producto", t2.`ID_grupo`, `ID_pedido` , `ID_mesa` , `ID_usario` , `ID_producto` , `precio_grabado` , `grupo` , `fechahora_pedido` , unix_timestamp(`fechahora_pedido`) AS "fechahora_pedido_uts" , `fechahora_entregado` , `fechahora_pagado` , `flag_pagado` , `flag_elaborado` , `flag_cancelado` , `metodo_pago` , `flag_entregado` , `tmpID`
FROM `pedidos` AS t1
LEFT JOIN `productos` AS t2
USING ( ID_producto )
LEFT JOIN productos_grupos AS t3
USING ( ID_grupo )
WHERE flag_elaborado = 0 AND flag_cancelado = 0 AND flag_anulado = 0
ORDER BY grupo ASC, tmpID ASC';

$r = db_consultar($c);

while ($r && $f = db_fetch($r))
{
    /*
    $c = 'SELECT t3.nombre FROM `pedidos_adicionales` AS t1 LEFT JOIN `ingredientes_adicionables` AS t2 USING(ID_ingrediente_adicional) LEFT JOIN `ingredientes` AS t3 USING(ID_ingrediente) WHERE ID_pedido='.$f['ID_pedido'];
    $rAdicionales = db_consultar($c);

    while ($rAdicionales && $fAdicionales = db_fetch($rAdicionales))
    {
        $f['adicionales'][] = $fAdicionales;
    }
    */
    
    $json['aux']['pendientes'][$f['grupo']][] = $f;
}
?>
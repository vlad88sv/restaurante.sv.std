<?php
$c = 'SELECT t5.nombre AS ingrediente, (SELECT SUM(cantidad) FROM inventario AS tt0 WHERE tt0.ID_ingrediente = t4.ID_ingrediente) AS existencia, @consumo := SUM(t4.cantidad) AS consumo FROM `pedidos` AS t0 LEFT JOIN productos AS t1 USING (ID_producto) LEFT JOIN ordenes AS t2 USING (ID_orden) LEFT JOIN productos_ingredientes AS t4 USING(ID_producto) LEFT JOIN ingredientes AS t5 USING (ID_ingrediente) WHERE t2.flag_anulado=0 AND t0.flag_cancelado=0 AND ID_ingrediente IS NOT NULL AND DATE(`fechahora_pedido`) >= "2013-03-11" GROUP BY t4.ID_ingrediente';
$r = db_consultar($c);

while ($r && $f = db_fetch($r))
{
    $json['aux'][] = $f;
}
?>
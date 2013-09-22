<?php
function numero($numero)
{
    if (!is_numeric($numero))
        return 0.00;
    
    return number_format($numero,2,'.','');
}

function ingresar_orden($PEDIDOS, $MESA, $MESERO, $MODO = 0, $FORZAR_CUENTA_NUEVA = false, $ORDEN_OVERRIDES = array()){
    
    /* $MODO:
     * 0 = agregar pedidos
     * 1 = actualizar pedidos con nueva orden
     */
    
    if ($MODO == 1)
    {
        $ORDEN = $ORDEN_OVERRIDES;
        unset($ORDEN['ID_orden']);
    } else {
        $ORDEN['fechahora_pedido'] = mysql_datetime();
    }
        
    if ( $FORZAR_CUENTA_NUEVA ) {
        $cuenta = false;
    } else {
        $cuenta = db_obtener('ordenes', 'cuenta', 'flag_pagado=0 AND flag_anulado=0 AND ID_mesa="'.db_codex($MESA).'"');
    }
    
    if ($cuenta) {
        $ORDEN['cuenta'] = $cuenta;
    } else {
        $ORDEN['cuenta'] = mysql_uuid();
    }
    
    $ORDEN['ID_mesa'] = $MESA;
    $ORDEN['ID_mesero'] = (empty($MESERO) ? 0 : $MESERO);
    
    $ID_orden = 0;
    $ID_orden_bebidas = 0;
    $ID_orden_ensaladas = 0;
    $ID_orden_entradas = 0;
    $ID_orden_entradas_horno = 0;
    $ID_esta_orden = 0;
    
    foreach($PEDIDOS as $tmpID => $pedido)
    {
        // Reseteamos el registro para que pueda volver a escoger el selector
        $ID_esta_orden = 0;
        
        // Reseteamos la prioridad para que pueda volver a escoger el selector
        $ORDEN['prioridad'] = 'baja';
        
        // busquemos el ID de grupo de este pedido.
        $ID_grupo = db_obtener('productos', 'ID_grupo', 'ID_producto = '. db_codex($pedido['ID']));
        
        // Este es un error grave, nunca deberia de no encontrar grupo.
        if ($ID_grupo == 0)
        {
            error_log('GRUPO ZERO: '.db_codex($pedido['ID']));
        }
        
        // Si el grupo es de bebidas preparadas en cocina creemos una nueva orden
        if ($ID_grupo == 5)
        {
            if ($ID_orden_bebidas == 0)
                $ID_orden_bebidas = db_agregar_datos('ordenes', $ORDEN);
            
            $ID_esta_orden = $ID_orden_bebidas;
        }
        
        // Si el grupo es de ensaladas creemos una nueva orden
        if ($ID_grupo == 8)
        {
            if ($ID_orden_ensaladas == 0)
                $ID_orden_ensaladas = db_agregar_datos('ordenes', $ORDEN);
            
            $ID_esta_orden = $ID_orden_ensaladas;
        }
        
        // Si el grupo es de entradas creemos una nueva orden
        if ($ID_grupo == 2)
        {
            if ($ID_orden_entradas == 0)
                $ID_orden_entradas = db_agregar_datos('ordenes', $ORDEN);
            
            $ID_esta_orden = $ID_orden_entradas;
        }
      
        // Si el grupo es de entradas horneadas creemos una nueva orden
        if ($ID_grupo == 13)
        {
            if ($ID_orden_entradas_horno == 0)
            {
                $ORDEN['prioridad'] = 'alta';
                $ID_orden_entradas_horno = db_agregar_datos('ordenes', $ORDEN);
            }
            
            $ID_esta_orden = $ID_orden_entradas_horno;
        }
        
        if ($ID_esta_orden == 0)
        {
            if ($ID_orden == 0)
            {
                $ID_orden = db_agregar_datos('ordenes', $ORDEN);
            }
            
            $ID_esta_orden = $ID_orden;
        }
        
        if ($MODO == 0) {
    
            $BUFFER_DB_DATOS['tmpID'] = $tmpID;
            $BUFFER_DB_DATOS['ID_producto'] = $pedido['ID'];
            $BUFFER_DB_DATOS['precio_grabado'] = $pedido['precio'];
            $BUFFER_DB_DATOS['ID_orden'] = $ID_esta_orden;
            
            $ID_pedido = db_agregar_datos('pedidos', $BUFFER_DB_DATOS);
            
            // Obtengamos los ingredientes de este producto y grabremolos en cuenta stock
            $cDescontarIngredientes = 'INSERT INTO stock (ID_pedido, ID_ingrediente, existencia, cambio, fechahora,  operacion) SELECT "'.$ID_pedido.'", `ID_ingrediente`, (COALESCE((SELECT existencia FROM stock AS tt0 WHERE tt0.ID_ingrediente=t1.ID_ingrediente ORDER BY tt0.ID_stock DESC LIMIT 1),0)-t1.cantidad), (`cantidad` * -1), NOW(), "venta" FROM `productos_ingredientes` AS t1 WHERE ID_producto="'.db_codex($pedido['ID']).'"';
            db_consultar($cDescontarIngredientes);    
            
            if (isset($pedido['adicionales']) && is_array($pedido['adicionales']) && count($pedido['adicionales']) > 0 )
            {
                foreach ($pedido['adicionales'] as $adicional)
                {
                    $precio_grabado = db_obtener('adicionables','precio','ID_adicional = '.$adicional);
                    db_agregar_datos ('pedidos_adicionales',array('ID_pedido' => $ID_pedido, 'ID_adicional' => $adicional, 'precio_grabado' => $precio_grabado, 'tipo' => 'poner'));
                }
            }
            
            if ( isset($pedido['ingredientes']) && is_array($pedido['ingredientes']) && count($pedido['ingredientes']) > 0 )
            {
                foreach ($pedido['ingredientes'] as $adicional)
                {
                    $precio_grabado = db_obtener('adicionables','precio','ID_adicional = '.$adicional);
                    db_agregar_datos ('pedidos_adicionales',array('ID_pedido' => $ID_pedido, 'ID_adicional' => $adicional, 'precio_grabado' => $precio_grabado, 'tipo' => 'quitar'));
                }
            }
        
        } elseif ($MODO == 1) {
            
            $BUFFER_DB_DATOS['ID_orden'] = $ID_esta_orden;
            
            db_actualizar_datos('pedidos',$BUFFER_DB_DATOS, 'ID_pedido="'.$pedido['ID_pedido'].'"');
        
        }
    } // foreach($PEDIDOS as $tmpID => $pedido)
}
?>
<?php
if (isset($_POST['ver']))
{
    $c = 'SELECT `ID_comanda`, `data`, `impreso` FROM `comandas` WHERE impreso=0 ORDER BY ID_comanda ASC LIMIT 1';
    $r = db_consultar($c);
    
    if (mysqli_num_rows($r) > 0)
    {
        $f = db_fetch($r);
        $json['aux']['comanda'] = $f;
    }
    return;
}

if (isset($_POST['impreso']))
{
    $datos['impreso'] = '1';
    db_actualizar_datos('comandas', $datos, 'ID_comanda="'.db_codex($_POST['impreso']).'"');
    return;
}
?>
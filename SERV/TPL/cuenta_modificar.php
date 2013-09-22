<?php
$mesa = 0;
if (isset($_POST['mesa']) && is_numeric($_POST['mesa']) && $_POST['mesa'] > 0 )
    $mesa = db_codex($_POST['mesa']);
    
if ($mesa == '0')
{
    $json['error'] = 'Operacion no ejecutada';
    return;
}

$cuenta = '';
if (!empty($_POST['cuenta']) )
    $cuenta = db_codex($_POST['cuenta']);

$campo = db_codex($_POST['campo']);
$valor = db_codex($_POST['valor']);

if ($campo == '')
{
    $json['error'] = 'Operacion no ejecutada';
    return;
}

$c = "UPDATE ordenes SET $campo='$valor' WHERE ID_mesa = $mesa AND cuenta = '$cuenta' LIMIT 1";
error_log ($c);
db_consultar($c);
?>
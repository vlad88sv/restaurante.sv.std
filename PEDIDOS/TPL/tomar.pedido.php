<script type="text/javascript" src="JS/tomar_pedido.js"></script>
<?php $_html['titulo'] = 'Tomar pedido'; ?>
<table style="width:100%;margin: 0px;border-bottom: 4px solid black;">
    <tr>
        <td style="width:70px;text-align:center;">Mesa<br /><input style="vertical-align: middle;width:3em;height: 30px;" type="text" id="ID_mesa" /></td>
        <td style="width:70px;text-align:center;">Mesero<br /><input style="vertical-align: middle;width:3em;height: 30px;" type="text" id="ID_mesero" /></td>
        <td style="text-align:center;"><div id="info_extendida"></div></td>
        <td style="width:400px;text-align: right;">
            <button id="vaciar_cache">Vaciar cache</button>&nbsp;
            <button id="borrar_orden">Borrar</button>&nbsp;
            <button id="ver_resumen"><span style="text-decoration: underline;font-weight:bold;">R</span>esumen</button>
            <button id="enviar_orden_a_cocina"><span style="text-decoration: underline;font-weight:bold;">E</span>nviar</button>
        </td>
    </tr>
</table>

<div id="scroller"></div>
<div id="info_principal"></div>

<table id="menu_productos">
    <tr>
        <td><a class="mp" rel="2" href="#">1.ENTRADAS</a></td>
        <td><a class="mp" rel="1" href="#">2.PIZZAS</a></td>
        <td><a class="mp" rel="8" href="#">3.ENSALADAS</a></td>
        <td><a class="mp" rel="4" href="#">4.POSTRES</a></td>
        <td><a class="mp" rel="5" href="#">5.ESPEC</a></td>
        <td><a class="mp" rel="6" href="#">6.NORMAL</a></td>
        <td><a class="mp" rel="7" href="#">7.CERVEZA</a></td>
        <td><a class="mp" rel="9" href="#">a.TINTO</a></td>
        <td><a class="mp" rel="10" href="#">b.BLANCO</a></td>
        <td><a class="mp" rel="11" href="#">c.CHAMPAGNE</a></td>
    </tr>
</table>
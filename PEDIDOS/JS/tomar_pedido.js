_orden = [];
_b_orden = [];

function MostrarRejillaProductos(datos)
{
    
    var buffer = '';
    
    for (x in datos.aux)
    {
        if (datos.aux[x].descontinuado == 0)
        {
            _productos[datos.aux[x].ID_producto] = datos.aux[x];
            
            buffer += '<div producto="'+datos.aux[x].ID_producto+'" nombre="' + datos.aux[x].nombre + '" precio="' + datos.aux[x].precio + '" ' + (datos.aux[x].disponible == 0 ? 'style="text-decoration:line-through"' : '') +' class="agregar_producto"><div class="nombre">' + datos.aux[x].nombre + '</div>&nbsp;<div class="precio">$' + parseFloat(datos.aux[x].precio).toFixed(2)  + '</div></div>';
        }
    }
    
    $("#scroller").html(buffer);
}


function personalizar_producto_ingredientes_y_adicionales(str_producto)
{
    rsv_solicitar('producto_ingredientes_y_adicionales',{producto: str_producto}, function(datos){
        var buffer = '';      
        buffer = '<table class="contenedor_adicionales ancha delgada estandar zebra">';
        
        buffer += '<tbody>';
        for (x in datos.aux.adicionables)
        {
            if (datos.aux.adicionables[x].disponible == 1) { 
                buffer += '<tr rel="'+datos.aux.adicionables[x].afinidad+'">';
                buffer += '<td style="text-align:center;"><input title="Agregar ( x1 )" type="checkbox" class="agregar_adicionable" grupo="G_'+datos.aux.adicionables[x].ID_adicional+'" value="' + datos.aux.adicionables[x].ID_adicional + '" /></td>';
                buffer += '<td style="text-align:center;"><input title="Agregar doble ( x2 )" type="checkbox" grupo="G_'+datos.aux.adicionables[x].ID_adicional+'" class="agregar_doble_adicionable" value="' + datos.aux.adicionables[x].ID_adicional + '" /></td>';
                buffer += '<td style="text-align:center;">$' + datos.aux.adicionables[x].precio + '</td>';
                buffer += '<td>' + datos.aux.adicionables[x].nombre + '</td>';
                buffer += '<td style="text-align:center;"><input title="quitar" grupo="G_'+datos.aux.adicionables[x].ID_adicional+'" type="checkbox" class="quitar_adicionable" value="' + datos.aux.adicionables[x].ID_adicional + '" /></td>';
                buffer += '</tr>';
            }
        }
        buffer += '</tbody>';
        
        buffer += '<thead>';
        buffer += '<tr><th style="width:60px;">Añadir</th><th style="width:60px;">Doble</th><th style="width:80px;">Precio</th><th>Descripción</th><th style="width:40px;">Quitar</th></tr>';
        buffer += '</thead>';
        buffer += '</table>';
        
        $("#cpep_adicionables").html(buffer);
    }, true);
}

function mostrar_producto_ingredientes_y_adicionales(str_producto)
{
    rsv_solicitar('producto_ingredientes_y_adicionales',{producto: str_producto}, function(datos){
        var buffer = '';
        
        buffer += '<ul>';
        for (x in datos.aux.ingredientes)
        {
            buffer += '<li>' + datos.aux.ingredientes[x].nombre + '</li>';
        }
        buffer += '</ul>';
        
        $("#cpep_ignredientes").html(buffer);
        buffer = '<ul>';
        for (x in datos.aux.adicionables)
        {
            buffer += '<li>' + datos.aux.adicionables[x].nombre + '</li>';
        }
        buffer += '</ul>';
        
        $("#cpep_adicionables").html(buffer);
    }, true);
}

function mostrar_grupo_productos(ID_grupo)
{
    rsv_solicitar('producto_buscar', {grupo: ID_grupo}, MostrarRejillaProductos, true);
}
 
function intentarProductoEnPedido(str_producto, str_detalle, str_precio)
{
    _b_orden = {timestamp: Math.floor(+new Date() / 1000), ID: str_producto, precio: str_precio, detalle: str_detalle, adicionales: [], ingredientes: []};
    
    var buffer = '';
        
    buffer += '<div style="clear:both;height:45px;text-align:center;border-bottom: 4px solid black;margin-bottom:4px;" class="botones_grandes"><button id="agregar_producto_aceptar" style="float:left;">Agregar</button><span style="font-size:1.3em;font-weight:bold;margin:0;padding:0;">' + str_detalle + '</span><button style="float:right;" class="facebox_cerrar">Cerrar</button></div>';
    
    buffer += '';    
    buffer += '<div style="border-bottom: 4px solid black;margin-bottom:4px;height:45px;font-size:0.9em;">Búscar: <input type="text" style="width:100px;" class="busqueda_adicionales" value="" /> - <button class="filtro_adicionales" rel="">Todos</button> <button class="filtro_adicionales" rel="1">Especiales</button> <button class="filtro_adicionales" rel="2">Salsas</button> <button class="filtro_adicionales" rel="3">Topping</button> <button class="filtro_adicionales" rel="4">Ingredientes</button> <button class="filtro_adicionales" rel="5">Quesos y sabores</button></div>';
    buffer += '<div style="bottom:0;top: 160px;left:0;right:0;overflow-y: auto;padding: 0 5px;position: absolute;">';
    buffer += '<div id="cpep_adicionables"></div>';
    buffer += '</div>';
    
    $.modal(buffer, {opacity: 0} );
    
    personalizar_producto_ingredientes_y_adicionales(str_producto);
    
}

function convertirProductoEnPedido(buffer_de_orden)
{
    _orden.push(buffer_de_orden);
    miniResumenOrden();
}

function ResumenOrden()
{
    var buffer = '';
    
    if (_orden.length == 0)
    {
        $("#scroller").html('<p>No hay ningún pedido agregado</p>');
        return;
    }
    
    buffer += '<table class="estandar ancha bordes zebra" id="seleccion_producto">';
    for (x in _orden)
    {
        var adicionales = '';
        if (_orden[x].adicionales.length > 0) {
            adicionales += '<ul>';
            
            for (y in _orden[x].adicionales) {
                adicionales += '<li>' + _adicionales[_orden[x].adicionales[y]].nombre + '</li>';
            }
            
            adicionales += '</ul>';
        }
        
        buffer += '<tr ID_orden="' + x + '">';
        buffer += '<td>' + (parseInt(x)+1) + '</td>';
        buffer += '<td>' + _orden[x].detalle + adicionales + '</td>';
        buffer += '<td>' + _orden[x].precio + '</td>';
        buffer += '<td><button class="btn_eliminar_pedido">Eliminar</button></td>';
        buffer += '</tr>';
        
    }
    buffer += '</table>';
    
    
    _orden[x].precio
    
    $("#scroller").html(buffer);
}

function miniResumenOrden()
{
    var ordenador = {};
    var buffer = '';
    
    if (_orden.length == 0)
    {
        $('#info_principal').html(buffer);
        return;
    }
    
    for (x in _orden)
    {
        if (_orden[x].ID in ordenador)
        {
            ordenador[_orden[x].ID].contador++;
        } else {
            ordenador[_orden[x].ID] = {};
            ordenador[_orden[x].ID].producto = _orden[x].detalle;
            ordenador[_orden[x].ID].contador = 1;
        }
    }
    console.log(ordenador);
    
    buffer += '<ul>';
    for (x in ordenador)
    {
        buffer += '<li>' + ordenador[x].contador + ' x ' + ordenador[x].producto+ '</li>';
    }
    buffer += '</ul>';
    $('#info_principal').html(buffer);
}

$(function(){  
    
    $('#ID_mesa').change(function(){
        var ID_mesa = $('#ID_mesa').val();
        $("#ID_mesero").prop('disabled', true);
        
        rsv_solicitar('cuenta',{mesa: ID_mesa, pendientes: true}, function(datos){
            $("body").removeClass('pulso');
            if ( typeof datos.aux.pendientes != "undefined" )
            {
                var ID_mesero = datos.aux.pendientes[Object.keys(datos.aux.pendientes)[0]][0].ID_mesero;
                $("#ID_mesero").val(ID_mesero);
                $("#info_extendida").html('<span style="color:red;">¡cuenta abierta!</span>');
                if (datos.aux.pendientes[Object.keys(datos.aux.pendientes)[0]][0].flag_tiquetado == "1") {
                    $("#info_extendida").html('<span style="color:red;">¡parece que la va a meter donde no debe!</span>');
                    $("body").addClass('pulso');
                }
            } else {
                $("#info_extendida").html('~cuenta nueva~');
                $("#ID_mesero").val('');
            }
            
            $("#ID_mesero").removeProp('disabled');
            $("#ID_mesero").focus();
            
        });         
    });
    
    $('#enviar_orden_a_cocina').click(function(){
        
        var ID_mesa = $('#ID_mesa').val();
        var ID_mesero = $('#ID_mesero').val();
        
        if (/^[0-9]+$/.test(ID_mesa) == false)
        {
            alert('Número de mesa incorrecto.');
            $('#ID_mesa').focus();
            return;
        }

        if (/^[0-9]+$/.test(ID_mesero) == false)
        {
            alert('ID de mesero incorrecto.');
            $('#ID_mesero').focus();
            return;
        }
        
        if (_orden.length == 0)
        {
            alert('No hay pedidos en la orden.');
            return;
        }
        
        if (!confirm('¿Desea enviar esta orden a cocina?')) return;
        
        $('#enviar_orden_a_cocina').prop('disabled', true);
        
        rsv_solicitar('ingresar_orden',{mesa: ID_mesa, mesero: ID_mesero, orden: _orden}, function(){
            window.location = '/PEDIDOS/';
        }); 
        
    });
    
    
    $('.agregar_producto').live('click', function(){
        var ID_producto = $(this).attr('producto');
        intentarProductoEnPedido(ID_producto, $(this).attr('nombre'), $(this).attr('precio'));
    });
    
    
    $('.agregar_producto').live('contextmenu', function(event){
        event.preventDefault();
        var ID_producto = $(this).attr('producto');
        var _b_orden = {ID: ID_producto, precio: $(this).attr('precio'), detalle: $(this).attr('nombre'), adicionales: [], ingredientes: []};
        convertirProductoEnPedido(_b_orden);
    });
    
    $('#agregar_producto_aceptar').live('click', function(){

        _b_orden.ingredientes = [];
        
        $('#cpep_ingredientes input[type="checkbox"]:checked:enabled').each(function(){
            _b_orden.ingredientes.push($(this).val());
        });

        _b_orden.adicionales = [];
        
        $('#cpep_adicionables input.agregar_adicionable[type="checkbox"]:checked:enabled').each(function(){
            _b_orden.adicionales.push($(this).val());
        });

        $('#cpep_adicionables input.agregar_doble_adicionable[type="checkbox"]:checked:enabled').each(function(){
            _b_orden.adicionales.push($(this).val());
            _b_orden.adicionales.push($(this).val());
        });

        
        $('#cpep_adicionables input.quitar_adicionable[type="checkbox"]:checked:enabled').each(function(){
            _b_orden.ingredientes.push($(this).val());
        });

        convertirProductoEnPedido(_b_orden);
        $.modal.close();
    });
    
    $('.btn_detalles_pedido').live('click',function(){
        
    });
    
    $(document).on('click','#cpep_adicionables input[type="checkbox"]', function(){
        var grupo = $(this).attr('grupo');
        $('#cpep_adicionables input[type="checkbox"][grupo="'+grupo+'"]:checked').not(this).removeAttr('checked');
    });
    
    $('.btn_eliminar_pedido').live('click', function(){
        
        if (!confirm('¿Desea eliminar este producto?')) return;
        
        _orden.splice($(this).closest('tr').attr('ID_orden'),1);
        miniResumenOrden();
        ResumenOrden();
    });
    
    $('#ver_resumen').click(function(event){
        ResumenOrden();
    });
    
    $(".agregar_producto").live('click', function(event){
        event.preventDefault();            
    });
    
    $(".mp").click(function (event){
        event.preventDefault();
        mostrar_grupo_productos($(this).attr('rel'));
    });
    
    $(".filtro_adicionales").live('click', function (event){
       event.preventDefault();
       var afinidad = $(this).attr('rel');
       if (afinidad == '') {
        $('.contenedor_adicionales tbody tr').show();
        return;
       }
       
       $('.contenedor_adicionales tbody tr').hide();
       $('.contenedor_adicionales tbody tr[rel="'+afinidad+'"]').show();
    });
    
    $(".busqueda_adicionales").live('keyup', function(){
       var busqueda = $(this).val();
       if (busqueda == '') {
        $('.contenedor_adicionales tbody tr').show();
        return;
       }
       
       $('.contenedor_adicionales tbody tr').hide();
       $('.contenedor_adicionales tbody tr:icontains("'+busqueda+'")').show();
        
    });
    
    $('#ID_mesa').keydown(function(event){
        event.stopPropagation();
    });
    
    $('#ID_mesero').keydown(function(event){
        event.stopPropagation();
    });
    
    $(document).keydown(function(event){
        var keyCode = event.keyCode || event.which;
        
        //console.log(keyCode);
        
        claves = { entradas: 49, pizzas: 50, ensaladas: 51, postres: 52, especiales: 53, normal: 54, cerveza: 55, tinto: 65, blanco: 66, champagne: 67, resumen: 82 };

        switch (keyCode) {
          case claves.entradas:
            $('.mp[rel="2"]').click();
          break;
          case claves.pizzas:
            $('.mp[rel="1"]').click();
          break;
          case claves.ensaladas:
            $('.mp[rel="8"]').click();
          break;
          case claves.postres:
            $('.mp[rel="4"]').click();
          break;
          case claves.especiales:
            $('.mp[rel="5"]').click();
          break;
          case claves.normal:
            $('.mp[rel="6"]').click();
          break;
          case claves.cerveza:
            $('.mp[rel="7"]').click();
          break;
          case claves.tinto:
            $('.mp[rel="9"]').click();
          break;
          case claves.blanco:
            $('.mp[rel="10"]').click();
          break;
          case claves.champagne:
            $('.mp[rel="11"]').click();
          break;
          case claves.resumen:
            $('#ver_resumen').click();
          break;
        } 
    });
    
    $("#vaciar_cache").click(function () {
       if (confirm("Esto vaciará el cache y borrará el pedido actual.\nEsto es útil si desea cargar nuevos cambios del sistema o nuevos productos/adicionables.") == false)
        return;
    
        localStorage.clear();
        window.location.reload(true);
       
    });
    
    mostrar_grupo_productos(1);

});
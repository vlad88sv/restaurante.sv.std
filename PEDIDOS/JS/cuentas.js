_ordenes = {}; // Objeto donde mantenemos las ordenes en presentación

function agregarPedido(grupo)
{
    var orden = $('<div class="orden" />');
    var total = 0.00;
    orden.append('<div style="height:1.5em;"><span class="grupo">Mesa #'+_ordenes[grupo][0].ID_mesa+'</span> <span class="precio" /></div>');
    orden.append('<hr />');
    orden.attr('id','o_'+grupo);
    orden.attr('id_mesa',_ordenes[grupo][0].ID_mesa);
    
    for (x in _ordenes[grupo])
    {
        var pedido = $('<div class="pedido" />');
        pedido.attr('id','p_'+grupo+_ordenes[grupo][x].ID_pedido);
        pedido.append('<div class="producto" />');
        
        pedido.find('.producto').html(_ordenes[grupo][x].nombre_producto);
                
        if ('adicionales' in _ordenes[grupo][x] && _ordenes[grupo][x].adicionales.length > 0)
        {
            pedido.append('<div class="adicionales" ><ul></ul></div>');
            for (adicional in _ordenes[grupo][x].adicionales)
            {
                pedido.find('.adicionales ul').append('<li>' + _ordenes[grupo][x].adicionales[adicional].nombre+ '</li>');
            }
        }

        if ('ingredientes' in _ordenes[grupo][x] && _ordenes[grupo][x].ingredientes.length > 0)
        {
            pedido.append('<div class="ingredientes" ><ul></ul></div>');
            for (adicional in _ordenes[grupo][x].adicionales)
            {
                pedido.find('.ingredientes ul').append('<li>' + _ordenes[grupo][x].ingredientes[adicional].nombre + '</li>');
            }
        }

        total += parseFloat(_ordenes[grupo][x].precio_grabado);
        orden.append(pedido);   
    }
    
    orden.append('<hr />');
    orden.append('<div class="controles"><button class="imp_tiquete">Tiquete</button></div>');
    
    orden.find('.precio').html( '$' + (total * 1.10).toFixed(2) );
    
    $("#pedidos").append(orden);
    
}

function actualizar() {
    rsv_solicitar('cuenta_pendientes',{mesa:$("#id_mesa").val()},function(datos){
       _ordenes = {};
       $("#pedidos").empty();
       
       if ( typeof datos.aux.pendientes === "undefined" )
        return;
    
       for(x in datos.aux.pendientes)
       {
         _ordenes[x] = datos.aux.pendientes[x];                  
         agregarPedido(x);
       }
    
    });
}

setInterval(actualizar,2000);

$(function(){
    
    actualizar();
       
    $('#pedidos').on('click','.imp_tiquete', function(){
        var orden = $(this).parents('.orden');
        
        if (!confirm('¿Imprimir tiquete de mesa #' +  orden.attr('id_mesa') +'?'))
            return;
        
        rsv_solicitar('tiquete_pendientes',{imprimir:orden.attr('id_mesa')},function(datos){
            // VOID
        });
    });
    
});
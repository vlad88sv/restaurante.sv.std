_pedidos = {}; // Objeto donde mantenemos los pedidos en presentación
bool_mucho_tiempo = true;

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " años";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " meses";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " días";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " horas";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutos";
    }
    return Math.floor(seconds) + " segundos";
}

function traducirGrupo(ID_grupo)
{
    //console.log(ID_grupo);
    
    switch(ID_grupo)
    {
        case '2':
            return 'entradas';
            break;
        case '1':
            return 'pizzas';
            break;
        case '3':
            return 'pastas';
            break;
        case '4':
            return 'postres';
            break;
        case '5':
        case '6':
        case '7':
            return 'bebidas';
            break;
    }
}

function agregarPedido(ID_pedido)
{
    var pedido = $('<div class="pedido" />');
    pedido.attr('id','p_'+ID_pedido);
    pedido.append('<div class="producto" />');
    pedido.append('<div class="tiempo" />');
    pedido.append('<div class="adicionales" ><ul></ul></div>');
    pedido.append('<div class="ingredientes" />');
    pedido.append('<div class="mesa" />');
    
    pedido.find('.producto').html(_pedidos[ID_pedido].nombre_producto);
    pedido.find('.tiempo').html(_pedidos[ID_pedido].fechahora_pedido);
    pedido.find('.mesa').html(_pedidos[ID_pedido].ID_mesa);
    
    if ('adicionales' in _pedidos[ID_pedido] && _pedidos[ID_pedido].adicionales.length > 0)
    {
        for (adicional in _pedidos[ID_pedido].adicionales)
        {
            pedido.find('.adicionales ul').append('<li>' + _pedidos[ID_pedido].adicionales[adicional].nombre + '</li>');
        }
    }
    
    //pedido.show();
    
    $("#"+traducirGrupo(_pedidos[ID_pedido].ID_grupo)).append(pedido);
}

function actualizarTiempoTranscurrido()
{
    for (indice in _pedidos) {
        $('#p_'+indice).find('.tiempo').html('Esperando ' + timeSince(new Date(_pedidos[indice].fechahora_pedido_uts*1000)));
               
        // Si lleva más de 15m esperando
        if (Math.floor((new Date() - new Date(_pedidos[indice].fechahora_pedido_uts*1000)) / 1000) > 900)
        {
            $('#p_'+indice).toggleClass('mucho_tiempo', bool_mucho_tiempo);
        }
    }
    
    bool_mucho_tiempo = !bool_mucho_tiempo;
}

function actualizar() {
    rsv_solicitar('pedido_pendientes',{},function(datos){
       
       setTimeout(actualizar,1000);
    
       if (datos.aux.pendientes.lenght == 0)
        return;
    
       for(x in datos.aux.pendientes)
       {
       
        if (datos.aux.pendientes[x].ID_pedido in _pedidos == false)
        {
         _pedidos[datos.aux.pendientes[x].ID_pedido] = datos.aux.pendientes[x];
         
         //console.log(traducirGrupo(datos.aux.pendientes[x].ID_grupo));
         
         agregarPedido(datos.aux.pendientes[x].ID_pedido);
        }
       }
    
    });
}

$(function(){
    
    actualizar();
    setInterval(actualizarTiempoTranscurrido, 1000);
    
    $('div.pedido').live('click', function(){
        $(this).remove();
    });

});
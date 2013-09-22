_ordenes = {}; // Objeto donde mantenemos las ordenes en presentación
max_id = 0;
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

function Beep() {
    $('#beep').get(0).play();
}

function agregarPedido(grupo)
{
    var orden = $('<div class="orden" />');
    
    orden.append('<div style="height:2em;"><span class="grupo"><span class="mesa">#'+_ordenes[grupo][0].ID_mesa+'</span></span> <span class="tiempo" /></div>');
    orden.append('<hr />');
    orden.attr('id','o_'+grupo);
    orden.attr('id_orden',_ordenes[grupo][0].ID_orden);
    orden.find('.tiempo').html(timeSince(new Date(_ordenes[grupo][0].fechahora_pedido_uts*1000)));
    // Si lleva más de 15m esperando
    if (Math.floor((new Date() - new Date(_ordenes[grupo][0].fechahora_pedido_uts*1000)) / 1000) > 900)
    {
	orden.toggleClass('mucho_tiempo', bool_mucho_tiempo);
    }

    for (x in _ordenes[grupo])
    {
        var pedido = $('<div class="pedido" />');
        pedido.attr('id','p_'+grupo+_ordenes[grupo][x].ID_pedido);
        pedido.append('<div class="producto" />');
        
        pedido.find('.producto').html(_ordenes[grupo][x].nombre_producto);
        
        if ('adicionales' in _ordenes[grupo][x] && _ordenes[grupo][x].adicionales.length > 0)
        {
	    pedido.append('<p style="color:lightskyblue;">Adicionar</p>');
            pedido.append('<div class="adicionales" ><ul></ul></div>');
            for (adicional in _ordenes[grupo][x].adicionales)
            {
                pedido.find('.adicionales ul').append('<li>' + _ordenes[grupo][x].adicionales[adicional].nombre + '</li>');
            }
        }

        if ('ingredientes' in _ordenes[grupo][x] && _ordenes[grupo][x].ingredientes.length > 0)
        {
	    pedido.append('<p style="color:lightcoral;">Quitar</p>');
            pedido.append('<div class="ingredientes" ><ul></ul></div>');
            for (adicional in _ordenes[grupo][x].ingredientes)
            {
                pedido.find('.ingredientes ul').append('<li>' + _ordenes[grupo][x].ingredientes[adicional].nombre + '</li>');
            }
        }
	
        orden.append(pedido);
    }
    $("#pedidos").append(orden);
}

function actualizarTiempoTranscurrido()
{
    bool_mucho_tiempo = !bool_mucho_tiempo;
}

function actualizar() {
    rsv_solicitar('orden_pendientes',{},function(datos){
	
	var max_x = 0;
    
	if ( typeof datos.aux.pendientes === "undefined" )
	{
	 $('#pedidos').html('<div id="nada_pendiente" style="color:red;font-size:8em;text-align:center;">Nada pendiente!</div>')
	 return;
	}
	
	$('#pedidos').empty();
	_ordenes = {};
	 
	for(x in datos.aux.pendientes)
	{    
	    _ordenes[x] = datos.aux.pendientes[x];
	    if (_ordenes[x][0].ID_orden > max_x) {
		max_x = _ordenes[x][0].ID_orden;
	    }
	    
	    agregarPedido(x);
	}
	
	if (max_id < max_x) {
	    Beep();
	    max_id = max_x;
	}
	
    
    });
}

function crearTiquete(_datos, texto_base)
{
    var orden = $('<div class="orden" style="min-height:10cm;" />');
    orden.append('<p style="font-weight:bold;text-align:center;">7G, S.A. de C.V.</p>');
    orden.append('<p style="text-align:center;">Plaza volcán, Km. 16.5,<br />Calle al boquerón<br />Santa Tecla, La Libertad</p>');
    orden.append('<p style="text-align:center;">Tel. Oficinas administrativas:<br />(503) 2243-6017</p>');
    
    var total = 0.00;
    orden.append('<br /><br /><div style="height:1.5em;text-align:center;"><span class="grupo" style="height:1.5em;text-align:center;font-size: 16px; font-weight:bold;">Mesa #'+_datos[0].ID_mesa+'</span></div><br /><br />');
    
    for (x in _datos)
    {
        var pedido = $('<div class="pedido" style="padding:0px;margin:0px;"  />');
        
        pedido.append('<div class="producto" style="padding:0px;margin:0px;" />');
        
        pedido.find('.producto').html( _datos[x].nombre_producto.substring(0,23) + ' <div style="float:right;">$' + parseFloat(_datos[x].precio_grabado).toFixed(2) + '</div>' );
                
        if ('adicionales' in _datos[x] && _datos[x].adicionales.length > 0)
        {
            pedido.append('<div class="adicionales" ><ul style="padding:2px;"></ul></div>');
            for (adicional in _datos[x].adicionales)
            {
                pedido.find('.adicionales ul').append('<li>' + _datos[x].adicionales[adicional].nombre  + ' <div style="float:right;">$' + parseFloat(_datos[x].adicionales[adicional].precio_grabado).toFixed(2) + '</div>' + '</li>');
		total += parseFloat(_datos[x].adicionales[adicional].precio_grabado);
            }
        }

        total += parseFloat(_datos[x].precio_grabado);
        orden.append(pedido);   
    }

    var date    = new Date();
    var date    = date.getUTCFullYear() + '-' + ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' + 
            ('00' + date.getUTCDate()).slice(-2) + ' ' + 
            ('00' + date.getUTCHours()).slice(-2) + ':' + 
            ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
            ('00' + date.getUTCSeconds()).slice(-2);
    
    orden.append('<br />');
    orden.append('<table style="width:100%;" class="totales"></table>');
    orden.find('table.totales').append('<tr><td>SubTotal:</td><td>' + '$' + (total).toFixed(2) + '</td></tr>' );
    orden.find('table.totales').append('<tr><td>Propina (10%):</td><td>' + '$' + ((total * 1.10) - total ).toFixed(2) + '</td></tr>' );
    orden.find('table.totales').append('<tr><td>Total:</td><td>' + '$' + (total * 1.10).toFixed(2) + '</td></tr>' );
    orden.append('<br /><br /><br /><br /><p style="text-align:center;">La pizzería - Plaza Volcán<br />¡Gracias por su compra!<br /><br />' + date + '</p>');
    orden.append('<br /><p style="text-align:center;">'+_datos[x].cuenta+'</p>');
    orden.append('<br /><p style="text-align:center;">' + texto_base + '</p>');
    
    orden.jqprint();
    
}

function tiquetes() {
    rsv_solicitar('tiquete_pendientes',{},function(datos){
    
       if ( typeof datos.aux.tiquetes === "undefined" )
        return;
    
    
        rsv_solicitar('tiquete_pendientes',{impreso: datos.aux.tiquetes.ID_tiquete},function(datos){
           // VOID
        });
       
       rsv_solicitar('cuenta',{mesa:datos.aux.tiquetes.ID_mesa, cuenta: datos.aux.tiquetes.cuenta},function(datos){
            for(x in datos.aux.pendientes)
            {
                crearTiquete(datos.aux.pendientes[x], '');
		crearTiquete(datos.aux.pendientes[x], '*** COPIA CAJA ***');
            }
       });
    });
}

setInterval(actualizarTiempoTranscurrido,2000);
setInterval(actualizar,2000);

$(function(){
    
    $('div.orden').live('click', function(){
        
        var ID_orden = $(this).attr('id_orden');
        if (!confirm('Desea despachar esta orden #'+ID_orden+'?'))
            return;
        
        $(this).jqprint();
        
        rsv_solicitar('despachar_orden',{orden: ID_orden},function(datos){
            
        });
        $(this).animate({width: 'hide'}, function() { $(this).remove(); } );        
    });

});

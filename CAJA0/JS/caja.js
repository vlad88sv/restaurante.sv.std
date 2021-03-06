_t_id_pedido = 0; // Variable donde se almacena temporalmente el ID de pedido en edición
keys = {};
menu_visible = false;
cmp_cache = {} // objeto donde almacenamos la última actualización real

function alarmaSonido() {
    
    if(typeof(Storage)=="undefined") return;

    if (new Date().getTime() > (localStorage.alarmaSonido || 0))
    {
        localStorage.alarmaSonido = (new Date().getTime() + 900000);
        $.modal('<p style="font-weight:bold;font-size:20px;color:yellow;text-align:center;">EL SONIDO ESTA MUY BAJO</p>');
    }
}

function actualizar() {
    
    var fecha = $('#fecha_caja').val();

    rsv_solicitar('cuenta',{mesa:$("#id_mesa").val(), pendientes: 1},function(datos){
        
       _ordenes = {};
       
       if ( typeof datos.aux.pendientes === "undefined" )
       {
        $("#pedidos").html('<div style="text-align:center;color:yellow;">Nada encontrado!</div>');
        return;
       }
       
       if (JSON.stringify(cmp_cache) == JSON.stringify(datos.aux.pendientes)) {
        // No redendizar nada, con el beneficio de:
        // * No alterar el DOM y hacer mas facil Firedebuggear
        // * No procesar innecesariamente
        // * Facilitar el click en los botones
        // * Hacer posible mantener estado en los cheques
        return;
       }
       
       cmp_cache = datos.aux.pendientes;
    
       $("#pedidos").empty();
       for(x in datos.aux.pendientes)
       {
        _ordenes[x] = datos.aux.pendientes[x];                  
        agregarPedido($("#pedidos"), x, 0);
       }
    
    });
}

function cuadrarCorte() {
    var total_a_cuadrar = parseFloat($("#total_a_cuadrar").val());
    var total_efectivo = parseFloat($("#total_efectivo").val());
    var total_pos = parseFloat($("#total_pos").val());
    var total_compras = parseFloat($("#total_compras").val());
    var total_diferencia = total_a_cuadrar - (total_efectivo + total_pos + total_compras);
    
    $("#total_diferencia").val(total_diferencia.toFixed(2));
    
    return total_diferencia.toFixed(2);
}

function estadisticas() {
    var fecha = $('#fecha_caja').val();
    
     rsv_solicitar('estadisticas',{obtener: ['dsn','tps','tms'], fecha: fecha},function(datos){
         if (typeof datos.aux.dsn != 'undefined') {
            var buffer = '';

            for (usuario in datos.aux.dsn)
            {
               buffer += "[" + datos.aux.dsn[usuario].usuario + " : " + datos.aux.dsn[usuario].porcentaje + "%]";
            }

            $("#dsn").html(buffer);
         } else {
             $("#dsn").html('Sin datos');
         }
         
         $("#tps").html(datos.aux.tps + ' minutos');
         $("#tms").html(datos.aux.tms + ' minutos');
         
         var rms = parseFloat(datos.aux.sonido);
         var sonido = '<span style="color:yellow;">El sonido es muy bajo!</span>';
         if (rms > 0.25) {
            sonido = 'Sonido OK';
         } else {
            alarmaSonido();
         }
         $("#sonido").html( rms + ' ' + sonido );
     });
}

setInterval(actualizar,5000);
setInterval(estadisticas,30000);

function activarAdm()
{
   $('#fecha_caja').prop('readonly', false);
   $('#historial_cortez').show();
   $('#cortes').show();
}

$(function(){
    
    actualizar();
    estadisticas();
    
    $(document).keydown(function (e) {
        keys[e.which] = true;
        
        checkKeys();
    });

    $(document).keyup(function (e) {
        delete keys[e.which];
        
        checkKeys();
    });

    function checkKeys() {
        if( typeof keys[65] != "undefined" && typeof keys[68] != "undefined" && typeof keys[77] != "undefined")
        {
            activarAdm();
        }
    }
    
    $(document).on('click','.chk_separar_pedido',function(){
        var orden = $(this).parents('.orden');
        tmp_cheques = orden.find('.chk_separar_pedido:checked');
        
        if (tmp_cheques.length > 0) {
            orden.find('.controles_seleccion').show();
        } else {
            orden.find('.controles_seleccion').hide();    
        }
    });
    
    $(document).on('click','.btn_separar_cuenta', function(){
        var orden = $(this).parents('.orden');
        tmp_cheques = orden.find('.chk_separar_pedido:checked');
        
        if (tmp_cheques.length > 0) {
            var pedidos = [];
            
            tmp_cheques.each(function(indice, objeto) {
                pedidos.push($(objeto).val());
            });
        
            rsv_solicitar('pedidos_avanzados',{pedidos: pedidos, cuenta: orden.attr('cuenta'), mesa: orden.attr('id_mesa'), FORZAR_CUENTA_NUEVA: true},function(datos){
                // VOID
            });

        }
    });
    
    $(document).on('click','.btn_cambiar_mesa', function(){
        var orden = $(this).parents('.orden');
        tmp_cheques = orden.find('.chk_separar_pedido:checked');
        
        if (tmp_cheques.length > 0) {
            
            var mesa = prompt("¿Cúal es el número de la nueva mesa?");
        
            if ( !$.isNumeric(mesa) || mesa == 0 )
            {
                alert('El nuevo número de mesa es inválido.');
                return;
            }

            var mesero = prompt("¿Código del mesero?");
        
            if ( !$.isNumeric(mesero) || mesero == 0 )
            {
                alert('El código de mesero es inválido.');
                return;
            }
            
            var pedidos = [];
            
            tmp_cheques.each(function(indice, objeto) {
                pedidos.push($(objeto).val());
            });
        
            rsv_solicitar('pedidos_avanzados',{pedidos: pedidos, cuenta: orden.attr('cuenta'), mesa: mesa, mesero: mesero},function(datos){
                // VOID
            });

        }
    });
    
    $("#ver_historial").click(function(){
        var fecha = $('#fecha_caja').val();
        
        $.modal('<h1>Historial de '+fecha+'</h1><br /><div style="height:500px;overflow-y:auto;"><div id="destino_historial"></div></div>');

        rsv_solicitar('cuenta',{mesa:$("#id_mesa").val(), historial: 1, fecha: fecha},function(datos){

           _ordenes = {};
           
           if ( typeof datos.aux.pendientes === "undefined" )
           {
            $("#destino_historial").html('<div style="text-align:center;color:yellow;">Nada encontrado!</div>');
            return;
           }

           for(x in datos.aux.pendientes)
           {
            _ordenes[x] = datos.aux.pendientes[x];                  
            agregarPedido($("#destino_historial"), x, 1);
           }

        });
    });
    
    $("#id_mesa").keyup(function(){
        if ($("#id_mesa").val() === '777') {
            $("#id_mesa").val('');
            activarAdm();
        }
    });
    

    $("#mostrar_opciones").click(function(){
        menu_visible = !menu_visible;
        $("#menu").toggle(menu_visible);
    });


    if ( $(window).width() < 1000) {
        $("#pestana_cocina").remove();
    }

    $(document).on('click','.abrir_cuenta', function(){
        if (!confirm('¿Realmente desea abrir nuevamente esta cuenta?'))
            return;
                       
        var orden = $(this).parents('.orden');
                
        var motivo = '';
        var intentos = 0;
        
        while (motivo.length < 3 && intentos < 3) {
            motivo = prompt('Ingrese el motivo de la re-apertura.');
            motivo = $.trim(motivo);
            intentos++;
        }
        
        if (motivo == '') {
            alert('Debe ingresar un motivo para aperturar nuevamente la cuenta');
            return;
        }
        
        rsv_solicitar('cuenta_abrir',{cuenta:orden.attr('cuenta'), motivo: motivo},function(datos){
            
        });
    });
    
       
    $('#pedidos').on('click','.anular_cuenta', function(){
        if (!confirm('¿Realmente desea anular esta orden?'))
            return;
                       
        var orden = $(this).parents('.orden');
        
        var motivo = '';
        var intentos = 0;
        
        while (motivo.length < 3 && intentos < 3) {
            motivo = prompt('Ingrese el motivo de la anulación.');
            motivo = $.trim(motivo);
            intentos++;
        }
        
        if (motivo == '') {
            alert('Debe ingresar un motivo para la anulación');
            return;
        }
        
        rsv_solicitar('cuenta_anular',{mesa:orden.attr('id_mesa'), cuenta: orden.attr('cuenta'), motivo: motivo},function(datos){
            
        });
    });
    
    $('#pedidos').on('click','.cerrar_cuenta', function(){
        if (!confirm('¿Realmente desea cerrar esta cuenta?'))
            return;
   
        var orden = $(this).parents('.orden');
           
        rsv_solicitar('cuenta_cerrar',{mesa: orden.attr('id_mesa'), cuenta: orden.attr('cuenta')},function(datos){
    
         });     
        
    });

    $(document).on('click','.imp_tiquete', function(){
        if (!confirm('¿Realmente desea imprimir este tiquete?'))
            return;
        
        var orden = $(this).parents('.orden');
        
        rsv_solicitar('cuenta',{ cuenta: orden.attr('cuenta'), facturacion: '1'},function(datos){
            for(x in datos.aux.pendientes)
            {
                var html = crearTiquete(datos.aux.pendientes[x]);
                rsv_solicitar('tiquete_pendientes',{imprimir: html , cuenta: orden.attr('cuenta')},function(datos){});
            }
       });
    });
    
    $(document).on('click','.quitar_propina', function(){
        if (!confirm('¿Realmente desea quitarle el sustento a los empleados?'))
            return;
        
        var motivo = '';
        var intentos = 0;
        
        while (motivo.length < 3 && intentos < 3) {
            motivo = prompt('Ingrese el motivo para quitar propina.');
            motivo = $.trim(motivo);
            intentos++;
        }
        
        if (motivo == '') {
            alert('Debe ingresar un motivo motivo para quitar propina.');
            return;
        }

        var orden = $(this).parents('.orden');
        rsv_solicitar('cuenta_modificar',{mesa: orden.attr('id_mesa'), cuenta: orden.attr('cuenta'), campo: 'flag_nopropina', valor: '1', motivo: motivo},function(datos){
        });
    });
    

    $(document).on('click','.quitar_iva', function(){
        if (!confirm("¿Hacer esta cuenta exenta de I.V.A.?\nNota: si agrega más productos deberá ejecutar esta opción nuevamente."))
            return;
        
        var motivo = '';
        var intentos = 0;
        
        while (motivo.length < 3 && intentos < 3) {
            motivo = prompt('Ingrese el motivo para quitar I.V.A.');
            motivo = $.trim(motivo);
            intentos++;
        }
        
        if (motivo == '') {
            alert('Debe ingresar un motivo motivo para quitar I.V.A.');
            return;
        }

        var orden = $(this).parents('.orden');
        rsv_solicitar('cuenta_modificar',{mesa: orden.attr('id_mesa'), cuenta: orden.attr('cuenta'), campo: 'flag_exento', valor: '1', motivo: motivo},function(datos){
        });
    });

    
    $('#pedidos').on('click','.editar_pedido', function(){
        var pedido = $(this).parents('.pedido');
        _t_id_pedido = pedido.attr('id_pedido');
        
        var buffer = '<div class="contenedor_edicion_pedido" rel="'+_t_id_pedido+'">';
        buffer += '<h1>Edición de pedido</h1><p>ID de pedido: '+_t_id_pedido+'</p>';
        buffer += '<h1>Cambio de precio</h1><p>Nuevo precio: <input type="text" style="width:75px;" value="0.00" id="pedido_valor_nuevo_precio" /> Razón: <input type="text" style="width:450px;font-size:0.9em;" value="" id="pedido_valor_nuevo_precio_razon" /><button id="pedido_cambiar_precio">Cambiar</button></p>';
        buffer += '</div>';
        $.modal(buffer);    
    });    

    
    $('#pedidos').on('click','.cancelar_pedido', function(){
        var orden = $(this).parents('.orden');
        
        if (!confirm('¿Realmente desea quitar este producto de la mesa #'+orden.attr('id_mesa')+'?'))
            return;
        
        var motivo = '';
        var intentos = 0;
        
        while (motivo.length < 3 && intentos < 3) {
            motivo = prompt('Ingrese el motivo de la eliminación.');
            motivo = $.trim(motivo);
            intentos++;
        }
        
        if (motivo == '') {
            alert('Debe ingresar un motivo para la eliminación');
            return;
        }
        
        var id_pedido = $(this).parents('.pedido').attr('id_pedido');
        
        rsv_solicitar('pedido_modificar',{pedido: id_pedido, campo: 'flag_cancelado', valor: '1', nota: motivo },function(datos){
            // VOID
        });
    });    
    

    $('#pedidos').on('click','.imp_factura', function(){
        if (!confirm('¿Realmente desea imprimir esta factura?'))
            return;
    });
    
    $('#pedidos').on('click','.imp_ccf', function(){
        if (!confirm('¿Realmente desea imprimir este credito fiscal?'))
            return;
    });

    $('#inventario').click(function(){
        
        rsv_solicitar('inventario',{},function(datos){
            var buffer = '';
            buffer += '<table class="estandar ancha bordes amplia">';
            buffer += '<tr><th>Ingrediente</th><th>Existencia</th></tr>';
            for (x in datos.aux) {
                var existencia_actual = parseFloat(datos.aux[x].existencia_actual);
                var divisor = parseFloat(datos.aux[x].divisor).toFixed(2);
                buffer += '<tr><td>' + datos.aux[x].nombre + '</td><td>' + existencia_actual + datos.aux[x].unidad + ' / ' + (existencia_actual / divisor)  + datos.aux[x].unidad2 + ' </td></tr>';
            }
            buffer += '</table>';
            $.modal(buffer);
        });
        
        
    });    
        
    $('#pedidos').on('click', '.cambio_mesa', function() {
        if (!confirm("¿Desea mover los pedidos de esta cuenta a otra?\nNota: si la mesa ya existe entonces se combinarán los pedidos"))
            return;
        
        var mesa = prompt("¿Cúal es el número de la nueva mesa?");
        
        if ( !$.isNumeric(mesa) || mesa == 0 )
        {
            alert('El nuevo número de mesa es inválido.');
            return;
        }
        
        var orden = $(this).parents('.orden');
        
        rsv_solicitar('cambio_mesa',{cuenta:orden.attr('cuenta'),  mesa_nueva:mesa},function(datos){
            
        });
        
    });
    
    $("#compras").click(function() {
        rsv_solicitar('producto_ingredientes_y_adicionales',{modo: 'inventario'}, function(datos){
            var buffer = '<h1>Compras</h1>';
            buffer += '<hr />';
            buffer += '<h2>General</h2>';
            buffer += '<form id="datos_compra">';
            buffer += '<table class="ancha">';
            buffer += '<tr><th>Comprado a</th><th>Descripción</th><th>Precio</th><th>Pagado via</th></tr>';
            buffer += '<tr><td><input type="text" name="empresa" value="" /></td><td><input type="text" name="descripcion" value="" /></td><td><input type="text" name="precio" value="0.00" /></td><td><select name="via"><option value="caja">Caja</option><option value="cheque">Cheque</option></select></td></tr>';
            buffer += '</table>';
            buffer += '</form>';
            
            buffer += '<hr />';
            
            buffer += '<h2>Especifico para inventario</th>';
        
            buffer += '<form id="datos_inventario">';
            buffer += '<table class="estandar bordes">';
            buffer += '<tr><th>Ingrediente</th><th>Cantidad</th></tr>';
            for (x in datos.aux.ingredientes)
            {
                if (datos.aux.ingredientes[x].disponible === '1') { 
                    buffer += '<tr><td>' + datos.aux.ingredientes[x].nombre + '</td><td><input name="ingrediente_cantidad['+datos.aux.ingredientes[x].ID_ingrediente+']" type="text" value="" /> '+datos.aux.ingredientes[x].unidad+'</td></tr>';
                }
            }
            
            buffer += '</table>';
            buffer += '</form>';
            
            buffer += '<hr />';
        
            buffer += '<button id="guardar_compra">Guardar</button>';
            
            buffer += '<hr />';
            buffer += '<h1>Tabla de conversiones</h1>';
            buffer += '<p>De Libras a Onzas: una libra = 16 onzas. Utilizar Onzas como medida base.</p>';
            $.modal(buffer);
        });
    });
        
    $(document).on('click','#guardar_compra', function(){
        if ($("#empresa").val() === '' || $("#descripcion").val() === '' || $("#precio").val() === '')
        {
            alert('Verifique que los siguientes campos esten llenos: Empresa, Descripcion y Precio. Tip: puede poner precio a 0.00');
            return;
        }
        
        $("#guardar_compra").attr('disabled','disabled');
        
        rsv_solicitar('inventario',{ingreso: true, compra: $("#datos_compra").serialize(), inventario: $("#datos_inventario").serialize()},function(datos){
            alert('Compra y/o ingreso de inventario realizado con exito.');
            $.modal.close();
        });
    });
    
    $('#ver_total').click(function(){
        if ( prompt( 'Ingrese contraseña' ) !== '666' )
        {
            alert ( 'Contraseña incorrecta!' );
            return;
        }
        
        rsv_solicitar('cortez',{fecha: $('#fecha_caja').val()},function(datos){
            var buffer = '';
            buffer += '<p>Total del día: $' + datos.aux.total + ' - <span style="color:#666;">solo cuentas cerradas</span></p>';
            buffer += '<p>Total posible: $' + datos.aux.total_posible + ' - <span style="color:#666;">cuentas cerradas + abiertas</span></p>';
            buffer += '<p>Total pendiente: $' + datos.aux.total_pendiente + ' - <span style="color:#666;">solo cuentas abiertas</span></p>';
            buffer += '<p>Total anulado: $' + datos.aux.total_anulado + ' - <span style="color:#666;">solo cuentas anuladas</span></p>';
            buffer += '<p>Total eliminado: $' + datos.aux.total_cancelado + ' - <span style="color:#666;">solo pedidos eliminados</span></p>';
            buffer += '<p>Total compras: $' + datos.aux.total_compras + ' - <span style="color:#666;">solo dinero gastado de caja en compras</span></p>';
            buffer += '<p style="color:yellow;">Total a cuadrar: $' + datos.aux.total_cuadrar + ' - <span style="color:#666;">solo dinero desde el último corte Z</span></p>';
            buffer += '<p style="color:yellow;">Total compras a cuadrar: $' + datos.aux.total_compras_cuadrar + ' - <span style="color:#666;">solo compras desde el último corte Z</span></p>';
            
            buffer += '<hr /><h1>Corte Z</h1>';
            if (parseFloat(datos.aux.total_pendiente) > 0.00) {
                buffer += '<p style="color:red;">Error: <span style="color:#666;">no puede hacer Corte Z si hay cuentas abiertas</span></p>';
            } else {
                buffer += '<table class="ancha">';
                buffer += '<tr>';
                buffer += '<td>';
                buffer += '<form id="frm_cortez">';
                buffer += '<table>';
                buffer += '<tr><td>Total a cuadrar:</td><td><input id="total_a_cuadrar" name="total_a_cuadrar" type="text" readonly="readonly" value="'+datos.aux.total_cuadrar+'" /></td></tr>';
                buffer += '<tr><td>Total efectivo:</td><td><input id="total_efectivo" name="total_efectivo" type="text" value="" /></td></tr>';
                buffer += '<tr><td>Total POS:</td><td><input id="total_pos" name="total_pos" type="text" value="" /></td></tr>';
                buffer += '<tr><td>Total compras:</td><td><input id="total_compras" name="total_compras" readonly="readonly" type="text" value="'+datos.aux.total_compras_cuadrar+'" /></td></tr>';
                buffer += '<tr><td>Diferencia:</td><td><input id="total_diferencia" name="total_diferencia" readonly="readonly" type="text" value="" /></td></tr>';
                buffer += '<tr><td>En caja:</td><td><input id="total_caja" name="total_caja" type="text" value="0.00" /></td></tr>';
                buffer += '</table>';
                buffer += '</form>';
                buffer += '</td>';
                buffer += '<td style="vertical-align:top;">';
                buffer += '<h1>Compras</h1>';
                buffer += '<div id="contenedor_compras">';
                buffer += '<table class="ancha estandar bordes">';
                buffer += '<tr><th>Empresa</th><th>Descripción</th><th>Precio</th></tr>';
                for(compra in datos.aux.compras)
                {
                    buffer += '<tr><td>'+datos.aux.compras[compra].empresa+'</td><td>'+datos.aux.compras[compra].descripcion+'</td><td>$'+datos.aux.compras[compra].precio+'</td></tr>';
                }
                buffer += '</table>';
                buffer += '</div>';
                buffer += '</td>';
                buffer += '</tr>';
                buffer += '</table>';
                
                buffer += '<button id="cortar">Cortar</button>';
            }
            
            $.modal(buffer);
        });
    });

    $(document).on('change','#total_efectivo',function(){
        cuadrarCorte();
    });
    
    $(document).on('change','#total_pos',function(){
        cuadrarCorte();
    });
    
    $(document).on('click',"#cortar", function(){
        rsv_solicitar('cortez',{ cortar: true, datos: $("#frm_cortez").serialize() },function(datos){
            var ID_corte = parseFloat(datos.aux.ID_corte);
            if (ID_corte > 0)
            {
                alert('Corte Z realizado, ID de corte: ' + ID_corte + "\nPresione ENTER para imprimir.");
                
                var corte = $('<div id="imp_corte"></div>');
                corte.append('<div style="text-align:center;">Corte #'+ID_corte+'</div>');
                corte.append('<div>'+$("#frm_cortez").html()+'</div>');
                corte.append('<h1>Compras</h1>');
                corte.append('<div>'+$("#contenedor_compras").html()+'</div>');
                $.modal.close();
            } else {
                alert('El corte no fue exitoso!, ¿falta de filo? ');
            }
        }); 
    });
    
    $(document).on('click','#pedido_cambiar_precio', function(){
        var id_pedido = $(this).parents('.contenedor_edicion_pedido').attr('rel');
        
        if ($("#pedido_valor_nuevo_precio_razon").val() == "" ) {
            alert("Debe ingresar una razón para hacer el cambio de precio.\nPlantilla: XXX autorizó por YYY\nEj.: Franklin autorizó por descontento del cliente");
            return;
        }
        
        if (!confirm('¿Realmente desea del precio del pedido #'+id_pedido+' a '+ $('#pedido_valor_nuevo_precio').val() +'?'))
            return;
        
        rsv_solicitar('pedido_modificar',{pedido: id_pedido, campo: 'precio_grabado', valor:  $('#pedido_valor_nuevo_precio').val(), nota: $('#pedido_valor_nuevo_precio_razon').val()},function(datos){
            alert('Precio modificado!');
            $.modal.close();
        });        
    });


    $('#historial_cortez').click(function(){
        rsv_solicitar('cortez',{historial: true},function(datos){
            var buffer = '<table class="estandar ancha bordes">';
            buffer += '<tr><th>Fecha</th><th>Total</th><th>Diferencia</th><th>Efectivo</th><th>POS</th><th>Compras</th><th>Caja</th><th>Estado</th></tr>';
            for(y in datos.aux.historial)
            {
                buffer += '<tr>' + '<td>'+ datos.aux.historial[y].fechatiempo + '</td>' + '<td>'+ datos.aux.historial[y].total_a_cuadrar + '</td>' + '<td>'+ datos.aux.historial[y].total_diferencia + '</td>' + '<td>'+ datos.aux.historial[y].total_efectivo + '</td>' + '<td>'+ datos.aux.historial[y].total_pos + '</td>' + '<td>'+ datos.aux.historial[y].total_compras + '</td>' + '<td>'+ datos.aux.historial[y].total_caja + '</td>' + '<td>'+ datos.aux.historial[y].estado + '</td>' + '</tr>' ;
            }
            buffer += '</table>';
            
           $.modal(buffer);
        });
    });
    
    $('#cortes').click(function(){
        window.location = '/CAJA?TPL=cortes';
    });
});
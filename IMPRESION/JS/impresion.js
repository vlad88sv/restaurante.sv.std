function comandas() {
    rsv_solicitar('comanda',{ver: 'pendientes'},function(datos){
        
        if ( typeof datos.aux.comanda === "undefined" )
        {
            return;
        }         

        var impresion = $('<div />').html(datos.aux.comanda.data);
        impresion.jqprint();        
                 
        rsv_solicitar( 'comanda',{impreso: datos.aux.comanda.ID_comanda},function(){} );
        
        $("#ajaxi").prepend('<p>Impresión de comanda. :: ' + new Date() + '</p>');
        
    });
}

setInterval(comandas,1000);

(function($){
    
    var URI = {
        COMBO_ACTIVIDADES: "actions/api-reservas.php?action=getActividades",
        COMBO_PROFESORES: "actions/api-reservas.php?action=getProfesores",
        COMBO_DIAS: "actions/api-reservas.php?action=getDias",
        LISTAR: "actions/api-reservas.php?action=listar",
        FILTRO_ACTIVIDAD: "actions/api-reservas.php?action=filtroPorActividad",
        FILTRO_PROFESOR: "actions/api-reservas.php?action=filtroPorProfesor",
        FILTRO_DIA: "actions/api-reservas.php?action=",
        RESERVAR: "actions/api-reservas.php?action=reserva",
        CONFIRMAR: "actions/api-reservas.php?action=confirmar"
    }
    
    
    $form = $("#form-buscar");
    $calendario = $(".calendarios tbody");
    
    //BUSCA EN FUNCION A LOS FILTROS SELECCIONADOS
    $form.on("submit", function(event){
        event.preventDefault();
        listarBusqueda();
    });
        
    
    //SELECCIONA DEL CALENDARIO UNA ACTIVIDAD PARA RESERVARLA
    $calendario.on("click", ".reserva", function(event){   
        
        var id = $(this).closest("td").find("input[name='id_calendario_profesor_actividad']").val();
        reservar(id);
    });
    
    
    //GUARDA LA RESERVA QUE MUESTRA EL MODAL
    $("#confirmar").on("click", function(event){
        var idCalendario = $("#idCalendario").val();
        confirmarReserva(idCalendario);
    });
    
    
    //intento de manejar combos desde un unico evento:
    /*$form.on("change", ".combo", function(event){
        alert($(this).find);
        var idActividad = $(this).val();
        filtroPorActividad(idActividad);
    });*/
    
    //FILTRO POR ACTIVIDAD
    $form.on("change", "#cboActividad", function(event){
        var idActividad = $(this).val();
        filtroPorActividad(idActividad);
    });
    
    //FILTRO POR PROFESOR
    $form.on("change", "#cboProfesor", function(event){
        var idProfesor = $(this).val();
        filtroPorProfesor(idProfesor);
    });
    
    
    var confirmarReserva = function(id){
        var confirm = $.ajax({
            url: URI.CONFIRMAR,
            method: 'POST',
            data: {idCalendario: id}            
        });
        
        confirm.done(function(res){
            console.log(res);
            
            if(!res.error){
                listarBusqueda();
            }
        });
        
        confirm.fail(function(res){
            console.error(res);
        });
    
    }
    
    
    //MUESTRA UN MODAL PARA CONFIRMAR LA RESERVA: 
    var reservar = function(id){
        var reserva = $.ajax({
            url: URI.RESERVAR,
            method: 'GET',
            data: {id_calendario_profesor_actividad: id},
            dataType: 'json'
        });
        
        reserva.done(function(res){
            console.log(res);
            
            if(!res.error){
                
                $(".confirmar-reserva div.reserva").html("");
                
                var html = 'Actividad: <label>'+res.data.nombre+'</label><br>\
                Profesor: <label>'+res.data.profesor_nombre_apellido+'</label><br>\
                Día: <label>'+res.data.fecha_profesor_actividad+'</label><br>\
                Horario: <label>'+res.data.horario_desde_profesor_actividad+' a '+res.data.horario_hasta_profesor_actividad+'</label>\
                <input type="hidden" id="idCalendario" name="idCalendario" value="'+res.data.id_calendario_profesor_actividad+'">';
                
                $(".confirmar-reserva div.reserva").append(html);
                
            }else{
                console.error("Ocurrio un error.");
            }
        });
        
        reserva.fail(function(res){
            console.error(res);
        });
        
    }
    
    
    var listarBusqueda = function(){
        var listar = $.ajax({
            url: URI.LISTAR,
            method: 'GET',
            data: $form.serialize(),
            dataType: 'json'
        });
        
        listar.done(function(res){
            console.log(res);
                        
            if(!res.error){                
                $(".calendarios tbody").html("");
                
                res.data.forEach(function(dato){
                    var html = '<tr>\
                                    <td>'+dato.nombre+'</td>\
                                    <td>'+dato.profesor_nombre_apellido+'</td>\
                                    <td>'+dato.fecha_profesor_actividad+'</td>\
                                    <td>'+dato.horario_desde_profesor_actividad+' a '+dato.horario_hasta_profesor_actividad+'</td>\
                                    <td>'+dato.cupo+'</td>\
                                    <td>\
                                        <input class="idCalendario" type="hidden" name="id_calendario_profesor_actividad" value="'+dato.id_calendario_profesor_actividad+'">\
                                        <button type="submit" class="btn btn-success reserva" aria-label="Left Align" data-toggle="modal" data-target=".confirmar-reserva"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></button>\
                                    </td>\
                                </tr>';
                    
                    $(".calendarios tbody").append(html);
                });
            }else{
                $(".calendarios tbody").html("");
            }
        });
        
        listar.fail(function(res){
            console.log(res);            
        });
    }
    
    
    var cargarCombos = function(){
        
        //carga Combo de Actividades:
        var listarActividades = $.ajax({
            url: URI.COMBO_ACTIVIDADES,
            method: 'GET',
            dataType: 'json'
        });
        
        listarActividades.done(function(res){
            console.log(res);
            
            if(!res.error){                
                var html = '<option value="0">- Todas -</option>'
                $(".col-actividad select").append(html);
                
                res.data.forEach(function(actividad){
                    var html = '<option value="'+actividad.id_actividad+'">'+actividad.nombre+'</option>';           
                    $(".col-actividad select").append(html);
                    
                });
            }else{
                console.error("Ocurrio un error");
            }
        
        });
        
        
        //carga Combo de Profesores:
        var listarProfesores = $.ajax({
            url: URI.COMBO_PROFESORES,
            method: 'GET',
            dataType: 'json'
        });
        
        listarProfesores.done(function(res){
            console.log(res);
            
            if(!res.error){
                var html = '<option value="0">- Todos -</option>'
                $(".col-profesor select").append(html);
                
                res.data.forEach(function(profesor){
                    var html = '<option value="'+profesor.id_profesor+'">'+profesor.profesor_nombre_apellido+'</option>';
                    $(".col-profesor select").append(html);
                });
            }
        });
        
        
        //carga Combo de Dias:
        var listarDias = $.ajax({
            url: URI.COMBO_DIAS,
            method: 'GET',
            dataType: 'json'
        });
        
        listarDias.done(function(res){
            console.log(res);
            
            if(!res.error){
                var html = '<option value="0">- Todos -</option>'
                $(".col-dia select").append(html);
                
                res.data.forEach(function(dia){
                    var html = '<option value="'+dia.id_dia+'">'+dia.dia_nombre+'</option>';               
                    $(".col-dia select").append(html);                    
                });
            }
        });
        
    }
    
    
    var filtroPorActividad = function(id){
        
        var cargar = $.ajax({
            url: URI.FILTRO_ACTIVIDAD,
            method: 'GET',
            data: {id: id},
            dataType: 'json'
        });

        cargar.done(function(res){
            console.log(res);

            if(!res.error){                    
                $(".col-profesor select").html("");
                var html = '<option value="0">- Todos -</option>';
                $(".col-profesor select").append(html);

                res.data.forEach(function(profesor){
                    var html = '<option value="'+profesor.id_profesor+'">'+profesor.profesor_nombre_apellido+'</option>';

                    $(".col-profesor select").append(html);
                });
            }else{
                console.error("Ocurrio un error");
                alert("No hay profesores asignados a la actividad seleccionada!")
            }
        });

        cargar.fail(function(res){
            console.log(res);
        });
    }
    
    
    var filtroPorProfesor = function(id){
        var cargar = $.ajax({
            url: URI.FILTRO_PROFESOR,
            method: 'GET',
            data: {id: id},
            dataType: 'json'
        });

        cargar.done(function(res){
            console.log(res);

            if(!res.error){                    
                $(".col-actividad select").html("");
                var html = '<option value="0">- Todas -</option>';
                $(".col-actividad select").append(html);

                res.data.forEach(function(actividad){
                    var html = '<option value="'+actividad.id_actividad+'">'+actividad.nombre+'</option>';

                    $(".col-actividad select").append(html);
                });
            }else{
                console.error("Ocurrio un error");
                alert("El profesor seleccionado no dicta la actividad seleccionada!")
            }
        });

        cargar.fail(function(res){
            console.log(res);
        });
    }
        
    
    cargarCombos();
    
    
})(jQuery);
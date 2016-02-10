module.exports = function(app) {

    var router = app.loopback.Router();
    var Cliente = app.models.Cliente;
    var Pedido = app.models.Pedido;
    var TipoServicio = app.models.TipoServicio;
    var Trabajador = app.models.Trabajador;
    var Vehiculo = app.models.Vehiculo;






    router.get('/', function(req, res) {
        res.redirect('login');
    });
    /////////////LOGIN AND SIGN IN//////////////////////////
    router.get('/login', function(req, res) {
        res.render('login');
    });

    router.get('/signin', function(req, res) {
        res.render('signin');
    });
    //////////////HOMEPAGE///////////////////////////////////
    router.get('/homepage', function(req, res) {
        res.render('homepage');
    });

    router.get('/principal', function(req, res) {
        res.render('principal');
    });
    //////////////////////CLIENTE//////////////////////////////
    router.get('/clientePrincipal', function(req, res) {
        Cliente.find({}, function(err, objResult_cliente) {
            if (err) return res.sendStatus(404);
            return res.render('clientePrincipal', {
                objResult_cliente: objResult_cliente
            });
        });
    });

    router.get('/clienteCrear', function(req, res) {
        res.render('clienteCrear');
    });

    router.post('/nuevoCliente', function(req, res) {
        var filtro = req.body.filtro;
        console.log("--->", typeof(filtro));
        console.log("filtro: ", filtro)
        var nombre = req.body.nombreCliente;
        var telefono = req.body.telefonoCliente;
        var direccion = req.body.direccionCliente;

        var nuevoCliente = {
            nombre: nombre,
            telefono: telefono,
            direccion_cliente: direccion
        };

        Cliente.create(nuevoCliente, function(err, objCliente) {
            if (err) return res.sendStatus(404);
            if (filtro == "true") {
                var modo = true;
                var mostrarTitulo = "Nuevo Cliente";
                var mostrarMensaje = "El Cliente " + nuevoCliente.nombre + " fue creado con exito";
                Cliente.find({}, function(err, objResult_cliente) {
                    if (err) return res.sendStatus(404);
                    return res.render('clientePrincipal', {
                        objResult_cliente: objResult_cliente,
                        modo: modo,
                        mostrarMensaje: mostrarMensaje,
                        mostrarTitulo: mostrarTitulo
                    });
                });
            } else {
                return res.render('pedidoCrear', {
                    objCliente: objCliente
                });
            }
        });

    });

    ///////////////////////PEDIDO////////////////////
    router.get('/pedidoPrincipal', function(req, res) {
        Pedido.find({}, function(err, objResult_pedido) {
            if (err) return res.sendStatus(404);
            return res.render('pedidoPrincipal', {
                objResult_pedido: objResult_pedido,
            });
        });
    });

    router.get('/pedidoCrear', function(req, res) {

        res.render('pedidoCrear');

    });

    router.post('/nuevoPedido', function(req, res) {
        //FALTA IMPORTAR EL ID DEL CLIENTE
        //AÑADIR EL INCLUDE AL PEDIDO PARA RENDERIZAR
        //EL CLIENTE EN LA PAGINA PRINCIPAL DEL PEDIDO

        var idCliente = req.body.idCliente;
        console.log("idCliente----->",idCliente);
        var numeroPaquete = req.body.paquetePedido;
        var etapaPedido = req.body.etapaPedido
        var costoPedido = req.body.costoPedido;
        var direccion = req.body.direccionPedido;
        var distrito = req.body.distritoPedido;

        var tipoServicio = req.body.tipoServicio;
        var formaPago = req.body.formaPago;
        var pagaPrimero = req.body.pagaPrimero;

        var tipoVehiculo = req.body.tipoVehiculo;

        var nuevoServicio = {
            tipo_servicio: tipoServicio,
            tipo_pago: formaPago,
            paga_primero: pagaPrimero
        };

        Cliente.findById(idCliente, function(err, objResult_cliente) {
            console.log("****__*****",objResult_cliente);
            TipoServicio.create(nuevoServicio, function(err, objResult_servicio) {
                if (err) return res.sendStatus(404);
                var nuevoPedido = {
                    cantidad_paquete: numeroPaquete,
                    costo_total: costoPedido,
                    etapa_pedido: etapaPedido,
                    direccion: direccion,
                    distrito: distrito,
                    tipoServicioId: objResult_servicio.id,
                    clienteId: objResult_cliente.id
                };
                Pedido.create(nuevoPedido, function(err, result_pedido) {
                    if (err) return res.sendStatus(404);
                    modo = true;
                    var mostrarTitulo = "Nuevo pedido";
                    var mostrarMensaje = "El pedido para el cliente " + objResult_cliente.nombre + " fue creado con exito";
                    Pedido.find({
                        include: ['cliente']
                    }, function(err, objResult_pedido) {
                        if (err) return res.sendStatus(404);
                        objResult_pedido = objResult_pedido.map(function(obj) {
                            return obj.toJSON();
                        });
                        return res.render('pedidoPrincipal', {
                            objResult_pedido: objResult_pedido,
                            modo: modo,
                            mostrarTitulo: mostrarTitulo,
                            mostrarMensaje: mostrarMensaje
                        });
                    });
                });
            });
        });
    });

    //////////////////////ADMINISTRADOR/////////////
    router.get('/administradorPrincipal', function(req, res) {
        res.render('administradorPrincipal');
    });

    router.get('/administradorCrear', function(req, res) {
        res.render('administradorCrear');
    });
    /////////////////////TRABAJADOR/////////////////

    router.get('/trabajadorPrincipal', function(req, res) {
        Trabajador.find({}, function(err, objResult_trab) {
            if (err) return res.sendStatus(404);
            return res.render('trabajadorPrincipal', {
                objResult_trab: objResult_trab
            });
        });
    });

    router.get('/trabajadorCrear', function(req, res) {
        res.render('trabajadorCrear');
    });

    router.post('/nuevoTrabajador', function(req, res) {
        firstName = req.body.firstNameTrabajador;
        lastName = req.body.lastNameTrabajador;
        telefono = req.body.telefonoTrabajador;
        dni = req.body.dniTrabajador;

        var nuevoTrabajador = {
            nombre: firstName,
            apellido: lastName,
            telefono: telefono,
            dni: dni
        };

        Trabajador.create(nuevoTrabajador, function(err, result_trabajador) {
            if (err) return res.sendStatus(404);
            modo = true;
            var mostrarTitulo = "Nuevo Trabajador";
            var mostrarMensaje = "El trabajador " + nuevoTrabajador.nombre + " fue creado con exito";
            Trabajador.find({}, function(err, objResult_trab) {
                if (err) return res.sendStatus(404);
                return res.render('trabajadorPrincipal', {
                    objResult_trab: objResult_trab,
                    modo: modo,
                    mostrarTitulo: mostrarTitulo,
                    mostrarMensaje: mostrarMensaje
                });
            });
        });
    });


    //////////////////////////VEHICULO/////////////////
    router.get('/vehiculoPrincipal', function(req, res) {
        Vehiculo.find({}, function(err, objResult_vehiculo) {
            if (err) return res.sendStatus(404);
            return res.render('vehiculoPrincipal', {
                objResult_vehiculo: objResult_vehiculo
            });
        });
    });

    router.get('/vehiculoCrear', function(req, res) {
        Trabajador.find({}, function(err, objResult_trab) {
            if (err) return res.sendStatus(404);
            return res.render('vehiculoCrear', {
                objResult_trab: objResult_trab
            });
        });
    });

    router.post('/nuevoVehiculo', function(req, res) {
        tipoVehiculo = req.body.tipoVehiculo;
        modeloVehiculo = req.body.modeloVehiculo;
        placa = req.body.placaVehiculo;
        trabajadorId = req.body.trabajadorId;
        var nuevoVehiculo = {
            tipo_vehiculo: tipoVehiculo,
            modelo_vehiculo: modeloVehiculo,
            placa: placa,
            trabajadorId: trabajadorId,
        };

        Vehiculo.create(nuevoVehiculo, function(err, result_vehiculo) {
            if (err) return res.sendStatus(404);
            modo = true;
            var mostrarTitulo = "nuevo Vehiculo";
            var mostrarMensaje = "El vehiculo con placa " + nuevoVehiculo.placa + " fue creado con exito";
            Vehiculo.find({}, function(err, objResult_vehiculo) {
                if (err) return res.sendStatus(404);
                return res.render('vehiculoPrincipal', {
                    objResult_vehiculo: objResult_vehiculo,
                    modo: modo,
                    mostrarTitulo: mostrarTitulo,
                    mostrarMensaje: mostrarMensaje
                });
            });
        });
    });


    app.use(router);
}
var _ = require("lodash");

module.exports = function(app) {

    var router = app.loopback.Router();
    var Usuario = app.models.Usuario;
    var Cliente = app.models.Cliente;
    var Pedido = app.models.Pedido;
    var TipoServicio = app.models.TipoServicio;
    var Trabajador = app.models.Trabajador;
    var Vehiculo = app.models.Vehiculo;
    var Administrador = app.models.Administrador;

    var estado = true;

    var verificar = function(req, res, next) {
        if (estado) {
            next();
        }
    }
    router.use(verificar);




    var nuevoUsuario = {
        correo: "root@root.com",
        password: "root",
        usuario: "root"
    };
    Usuario.create(nuevoUsuario, function(err, objUsuario) {
        if (err) return res.sendStatus(404);
        console.log(objUsuario);
    });

    router.post('/usuarioVerificar', function(req, res) {
        var email = req.body.form_email;
        var contra = req.body.form_password;
        Usuario.find({
            where: {
                correo: email
            }
        }, function(err, result_usuario) {
            if (result_usuario.length == 1) {
                objResult_usuario = result_usuario[0];
                if (objResult_usuario.password == contra) {
                    return res.render('principal');
                }
            } else {
                return res.render('login');
            }
        });
    });



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

    router.get('/clienteBuscar', function(req, res) {
        res.render("clienteBuscar");
    });

    router.post("/buscarCliente", function(req, res) {
        var nombreCliente = req.body.nombreCliente;
        Cliente.find({
            where: {
                nombre: nombreCliente
            }
        }, function(err, result_cliente) {
            if (err) return res.sendsTatus(404);
            var a = result_cliente.length;
            if (a == 0) {
                var modo = false;
                var mostrarTitulo = "Busqueda de Cliente";
                var mostrarMensaje = "El cliente no existe";
                Cliente.find({}, function(err, objResult_cliente) {
                    if (err) return res.sendStatus(404);
                    return res.render('clientePrincipal', {
                        objResult_cliente: objResult_cliente,
                        modo: modo,
                        mostrarMensaje: mostrarMensaje,
                        mostrarTitulo: mostrarTitulo
                    });
                });
            } else if (a == 1) {
                objCliente = result_cliente[0];
                return res.render('pedidoCrear', {
                    objCliente: objCliente,
                });
            } else {
                return res.sendStatus(404);
            }
        });
    });

    router.get('/clienteEditar', function(req, res) {
        var idCliente = req.query.id;
        Cliente.findById(idCliente, function(err, objResult_cliente) {
            if (err) return res.sendStatus(404);
            return res.render('clienteEditar', {
                objResult_cliente: objResult_cliente
            });
        });
    });

    router.post('/editarCliente', function(req, res) {
        var idCliente = req.body.idCliente;
        Cliente.findById(idCliente, function(err, result_cliente) {
            if (err) return res.sendStatus(404);
            var modo = true;
            var mostrarTitulo = "Edicion de Cliente";
            var mostrarMensaje = "El cliente con id " + result_cliente.id + " fue editado exitosamente";
            result_cliente.nombre = req.body.nombreCliente;
            result_cliente.telefono = req.body.telefonoCliente;
            result_cliente.direccion_cliente = req.body.direccionCliente;
            result_cliente.save();
            Cliente.find({}, function(err, objResult_cliente) {
                if (err) return res.sendStatus(404);
                return res.render('clientePrincipal', {
                    objResult_cliente: objResult_cliente,
                    modo: modo,
                    mostrarTitulo: mostrarTitulo,
                    mostrarMensaje: mostrarMensaje
                });
            });
        });
    });

    router.post('/clienteEliminar', function(req, res) {
        var idCliente = req.body.id;

        Cliente.findById(idCliente, function(err, result_cliente) {
            result_cliente.pedidos(function(err, pedidos) {
                var contador = pedidos.length;
                var a = 0;
                _.times(contador, function() {
                    var idPedido = pedidos[a].id;
                    Pedido.findById(idPedido, function(err, pedido_a_destruir) {
                        if (err) return res.sendStatus(404);
                        pedido_a_destruir.tipoServicio(function(err, servicio_a_destruir) {
                            servicio_a_destruir.destroy(function() {
                                console.log("a");
                            });
                        });
                    });
                    a++;
                });

                Pedido.destroyAll({
                    clienteId: idCliente
                }, function(err, info) {
                    if (err) return res.sendStatus(404);
                    Cliente.destroyById(idCliente, function(err) {
                        if (err) return res.sendStatus(404);
                        var modo = true;
                        var mostrarTitulo = "Eliminacion de Cliente";
                        var mostrarMensaje = "Cliente eliminado con exito";
                        Cliente.find({}, function(err, objResult_cliente) {
                            if (err) return res.sendStatus(404);
                            return res.render('clientePrincipal', {
                                objResult_cliente: objResult_cliente,
                                modo: modo,
                                mostrarTitulo: mostrarTitulo,
                                mostrarMensaje: mostrarMensaje
                            });
                        });
                    });
                });
            });
        });
    });

    ///////////////////////PEDIDO////////////////////
    router.get('/pedidoPrincipal', function(req, res) {
        Pedido.find({
            include: ['cliente']
        }, function(err, objResult_pedido) {
            if (err) return res.sendStatus(404);
            objResult_pedido = objResult_pedido.map(function(obj) {
                return obj.toJSON();
            });
            return res.render('pedidoPrincipal', {
                objResult_pedido: objResult_pedido,
            });
        });
    });

    router.get('/pedidoCrear', function(req, res) {

        res.render('pedidoCrear');

    });

    router.post('/nuevoPedido', function(req, res) {

        var idCliente = req.body.idCliente;
        var numeroPaquete = req.body.paquetePedido;
        var etapaPedido = req.body.etapaPedido;
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
            if (err) return res.sendStatus(404);
            TipoServicio.create(nuevoServicio, function(err, objResult_servicio) {
                if (err) return res.sendStatus(404);
                var nuevoPedido = {
                    cantidad_paquete: numeroPaquete,
                    costo_total: costoPedido,
                    etapa_pedido: etapaPedido,
                    direccion: direccion,
                    distrito: distrito,
                    tipo_vehiculo: tipoVehiculo,
                    tipoServicioId: objResult_servicio.id,
                    clienteId: objResult_cliente.id
                };
                Pedido.create(nuevoPedido, function(err, result_pedido) {
                    if (err) return res.sendStatus(404);
                    var modo = true;
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

    router.get('/pedidoEditar', function(req, res) {
        var idPedido = req.query.id;

        Vehiculo.find({}, function(err, objResult_vehiculo) {
            if (err) return res.sendStatus(404);
            objResult_vehiculo = objResult_vehiculo.map(function(obj) {
                return obj.toJSON();
            });
            objResult_vehiculo = JSON.stringify(objResult_vehiculo);
            Pedido.findById(idPedido, {
                include: ['cliente', 'tipoServicio']
            }, function(err, objResult_pedido) {
                if (err) return res.sendStatus(404);
                objResult_pedido = objResult_pedido.toJSON();
                objResult_pedido = JSON.stringify(objResult_pedido);
                return res.render('pedidoEditar', {
                    objResult_pedido: objResult_pedido,
                    objResult_vehiculo: objResult_vehiculo
                });
            });
        });
    });

    router.post('/editarPedido', function(req, res) {
        var idPedido = req.body.idPedido;
        var idServicio = req.body.idServicio;

        TipoServicio.findById(idServicio, function(err, result_servicio) {
            if (err) return res.sendStatus(404);
            result_servicio.tipo_servicio = req.body.tipoServicio;
            result_servicio.tipo_pago = req.body.formaPago;
            result_servicio.paga_primero = req.body.pagaPrimero;
            result_servicio.save();
            Pedido.findById(idPedido, function(err, result_pedido) {
                if (err) return res.sendStatus(404);
                var modo = true;
                var mostrarTitulo = "Edicion de Pedido";
                var mostrarMensaje = "El pedido con id " + result_pedido.id + " fue editado exitosamente";
                result_pedido.cantidad_paquete = req.body.paquetePedido;
                result_pedido.costo_total = req.body.costoPedido;
                result_pedido.etapa_pedido = req.body.etapaPedido;
                result_pedido.direccion = req.body.direccionPedido;
                result_pedido.distrito = req.body.distritoPedido;
                result_pedido.vehiculoId = req.body.idVehiculo
                result_pedido.save();
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

    router.post('/pedidoEliminar', function(req, res) {
        var idPedido = req.body.id;
        Pedido.findById(idPedido, function(err, pedido_a_destruir) {
            if (err) return res.sendStatus(404);
            pedido_a_destruir.tipoServicio(function(err, servicio_a_destruir) {
                servicio_a_destruir.destroy(function() {
                    Pedido.destroyById(idPedido, function(err) {
                        if (err) return res.sendStatus(404);
                        var modo = true;
                        var mostrarTitulo = "Eliminacion de Administrador";
                        var mostrarMensaje = "Administrador eliminado con exito";
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
                                mostrarMensaje: mostrarMensaje,
                                mostrarTitulo: mostrarTitulo
                            });
                        });
                    });
                });
            });
        });
    });

    //////////////////////ADMINISTRADOR/////////////
    router.get('/administradorPrincipal', function(req, res) {
        Administrador.find({}, function(err, objResult_administrador) {
            if (err) return res.sendStatus(404);
            return res.render('administradorPrincipal', {
                objResult_administrador: objResult_administrador
            });
        });
    });

    router.get('/administradorCrear', function(req, res) {
        res.render('administradorCrear');
    });

    router.post('/nuevoAdministrador', function(req, res) {
        var nombre = req.body.nombreAdministrador;
        var telefono = req.body.telefonoAdministrador;
        var nuevoAdministrador = {
            nombre: nombre,
            telefono: telefono
        };
        Administrador.create(nuevoAdministrador, function(err, result_administrador) {
            if (err) return res.sendStatus(404);
            var modo = true;
            var mostrarTitulo = "Nuevo Administrador";
            var mostrarMensaje = "Administrador creado con exito";
            Administrador.find({}, function(err, objResult_administrador) {
                if (err) return res.sendStatus(404);
                return res.render('administradorPrincipal', {
                    objResult_administrador: objResult_administrador,
                    modo: modo,
                    mostrarTitulo: mostrarTitulo,
                    mostrarMensaje: mostrarMensaje
                });
            });
        });
    });

    router.get('/administradorEditar', function(req, res) {
        var idAdministrador = req.query.id;
        Administrador.findById(idAdministrador, function(err, objResult_administrador) {
            if (err) return res.sendStatus(404);
            return res.render('administradorEditar', {
                objResult_administrador: objResult_administrador
            });
        });
    });

    router.post('/editarAdministrador', function(req, res) {
        var idAdministrador = req.body.idAdministrador;
        Administrador.findById(idAdministrador, function(err, result_administrador) {
            if (err) return res.sendStatus(404);
            var modo = true;
            var mostrarTitulo = "Edicion de Administrador";
            var mostrarMensaje = "El administrador con id " + result_administrador.id + "fue editado exitosamente";
            result_administrador.nombre = req.body.nombreAdministrador;
            result_administrador.telefono = req.body.telefonoAdministrador;
            result_administrador.save();
            Administrador.find({}, function(err, objResult_administrador) {
                if (err) return res.sendStatus(404);
                return res.render('administradorPrincipal', {
                    objResult_administrador: objResult_administrador,
                    modo: modo,
                    mostrarTitulo: mostrarTitulo,
                    mostrarMensaje: mostrarMensaje
                });
            });
        });
    });

    router.post('/administradorEliminar', function(req, res) {
        var idAdministrador = req.body.id;
        Administrador.destroyById(idAdministrador, function(err) {
            if (err) return res.sendStatus(404);
            var modo = true;
            var mostrarTitulo = "Eliminacion de Administrador";
            var mostrarMensaje = "Administrador eliminado con exito";
            Administrador.find({}, function(err, objResult_administrador) {
                if (err) return res.sendStatus(404);
                return res.render('administradorPrincipal', {
                    objResult_administrador: objResult_administrador,
                    modo: modo,
                    mostrarTitulo: mostrarTitulo,
                    mostrarMensaje: mostrarMensaje
                });
            });
        });
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
        var firstName = req.body.firstNameTrabajador;
        var lastName = req.body.lastNameTrabajador;
        var telefono = req.body.telefonoTrabajador;
        var dni = req.body.dniTrabajador;

        var nuevoTrabajador = {
            nombre: firstName,
            apellido: lastName,
            telefono: telefono,
            dni: dni
        };

        Trabajador.create(nuevoTrabajador, function(err, result_trabajador) {
            if (err) return res.sendStatus(404);
            var modo = true;
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

    router.get('/trabajadorEditar', function(req, res) {
        var idTrabajador = req.query.id;
        Trabajador.findById(idTrabajador, function(err, objResult_trab) {
            if (err) return res.sendStatus(404);
            return res.render('trabajadorEditar', {
                objResult_trab: objResult_trab
            });
        });
    });

    router.post('/editarTrabajador', function(req, res) {
        var idTrabajador = req.body.idTrabajador;
        Trabajador.findById(idTrabajador, function(err, result_trabajador) {
            if (err) return res.sendStatus(404);
            var modo = true;
            var mostrarTitulo = "Edicion de trabajador";
            var mostrarMensaje = "El trabajador con id " + result_trabajador.id + " fue editado exitosamente";
            result_trabajador.nombre = req.body.firstNameTrabajador;
            result_trabajador.apellido = req.body.lastNameTrabajador;
            result_trabajador.telefono = req.body.telefonoTrabajador;
            result_trabajador.dni = req.body.dniTrabajador;
            result_trabajador.save();
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

    router.post('/trabajadorEliminar', function(req, res) {
        var idTrabajador = req.body.id;
        Trabajador.destroyById(idTrabajador, function(err) {
            if (err) return res.sendStatus(404);
            var modo = true;
            var mostrarTitulo = "Eliminacion de Trabajador";
            var mostrarMensaje = "Trabajador eliminado con exito";
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
        var tipoVehiculo = req.body.tipoVehiculo;
        var modeloVehiculo = req.body.modeloVehiculo;
        var placa = req.body.placaVehiculo;
        var trabajadorId = req.body.trabajadorId;
        var nuevoVehiculo = {
            tipo_vehiculo: tipoVehiculo,
            modelo_vehiculo: modeloVehiculo,
            placa: placa,
            trabajadorId: trabajadorId,
        };

        Vehiculo.create(nuevoVehiculo, function(err, result_vehiculo) {
            if (err) return res.sendStatus(404);
            var modo = true;
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

    router.get('/vehiculoEditar', function(req, res) {
        var idVehiculo = req.query.id;

        Trabajador.find({}, function(err, objResult_trab) {
            if (err) return res.sendStatus(404);
            Vehiculo.findById(idVehiculo, function(err, objResult_vehiculo) {
                var tipoVehiculo = _.toString(objResult_vehiculo.tipo_vehiculo);
                var idTrabajador = _.toString(objResult_vehiculo.trabajadorId);
                tipoVehiculo = JSON.stringify(tipoVehiculo);
                idTrabajador = JSON.stringify(idTrabajador);
                if (err) return res.sendStatus(404);
                return res.render('vehiculoEditar', {
                    objResult_vehiculo: objResult_vehiculo,
                    objResult_trab: objResult_trab,
                    tipoVehiculo: tipoVehiculo,
                    idTrabajador: idTrabajador
                });
            });
        });
    });

    router.post('/editarVehiculo', function(req, res) {
        var idVehiculo = req.body.idVehiculo;
        Vehiculo.findById(idVehiculo, function(err, result_vehiculo) {
            if (err) return res.sendStatus(404);
            var modo = true;
            var mostrarTitulo = "Edicion de Vehiculo";
            var mostrarMensaje = "El vehiculo con id " + result_vehiculo.id + " fue editado exitosamente";
            result_vehiculo.tipo_vehiculo = req.body.tipoVehiculo;
            result_vehiculo.modelo_vehiculo = req.body.modeloVehiculo;
            result_vehiculo.placa = req.body.placaVehiculo;
            result_vehiculo.trabajadorId = req.body.trabajadorId;
            result_vehiculo.save();
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

    router.post('/vehiculoEliminar', function(req, res) {
        var idVehiculo = req.body.id;
        Vehiculo.destroyById(idVehiculo, function(err) {
            if (err) return res.sendStatus(404);
            var modo = true;
            var mostrarTitulo = "Eliminacion de Administrador";
            var mostrarMensaje = "Administrador eliminado con exito";
            Vehiculo.find({}, function(err, objResult_vehiculo) {
                if (err) return res.sendStatus;
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
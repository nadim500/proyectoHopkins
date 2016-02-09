module.exports = function(app) {

    var router = app.loopback.Router();
    var Cliente = app.models.Cliente;
    var Distrito = app.models.Distrito;
    var Pedido = app.models.Pedido;
    var TipoServicio = app.models.TipoServicio;
    var Trabajador = app.models.Trabajador;
    var Vehiculo = app.models.Vehiculo;

    router.get('/', function(req, res) {
        res.send("Hola mundo");
    });

    router.get('/', function(req, res) {
        res.redirect('login');
    });

    router.get('/login', function(req, res) {
        res.render('login');
    });

    router.get('/homepage', function(req, res) {
        res.render('homepage');
    });

    router.get('/login', function(req, res) {
        res.render('login');
    });

    router.get('/principal', function(req, res) {
        res.render('principal');
    });

    router.get('/clientePrincipal', function(req, res) {
        res.render('clientePrincipal');
    })

    router.get('/clienteCrear', function(req, res) {
        res.render('clienteCrear');
    });

    router.get('/pedidoCrear', function(req, res) {
        res.render('pedidoCrear');
    });

    router.get('/signin', function(req, res) {
        res.render('signin');
    });



    app.use(router);
}
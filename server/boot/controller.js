

module.exports = function(app){

	var router = app.loopback.Router();
	var Cliente = app.models.Cliente;
	var Distrito = app.models.Distrito;
	var Pedido = app.models.Pedido;
	var TipoServicio = app.models.TipoServicio;
	var Trabajador = app.models.Trabajador;
	var Vehiculo = app.models.Vehiculo;

	router.get('/',function(req,res){
		res.send("Hola mundo");
	})



	app.use(router);
}
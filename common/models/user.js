var config = require('../../server/config.json');
var path = require('path');
module.exports = function(user) {

  user.afterRemote('create', function(context, user, next) {
    console.log("Se activa el afterRemote: ", user );
    var options = {
      type: 'email',
      to: user.email,
      from: 'noreply@loopback.com',
      subject: 'Gracias por registrarse',
      template: path.resolve(__dirname, '../../client/jade/emailEnviado.html'),
      redirect: '/emailConfirmado',
      user: user
    };

    user.verify(options, function(err, response) {
      if (err) return next(err);
      var modo = true;
      var mostrarTitulo = "Registro con exito";
      var mostrarMensaje = "Revise su email para poder verificarlo antes de ingresar a la web ";
      var link = '/login'
      context.res.render('signin',{
        modo : modo,
        mostrarMensaje : mostrarMensaje,
        mostrarTitulo : mostrarTitulo,
        link : link
      });
    });
  });

  user.on('resetPasswordRequest',function(info){
    var url = 'http://'+config.host+':'+config.port+'/contraseniaCambiar';
    var html = 'Click <a href="'+url+'?access_token='+info.accessToken.id+'">Aqui</a> para resetear tu password' ;
    console.log("html: ",html)
    user.app.models.Email.send({
      to : info.email,
      from : info.email,
      subject : 'Resetear Password',
      html : html
    },function(err){
      if(err) return console.log("Error en enviar email para cambiar contrasenia");
      console.log("Email enviado");
    });
  });
};
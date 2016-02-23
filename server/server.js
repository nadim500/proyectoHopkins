var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var path = require('path');
var app = module.exports = loopback();

// Passport configurators..
var passport = require('passport');
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);
var flash = require('express-flash');

// attempt to build the providers/passport config
var config = {};
try {
    config = require('../providers.json');
} catch (err) {
    console.trace(err);
    process.exit(1); // fatal
}



app.set('json spaces', 2);
app.set('views', path.resolve(__dirname, '../client/jade'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));



app.use(loopback.token());

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
    if (err) throw err;


});

// The access token is only available after boot
app.middleware('auth', loopback.token({
    model: app.models.accessToken
}));


app.middleware('session:before', loopback.cookieParser(app.get('cookieSecret')));
app.middleware('session', loopback.session({
    secret: 'kitty',
    saveUninitialized: true,
    resave: true
}));


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});



passportConfigurator.init();

app.use(flash());

passportConfigurator.setupModels({
    userModel: app.models.Usuario,
    userIdentityModel: app.models.userIdentity,
    userCredentialModel: app.models.userCredential
});



for (var s in config) {
    var c = config[s];
    c.session = c.session !== false;
    passportConfigurator.configureProvider(s, c);
}



// -- Mount static files here--
// All static middleware should be registered at the end, as all requests
// passing the static middleware are hitting the file system
// Example:
//   app.use(loopback.static(path.resolve(__dirname', '../client')));
app.use(loopback.static(path.resolve(__dirname, '../client')));




app.start = function() {
    // start the web server
    return app.listen(function() {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};

// start the server if `$ node server.js`
if (require.main === module) {
    app.start();
}
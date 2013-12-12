
/*
 * Login and Register
 */

var User = require('../dao/User');

var SQLselectN  = "select * from webgame.User WHERE name = ?";
var SQLselectNP = "select * from webgame.User WHERE name = ? AND password = ?";
var SQLinsert   = "insert into webgame.User (email, name, password, icon_url) VALUES(?, ?, ?, ?)";

function login(req, res, next) {
  //console.log(req.body);

  var submit;
  if( req.body.submit ) {
    submit = req.body.submit;
  }

  if( submit === "Login" ) {
    _login(req, res, next);
  }
  else if( submit === "Register" ) {
    _register(req, res, next);
  }
  else {
    console.log("Submit value error!");
  }
  
};

function _register(req, res, next) {
  //console.log("Register!");

  var mail = undefined;
  var name = undefined;
  var pass = undefined;

  if( req.body.mail ) {
    mail = req.body.mail;
  }
  if( req.body.name ) {
    name = req.body.name;
  }
  if( req.body.pass ) {
    pass = req.body.pass;
  }
  if( typeof mail === "undefined" ||
      typeof name === "undefined" ||
      typeof pass === "undefined" ) {
     console.log( "input values are invalid." );
     console.log( req.body );
     res.render('index', { username: '',
                           status: 'not logined', 
                           login_message: '', 
                           register_message: 'fill up all information !' });
     return;
   }
  
  // DB connection
  req.dbconn.getConnection( function( err, connection ) {
    connection.query( SQLselectN, [name], function( err, results ) {
      if( results.length != 0 ) {
        console.log( "query result: " + results );
        res.render('index', {  username: '',
                               status: 'not logined', 
                               login_message: '', 
                               register_message: 'Username is already used...' });
        connection.release();
        return;
      } else {
        connection.query( SQLinsert, [mail, name, pass, ''], function( err, results ) {
          connection.query( SQLselectN, [name], function( err, results ) {
            _set_userInfo_to_session(req.session, results[0]);
            connection.release();
            res.render('index', {  username: req.session.user.name,
                                   status: 'logined', 
                                   login_message: '', 
                                   register_message: 'register success!!' });
          } );
        } );
      }
    } );
  } );
};

function _login(req, res, next) {
  //console.log("Login!");

  var name;
  var pass;

  if( req.body.name ) {
    name = req.body.name;
  }
  if( req.body.pass ) {
    pass = req.body.pass;
  }

  // DB connection
  req.dbconn.getConnection( function( err, connection ) {
    connection.query( SQLselectNP, [name, pass], function( err, results ) {
      if( results === null || results === undefined || results.length === 0 ) {
        console.log( 'login error!' );
        res.render('index', {  username: '',
                               status: 'not logined', 
                               login_message: 'Login error... Username or Password is incorrect.', 
                               register_message: '' });
      }
      else {
        _set_userInfo_to_session(req.session, results[0]);
        console.log( 'login success!' );
        res.render('index', {  username: req.session.user.name,
                               status: 'logined', 
                               login_message: 'Login success!!', 
                               register_message: '' });
      }
      connection.release();
    } );
  } );
};

function _logout(req, res, next) {
  console.log(req.query);

  var submit;
  if( req.query.submit ) {
    submit = req.query.submit;
  }
  
  if( submit === "Logout" ) {
    console.log(req.session);
    req.session.destroy();
    res.render('index', {  username: '',
                           status: 'not logined', 
                           login_message: '', 
                           register_message: '' });
  }
};

function _set_userInfo_to_session(session, user_data) {
  if( session || user_data ) {
    var user = User.create();
    user.id   = user_data.id;
    user.name = user_data.name;
    session.user = user;
  }
};

module.exports = {
  login: function(req, res, next){
    login(req, res, next);
  },
  logout: function(req, res, next){
    _logout(req, res, next);
  }
};



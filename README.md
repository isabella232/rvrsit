![No longer maintained](https://img.shields.io/badge/Maintenance-OFF-red.svg)
### [DEPRECATED] This repository is no longer maintained
> While this project is fully functional, the dependencies are no longer up to date. You are still welcome to explore, learn, and use the code provided here.
>
> Modus is dedicated to supporting the community with innovative ideas, best-practice patterns, and inspiring open source solutions. Check out the latest [Modus Labs](https://labs.moduscreate.com?utm_source=github&utm_medium=readme&utm_campaign=deprecated) projects.

[![Modus Labs](https://res.cloudinary.com/modus-labs/image/upload/h_80/v1531492623/labs/logo-black.png)](https://labs.moduscreate.com?utm_source=github&utm_medium=readme&utm_campaign=deprecated)

---

From this directory:
httpd-silkjs ./othello.js

The server serves from docroot/ directory.  This contains the sencha-touch application and dependent frameworks
(impactjs, touch) and images and sounds, etc.

othello.js defines some SilkJS HTTP server configuration options.  Of note is the MySQL information.  On my machine,
user mschwartz has access to MySQL with no password.  I'd never do that in production!  You'll need to create a
user/password in MySQL, and the othello database.  From the command line:
    $ /usr/local/mysql/bin/mysql
    mysql> grant all on *.* to some_user identified by 'some_password' with grant option;
    ^D
    $ /usr/local/mysql/bin/mysqladmin create othello

Make sure you edit othello.js to set up some_user/some_password as the MySQL credentials.

The othello.js program includes rpc_action.js, which is the server backend for processing RPC requests.  The client
side for RPC is implemented in docroot/public/Othello/rpc.js.  It's tiny.

I only had to make a few modifications to get it working under SilkJS.

1) Changed references from node/public/whatever to /public/whatever (we can ultimately get rid of public/ altogether,
   since it's the equivalent of docroot)
2) Commented out one line that stopped the dev tools debugger (line 41 of app/controller/Messaging.js)
3) Replaced calls to socket.emit() in app/controller/Login.js to rpc() calls

The othello.js file defines two schemas using SilkJS' ORM: Users and UserSesssions.

Users is a table where user registrations are stored.  When a user attempts to log in, his credentials are looked
up in this table.

UserSessions is a MEMORY table that associates a cookie to a User who has logged in.

The othello.js file installs a requestHandler() function in the HttpChild object (this is before fork is done).
The requestHandler() method sets res.data.user to a logged in user, based upon a cookie being set.  In theory, this
function could never return (e.g. call res.stop()) if it served content, but since it does return, the normal
SilkJS HTTP processing takes place.

During normal processing, if a URL's first part (e.g URI = /first part/second part/...) has an "action" method,
that action method is called.  In the othello app, rpc_action.js is included, and it provides an rpc_action() function.
This function is called whenever the browser requests /rpc (/rpc/whatever?whatever_else and so on).

All post data and cookies are seen by the server application in req.data.  So if you post 'user' and 'password'
variables, the server logic sees them as req.data.user and req.data.password.

The rpc_action() handler expects an req.data.method post variable to contain the name of a function in the rpcMethods
object.  This is a simplistic way of wiring client RPC (Ajax) to server-side methods.  I have more structured/robust
methodolgies for more complex server-side applications that consist of hundreds of rpc methods.

The registerUser rpc method is fairly simple.  It calls a Schema (ORM) method newRecord() to initialize a Users record
(object) with default values.  The req.data variables are then stored into this new record.  Then server-side validation
of the post values is done.  If there are any errors in the form data, Json.failure() is called with the error message.
If the form values are valid, Schema.putOne() is called to store the record in the database, creating the User record.
The Schema.clean() method is called to strip out sensitive fields that should not be sent over the wire.  The
Json.success() method sends the response and ends the request.

Failure response always looks like this:
    {
        success: false,
        message: 'reason the rpc method failed.'
    }

Success response generally looks like this:
    {
        success: true,
        rpc_return_value: some_value,
        rpc_return_value: some_value,
        ...
    }
The rpc_return_value fields may be simple JavaScript types (int, bool, string) and/or complex objects and/or arrays.

So if you call:
    Json.success({ foo: 'bar', baz: [] });
The result will be:
    {
        success: true,
        foo: 'bar',
        baz: []
    }

The ORM is implemented as "call by example."  Basically, the Schema class functions take a Schema "name" (e.g. Users,
or UserSessions) and an example.  An example is a partial or complete record used to dynamically generate queries for
the database.  The record is a JavaScript object; its fields are the column names for the table (Users, UserSessions)
in the database.  It is difficult to explain examples without using some examples!

    Schema.findOne('Users', { userId: 1 });

Returns ONE record (first one found) from the Users table where userId=1

    Schema.findOne('Users', { email: 'mykesx@gmail.com' });

Returns ONE record (first one found) from the Users table where email='mykesx@gmail.com'

    Schema.find('Users', { email: 'mykesx@gmail.com' });

Returns an ARRAY of records from the Users table where email='mykesx@gmail.com'

    Schema.putOne('Users', { email: 'mykesx@gmail.com' });

Creates a record in the database with userId (autoincrement) automatically assigned, empty strings for the string
fields in the table, 0 for integer fields in the table.

    var record = Schema.newRecord('Users');

Returns a record that looks like this:
    {
        userId: 0,
        name: '',
        email: '',
        gameName: '',
        password: ''
    }

To change my password:
    var user = Schema.findOne('Users', { email: 'mykesx@gmail.com' });
    user.password = 'new password';
    Schema.putOne('Users', user);

(It's handy that findOne() returns a record that is also an example!)

Even though the ORM is very good at what it does, there's nothing wrong with doing direct queries.  An example is in
othello.js the requestHandler() function updates the lastAccess field in the UserSessions table.

The examples processed by the Schema (ORM) may contain arrays:

    var users = Schema.find('Users', { email: [ 'mykesx@gmail.com', 'jay@moduscreate.com' ] });

returns all Users with either email address.  The "where" clause of the query is
    "where email in ('mykesx@gmail.com','jay@moduscreate.com')

The ORM quotes all field values.  For example,
    var users = Schema.find('Users', { userId: [1,2,3] });
The "where" clause of the query is:
    "where userId in ('1','2','3')"
The benefit of this is to block SQL injection.

An example field may also be a string containing '%' characters as "LIKE" wildcards.
    var users = Schema.find('Users', { email: '%@gmail.com' });
returns an array of all Users who have gmail.com email addresses.

In rpc_action.js, the rpcMethods object is defined outside the rpc_action() function.  This is so they are compiled
once at startup and not each time rpc_action() is called.

On the client side, the docroot/public/Othello/rpc.js file contains a single function, rpc().  The function takes
two arguments: methodName and config.  The methodName parameter is a string index into the rpcMethods object on the
server side, and must be identical (e.g. case sensitive).  The config parameter is optional, and if provided, its
members are optional.  The members may be:
    params: { hash of post variables }
    handler: function(o)
You must JSON encode the individual members of params if they are objects or arrays.  The optional handler() function
is passed the object sent by Json.success() or Json.failure() on the server side.  The object is already JSON decoded.

In app/controller/Login.js:

//        Othello.socket.emit('auth', values, this.onUserAuthenticated, this);
		rpc('auth', {
			params: values, // (email: whatever, password: whatever)
			handler: function(o) {
				me.onUserAuthenticated(o);
			}
		});

In rpc_action.js:

	auth: function() {
		var user = Schema.findOne('Users', {
			email: req.data.email,
			password: req.data.password
		});
		if (user) {
			var now = Util.currentTime();
			var cookie = Util.md5(user.email + user.password + Util.currentTimeMillis());
			res.setCookie('othello_login', cookie);
			Schema.putOne('UserSessions', {
				userId: user.userId,
				cookie: cookie,
				loginTime: now,
				lastActivity: now
			});
			Json.success({
				user: Schema.clean('Users', user)   // removes the password field so it's not sent over the wire.
			});
		}
		else {
			Json.failure('Either the email address or password you entered are not found in the database');
		}
	},

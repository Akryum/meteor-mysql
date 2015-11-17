```js
/// <reference path="definitions/all-definitions.d.ts" />
declare var Deps;
declare var Users: Mysql.Collection<any> | Mongo.Collection<any>;

if (Meteor.isClient) {

  Users = new Mongo.Collection<any>("usersCollection");

  Meteor.subscribe("allUsers");

  Template["usersList"].helpers({
    users: function() {
      return Users.find().fetch().reverse();
    }
    ,
    length: function() {
      return Users.find().count();
    }
  });

  /* The whole Code/collection is synchronized between server-client and database. No need work to do by your own, node-mysql-wrapper does the most of your work!*/
  Template["usersList"].events({
    'submit .new-user': (event) => {
      event.preventDefault();
      var data = event.target;

      var username = data.username.value;
      var mail = data.mail.value;
      var pass = data.pass.value;

      Meteor.call("createUser", username, mail, pass);
      //clean up text fields
      data.username.value = '';
      data.mail.value = '';
      data.pass.value = '';

    },
    'submit .update-user': (event) => {
      event.preventDefault();

      var data = event.target;
      var userid = data.userid.value;
      var username = data.username.value;
      var mail = data.mail.value;
      var pass = data.pass.value;

      Meteor.call("updateUser", userid, username, mail, pass);

    },
    'submit .remove-user': (event) => {
      event.preventDefault();

      Meteor.call("removeUser", event.target.userid.value);
      //clean up text field
      event.target.userid.value = '';
    }
  });

}


if (Meteor.isServer) {


  var db: Mysql.MeteorDatabase = Mysql.connect("mysql://kataras:pass@127.0.0.1/taglub?debug=false&charset=utf8");
  console.log('MySQL is Up and Running!');
  //var usersTable = db.table("users");
  var criteria = db.criteriaFor("users").limit(10).except("password").build();
  Users = db.meteorCollection<any>("users", "usersCollection", criteria); //or just storiesTable.meteorCollection("storiesCollection");

  console.log(Users.find().count() + " rows found! ");
  Meteor.publish("allUsers", function() {
    //or you can ajust here the except 'password' column from select query..find({}, { fields: { password: 0 } });
    return Users.find();
  });


  Meteor.methods({
    'createUser': (username, mail, pass) => {
      Users.insert({ username: username, mail: mail, password: pass });
      // usersTable.insert({ username: username, mail: mail, password: pass });

    },
    'updateUser': (userid, username, mail, pass) => {
      var obj: any = {};
      obj.userId = parseInt(userid);

      if (username && username !== '') {
        obj.username = username;
      }
      if (pass && pass !== '') {
        obj.password = pass;
      }
      if (mail && mail !== '') {
        obj.mail = mail;
      }

      // usersTable.update(obj);
      Users.update(obj);

    },
    'removeUser': (userid) => {
      // usersTable.remove(userid);
      Users.remove(userid);
    }
  });


  //close the mysql connection when closing the shell
  /* process.on("SIGHUP", () => {
     db.end((err) => {
       if (err) {
         console.dir(err);
         setTimeout(() => {
           process.exit();
         }, 8000);
       } else {
         process.exit();
       }

     });
   });*/

}

```


```html

<head>
  <title>METEOR-MYSQL TEST</title>
</head>

<body>
  <h1>Welcome to METEOR-MYSQL!</h1>

  <h2>USERS:</h2> {{>usersList}}
</body>

<template name="usersList">
  <p>Length: {{length}}</p>
  <ul>
    {{#each users}}
    <li>UserID: {{userId}}. Username: {{username}}</li>
    {{/each}}
  </ul>

  <p> Create A user </p>
  <form class="new-user">
    <input type="text" name="username" placeholder="Username" />
    <input type="password" name="pass" />
    <input type="email" name="mail" placeholder="Mail" />
    <input type="submit" value="CREATE" />
  </form>

  <p> Update A user, You can also use <b>usersTable.save(obj)</b> for insert or update(if primary key is provided as property
    inside the passing object.) </p>
  <form class="update-user">
    <input type="text" name="userid" placeholder="userId you want to update" />
    <input type="text" name="username" placeholder="Username" />
    <input type="password" name="pass" />
    <input type="email" name="mail" placeholder="Mail" />
    <input type="submit" value="UPDATE" />
  </form>

  <p> Delete/Remove A user (by id, although you can with other columns too, but example must be simple :D )  </p>
  <form class="remove-user">
    <input type="text" name="userid" placeholder="userId you want to remove " />
    <input type="submit" value="DELETE" />
  </form>

</template>


```

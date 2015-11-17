/// <reference path="definitions/all-definitions.d.ts" />
declare var ReactiveMethod; //simple:reactive-method
declare var Users, Comments: Mysql.Collection<any> | Mongo.Collection<any>;



/*Meteor.methods({
  getStoryComments: function(storyId) {
    return Comments.find({ storyId: storyId }).fetch();
  }

});*/
if (Meteor.isClient) {

  Users = new Mongo.Collection<any>("usersCollection");
  Comments = new Mongo.Collection<any>("commentsCollection");

  Meteor.subscribe("allUsers", function() {

    var storiesIDs = [];
    //find stories ids
    Users.find().fetch().forEach(_user=> {
      _user.myStories.forEach(_story=> {
        storiesIDs.push(_story.storyId);
      });
    });
    Meteor.subscribe("storiesComments", storiesIDs);

  });




  /*
    Template["usersList"].onRendered(function(){
  	var self = this;
	Template["usersList"]["usersList"] = new ReactiveVar([]);
	var subs  = Meteor.subscribe("allUsers");

    this.autorun(function() {
    if(!self.subscriptionsReady())
      return;
    	Template["usersList"]["usersList"].set(Users.find().fetch().reverse());
  });
  });*/


  Template["usersList"].onCreated(function() {


  });

  Template["usersList"].helpers({
    users: function() {
      /*Tracker.autorun(function() {
        Meteor.subscribe("allUsers");

      });
*/
      return Users.find().fetch().reverse();
    },

    takeStoryComments: function(storyId) {

      /*THIS IS NOT REACTIVE COLLECTION.  var _comments = new ReactiveVar<any>([]);
        Meteor.call('getStoryComments',storyId, function(err, data) {
          if(err){
            console.log('errr: '+err);
          }
          console.log(data);
          _comments.set(data);
        });
        return _comments.get();*/
      //return ReactiveMethod.call('getStoryComments',storyId);
      return Comments.find({ storyId: storyId }).fetch();

    },
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
      var yearsOld = data.yearsOld.value;

      Meteor.call("createUser", username, mail, pass, yearsOld);
      //clean up text fields
      data.username.value = '';
      data.mail.value = '';
      data.pass.value = '';
      data.yearsOld.value = '';

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
  var criteria = db.criteriaFor("users")
    .where("yearsOld").gt(18)
    .limit(10)
    .except("password")
    .joinAs("myStories", "stories", "authorId", "userId")
   // .at("myStories").joinAs("storiesComments", "comments", "storyId", "storyId")
    .build();
  Users = db.meteorCollection<any>("users", "usersCollection", criteria);
  console.log(Users.find().count() + " rows found! ");
  var storiesIDs = [];// Users.find().fetch().map(st=> st.myStories.map(_story=> _story.storyId);



  /*//GET ONLY THE COMMENTS OF THE VISIBLE STORIES FROM DATABASE.
 var storiesCommentsCriteria = db.criteriaFor("comments").where("storyId").in(storiesIDs).build();
 Comments = db.meteorCollection<any>("comments", "commentsCollection", storiesCommentsCriteria);
 */

  //GET all comments
  Comments = db.meteorCollection("comments", "commentsCollection");

  Meteor.publish("allUsers", function() {
    //or you can ajust here the except 'password' column from select query..find({}, { fields: { password: 0 } });
    return Users.find();
  });


  Meteor.publish("storiesComments", function(storyIds: any[]) {
    return Comments.find({ storyId: { $in: storyIds } });
  });


  Meteor.methods({
    'createUser': (username, mail, pass, yearsOld) => {
      Users.insert({ username: username, mail: mail, password: pass, yearsOld: yearsOld });
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

//reqiure NPM modeuls
var crypto = require("crypto-js");
var mysql = require("mysql");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var Port = process.env.PORT || 1000;

//global variabels
var userID = '';
var name_table = '';
var email_table = '';
var item_id = '';
var primaryKey = "asdef132";

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + "/asets"));

//connecting mysql via NODE.js
var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: "mydb"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("connection created");
});



app.get("/", function(req, res) {
  //count total number of user
  con.query("SELECT COUNT(*) AS coun FROM users", function(err, result) {
    if (err) throw err;
    var count = result[0].coun;

    //selecting list item 
    con.query("SELECT email FROM users ORDER BY created_at DESC LIMIT 5", function(err, result) {
      if (err) throw err;

      var li = result;

      //selecting pin table
      con.query("SELECT * FROM pin", function(err, result) {
        if (err) throw err;
        var g_info = result;


        res.render("home", {
          data: count,
          name: li,
          //including image
          i_url1: g_info[0].image,
          i_url2: g_info[1].image,
          i_url3: g_info[2].image,
          //including gameName
          g_name1: g_info[0].gameName,
          g_name2: g_info[1].gameName,
          g_name3: g_info[2].gameName,
          //including discription
          g_dis1: g_info[0].description,
          g_dis2: g_info[1].description,
          g_dis3: g_info[2].description
        });


      });
    });
  });
});


app.get("/todo_list_s", function(req, res) {
  res.render("todo", {
    item_loop: item_id
  })
})

//log in page
app.get("/loged", function(req, res) {

  res.render("loged", {
    userName: name_table,
    email: email_table,

  })
})

app.get("/delete", function(req, res) {

  res.render("pass")
})



//enter new email id to user
app.post("/register", function(req, res) {
  var person = {
    email: req.body.email
  };
  con.query("INSERT INTO users SET?", person, function(err, result) {
    if (err) throw err;

    res.redirect("/");
  });

});


//singing up to singin table
app.post("/singin", function(req, res) {
  //encrypt the password
  var pass = req.body.password;
  var encriptedPassword = crypto.AES.encrypt(pass, primaryKey);

  var person = {
    name: req.body.name,
    email: req.body.Sing_email,
    password: encriptedPassword
  };
  con.query("INSERT INTO singin SET?", person, function(err, result) {
    if (err) throw err;

    res.redirect("/");
  });

});



//login to 
app.post("/login", function(req, res) {

  var email = req.body.name;


  var decriptedPassword
  var encrytedPassword_t;

  //decript the password
  //    con.query('SELECT password FROM singin WHERE name = ?',email, function(error, result){
  //        if(error) res.send("encryption error");
  //        
  //        
  //        
  //        
  //        
  //        
  //        
  //        
  //        
  //        res.send(console.log("dicription done"))
  //    })
  //    


  var password = req.body.password;
  con.query('SELECT * FROM singin WHERE name = ?', email, function(error, results, fields) {
    encrytedPassword_t = results[0].password
    var byt = crypto.AES.decrypt(encrytedPassword_t, primaryKey);
    decriptedPassword = byt.toString(crypto.enc.Utf8);
    if (error) {
      // console.log("error ocurred",error);

      res.send("first condition of error");
    } else {
      // console.log('The solution is: ', results);
      if (results.length > 0) {
        if (decriptedPassword == password) {
          res.redirect("/loged");

          userID = results[0].id;
          name_table = results[0].name;
          email_table = results[0].email;



        } else {
          console.log('error os second')
        }
      } else {
        res.send("third condition of error");
      };
    };
    console.log(results);
  })
});



//todo list trial  userID            
app.post("/todo", function(req, res) {
  var person = {
    singin_id: userID,
    item: req.body.item
  };
  con.query("INSERT INTO todo SET?", person, function(err, result) {
    if (err) throw err;

    //        con.query("SELECT * FROM todo WHERE singin_id =?",userID, function(err,result){
    //            if(err) res.send("this is an error")
    //            
    //            item_id = result
    //            res.send("allgood");
    //        })
    //     

    res.redirect("/loged");
  });

})

//query to show list
app.get("/todo_list", function(req, res) {
  con.query("SELECT * FROM todo WHERE singin_id =?", userID, function(err, result) {
    if (err) res.send("this is an error")

    item_id = result
    res.redirect("/todo_list_s");
  })
})

app.get("/todo_delete", function(req, res) {
  con.query('DELETE FROM todo WHERE singin_id = ?', userID, function(error, result) {
    if (error) res.send("please enter the correct password")
    item_id = result;
    res.redirect("/loged");

  })
})



//deleting account
app.post("/delete_page", function(req, res) {

  res.render("delete")
})

app.post("/delete", function(req, res) {

  var password = req.body.password

  con.query('SELECT * FROM singin WHERE name = ?', req.body.name, function(error, result) {



    //        if(error) res.send("user not found");
    //        res.send("account hasbean deleted");

    if (error) {
      res.send("first condition of error");
    } else {
      console.log(result)
      // console.log('The solution is: ', results);
      if (result.length > 0) {
        if (result[0].password == password) {
          con.query('DELETE FROM singin WHERE password = ?', password, function(error, result) {
            if (error) res.send("please enter the correct password")
            res.redirect("/");
          })

        } else {
          res.send("second condition of error");
        }
      } else {
        res.send("third condition of error");
      };
    };



  })
})

//updating data
app.post("/change_page", function(req, res) {
  
  res.render("update")
})
app.post("/change", function(req, res) {

  //    
  //    UPDATE table_name
  //SET column1 = value1, column2 = value2, ...
  //WHERE condition;
  //    
  //    var ql = "UPDATE singin SET name="+req.body.name+", email ="+req.body.Sing_email+", password="+req.body.password+" WHERE password ="+req.body.password2
  //    
  //    var ql = "UPDATE singin SET name =?, email =?, password =? WHERE password =? "

  con.query("UPDATE singin SET name =?, email =?, password =? WHERE password =? ", [req.body.name, req.body.Sing_email, req.body.password, req.body.password2], function(err, result) {
    if (err) throw err;

    res.redirect("/");
  });
})



app.get('/supplies/:item', function(req, res) {

  var qr = req.params.item;
  con.query('DELETE FROM todo WHERE item = ?', qr, function(error, result) {
    if (error) res.send("deleting faile")
    res.redirect("/loged");
  })

})



app.listen(Port, function() {
  console.log("your port 8080 is now connected")
})



//    var q = "SELECT * FROM singin WHERE name =" + req.body.name + "AND password = " + req.body.password
//    var q = req.body.name + "AND password = " + req.body.password

//    con.query("SELECT * FROM singin WHERE name =?",req.body.name,function(err,result){
//        if (err) throw err;
//       console.log(result) ;
//        if(result = ''){ throw err}
//        else{res.redirect("/pass");}
//    });
const express = require('express') // making it possible to use express in this file
const app = express() // setting a variable and assigning it to the instance of express
const MongoClient = require('mongodb').MongoClient // makes it possible to use methods associated with mongoclient and talk to our DB
const PORT = 2100 // setting a variable to determin the location where our servers will be listening.
//require .env file and allow us to use hidden db string 
require('dotenv').config()// allows us to look for variables inside of the .env file 

// declaring variables to work with mongodb
let db, // declare a variable db but not assign a value 
    dbConnectionStr = process.env.DB_STRING, //declaring a variable and assigning our database connection string to it 
    dbName = 'todo' //declaring a variable and assigning the name of the database we will be using 
// connecting to database 
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }) // creating a connection to mongodb and passing in our connection string.  Also passing in an additional property
    .then(client => {//waiting for the connection and proceeding if successful, and passing in all the client information
        console.log(`Connected to ${dbName} Database`) //log to the console a template literal "connected to tod Database"
        db = client.db(dbName) // assigning a value to previously declared db variable that contains a db client factory method

    })// closing our .then

//middleware
app.set('view engine', 'ejs') // sets ejs as the default render method 
app.use(express.static('public')) // sets the location for static assets
// helps with parsing forms body parser(not listed is deprecated)
app.use(express.urlencoded({ extended: true })) // tells express to decode and encode URLs where the header matches the content.  Supports arrays and objects 
app.use(express.json()) //parses json content from incoming requests 


app.get('/',async (request, response)=>{ // starts a GET method when the root route is passed in, sets up req and res parameters
    const todoItems = await db.collection('todos').find().toArray() // sets a variable and awaits all items from the todos collection
    const itemsLeft = await db.collection('todos').countDocuments({completed: false}) // sets a variable and awaits a count of uncompleted items to later display in EJS 
    response.render('index.ejs', { items: todoItems, left: itemsLeft }) //rendering ejs file and passing through the db items and count remaining inside of an object 
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})
//when going to the route we're to add a noncomplete todo item and redirect to /
app.post('/addTodo', (request, response) => { //starts a POST method when the add route is passed in 
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false}) //inserts a new item into todos collection, gives it a completed value of false by default 
    .then(result => { // if insert is successful do something 
        console.log('Todo Added') //console log action
        response.redirect('/') //redirect to '/' to reload the page after posting 
    }) // closing the .then
    .catch(error => console.error(error)) //catching errors
}) //ending the POST 
//update items 
app.put('/markComplete', (request, response) => {  //starting a Put method when the markComplete route is passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ // look in the db for one item matching the name of the item passed in from the main.js file that was clicked on 
        $set: {
            completed: true //set completed status to true 
          }
    },{
        sort: {_id: -1},  //moves item to the bottom of the list 
        upsert: false // prevents insertion if item does not already exist
    })
    .then(result => { //starts a then if update was successful 
        console.log('Marked Complete') //logging successful completion 
        response.json('Marked Complete') //sending a response back to the sender
    }) //closing then 
    .catch(error => console.error(error)) // handling errors 

})
// mark uncomplete  //updates to incomplete 
app.put('/markUnComplete', (request, response) => { //starting a Put method when the markUnComplete route is passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false  //set completed status to false 
          }
    },{
        sort: {_id: -1}, //moves item to the bottom of the list 
        upsert: false // prevents insertion if item does not already exist 
    })
    .then(result => { //starts a then if update was successful 
        console.log('Marked uncomplete') // logging successful completion
        response.json('Marked Uncomplete') //sending a response back to the sender 
    }) //closing .then 
    .catch(error => console.error(error)) //catching errors 

}) //closing put
app.delete('/deleteItem', (request, response) => { //starts a delete method when the delete route is passed 
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})  // look inside the todos collection for the ONE item that has a matching name from our JS file 
    .then(result => { //starts a then if delete was successfull 
        console.log('Todo Deleted') //logging successful completion 
        response.json('Todo Deleted')  // sending a response back to the sender 
    }) // ending delete 
    .catch(error => console.error(error)) //catching errors 

}) // ending delete

app.listen(process.env.PORT || PORT, ()=>{ //listening for port from .env if no .env port will use PORT variable
    console.log(`Server running on port ${PORT}`) //console.log the running port 
}) //end the listen method 
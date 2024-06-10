const db = require('./Database.js');

//Function to allow asyncs/awaits to occur while testing
async function test() {

    //Clear Database and reset serial counters every time its needed
    await db.ResetDatabase();
    
    //Most tables rely on an image for foreign key checks so make sure at least 1 exists
    await db.CreateImage("/path/to/image").then((response) => { console.log("New image is created with id: " + response); });

    await db.CreateShop();

    await db.CreateUser("testuser1", "abc@gmail.com", "password12345", "1").then((response) => {
        console.log(response);
    });

    const x = await db.GetUserStatus(1);
    console.log("Testing: " + x);
}

test();
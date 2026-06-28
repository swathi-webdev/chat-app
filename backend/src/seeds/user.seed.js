import {config} from "dotenv";
import {connectDB} from "../lib/db.js";
import User from "../models/user.models.js";
// config();
config({ path: "./.env" });
const seedUsers=[
    {
        email:"emma.thompson@example.com",
        fullName:"Emma Thompson",
        password:"123456",
        profilePic:"https://randomuser.me/api/portraits/women/1.jpg",
    },
 {
        email:"Olivia.miller@example.com",
        fullName:"Olivia miler",
        password:"123456",
        profilePic:"https://randomuser.me/api/portraits/women/2.jpg",
    },
     {
        email:"sophia.davis@example.com",
        fullName:"Sophia Davis",
        password:"123456",
        profilePic:"https://randomuser.me/api/portraits/women/3.jpg",
    },
     {
        email:"karthika@example.com",
        fullName:"Karthika",
        password:"123456",
        profilePic:"https://randomuser.me/api/portraits/women/4.jpg",
    },
     {
        email:"saranya@example.com",
        fullName:"saranya",
        password:"123456",
        profilePic:"https://randomuser.me/api/portraits/women/5.jpg",
    },
     {
        email:"aishu@example.com",
        fullName:"Aishwaraya",
        password:"123456",
        profilePic:"https://randomuser.me/api/portraits/women/6.jpg",
    },
     {
        email:"fathima@example.com",
        fullName:"Fathima",
        password:"123456",
        profilePic:"https://randomuser.me/api/portraits/women/7.jpg",
    },
     {
        email:"hema@example.com",
        fullName:"Hema",
        password:"123456",
        profilePic:"https://randomuser.me/api/portraits/women/8.jpg",
    },
     {
        email:"rizuvana@example.com",
        fullName:"Rizuvana",
        password:"123456",
        profilePic:"https://randomuser.me/api/portraits/women/9.jpg",
    },
    {
        email:"harini@example.com",
        fullName:"Harini",
        password:"123456",
        profilePic:"https://randomuser.me/api/portraits/women/10.jpg",
    },
    
];

const seedDatabase=async()=>{
    try{
        await connectDB();
      
          await User.deleteMany({});

        await User.insertMany(seedUsers);
        console.log("Database seeded successfully");
    }catch(error){
        console.log("Error seeding databases:",error);
    }
};
// // call the function
seedDatabase();

// const seedDatabase = async () => {
//   try {
//     await connectDB();

//     const deleted = await User.deleteMany({});
//     console.log("Deleted users:", deleted.deletedCount);

//     const inserted = await User.insertMany(seedUsers);
//     console.log("Inserted users:", inserted.length);

//     console.log("Database seeded successfully");
//     process.exit(0);
//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   }
// };

// seedDatabase();
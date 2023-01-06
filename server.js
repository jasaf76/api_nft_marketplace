const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

process.on("uncaughtException", (err) => {
  console.log("uncaughtException Shutting down application");
  console.log(err.name, err.message);
  process.exit(1);
});


dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
  })
  .then((con) => {
    // console.log(con.connection);
    console.log("DB Connection Successfully");
  });
// .catch((err) => console.log("ERROR"));

console.log(process.env.NODE_ENV);

// //console.log(process.env)
const port = process.env.PORT || 3014;
const server = app.listen(port, () => {
  console.log(`Server läuft in Port ${port}...`);
});
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("unhandelRejection Shutting down application");
  server.close(() => {
    process.exit(1);
  });
});


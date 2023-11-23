const express = require("express");
const app = express();
const dotenv = require("dotenv");
const User = require("./models/userModel");
const Playlist = require("./models/playlistModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { verifytoken } = require("./middleware/authtoken");

const corsOptions = {
  origin: 'https://musicplayer-wheat.vercel.app/', // Adjust this to your frontend origin
  credentials: true,
};

dotenv.config();
app.use(cors(corsOptions));
const secret = process.env.JWT_WEB_TOKEN;

app.use(express.json());
app.use(cookieParser());

app.listen(4001, () => {
  console.log("running");
});

app.get("/", (req, res) => {
  res.send("Hello from musicapi");
});

//connection to db
mongoose.connect(process.env.DB_CONNECT).then(() => console.log("connected to db"));

  //code for user registration

app.post("/user", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.send(user);
  } catch (error) {
    res.send(error.message);
  }
});

//code for user login

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user === null) {
      res.send("No user found");
    } else {
      if (user.password == req.body.password) {
        const token = jwt.sign(
          {
            email: user.email,
          },
          secret
        );
        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
        });
        res.send("login success");
      } else {
        res.send("login failure");
      }
    }
  } catch (error) {
    res.send(error.message);
  }
});

//code for adding song to playlist

app.post("/addtoplaylist", verifytoken, async (req, res) => {
  const newSong = req.body;
  Playlist.findOne({ email: req.email })
    .then((foundPlaylist) => {
      if (foundPlaylist) {
          foundPlaylist.songs.push(newSong);
          return foundPlaylist.save();
        } 
      else {
        return Playlist.create({
          email: req.email,
          songs: [newSong],
        });
      }
    })
    .then((updatedPlaylist) => {
      console.log("Playlist updated:", updatedPlaylist);
      res.send(updatedPlaylist)
    })
    .catch((error) => {
      console.error("Error updating playlist:", error);
    });
});

//code for getting user specific playlist

app.get('/userplaylist',verifytoken,(req,res)=>{
  const userEmailToFind = req.email;
  Playlist.findOne({ email: userEmailToFind })
  .then(foundPlaylist => {
    if (foundPlaylist) {
      res.send(foundPlaylist);
      console.log('Playlist found:', foundPlaylist);
    } else {
      res.send('Please Add a song to Playlist')
      console.log('Playlist not found for the specified user.');
    }
  })
  .catch(error => {
    res.send('Error finding playlist:',error);
    console.error('Error finding playlist:', error);
  })
})

//code to delete a specific song from playlist

app.post('/deletesong',verifytoken,async(req,res)=>{
  try {
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { email : req.email },
      { $pull: { songs: req.body } },
      { new: true }
    );

    if (updatedPlaylist) {
      res.send(updatedPlaylist)
      console.log('Song deleted from the playlist:', updatedPlaylist);
    } else {
      res.send('Playlist not found for the specified user.')
      console.log('Playlist not found for the specified user.');
    }
  } catch (error) {
    res.send('error')
    console.error('Error deleting song from playlist:', error);
  }

})

app.get('/checklogin', verifytoken, (req, res)=>{
  if (req.email) {
    res.send('LOGGED_IN')
  }else{
    res.send('NOT_LOGGED_IN')
  }
})

const mongoose  = require('mongoose');

const playlistSchema = mongoose.Schema(
    {
        email:{
            type:String,
            unique:true
        },
        songs:{
            type:Array,
        }
    },
    {
        timestamps:true
    }
)

const playlist = mongoose.model('playlist',playlistSchema);

module.exports = playlist;
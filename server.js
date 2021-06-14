const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const PORT = process.env.PORT;
const server = express();
server.use(express.json());
server.use(cors());
mongoose.connect('mongodb://localhost:27017/digimon', {useNewUrlParser: true, useUnifiedTopology: true});

const digimonSchema = new mongoose.Schema({
    name:String,
    image:String,
    level:String,
})

const digimonModel = mongoose.model('digimons',digimonSchema);


server.listen(PORT,()=>{
    console.log(`listening on PORT ${PORT}`);
})


server.get('/getDigimons',getDigimonsHandler);
server.post('/addToFav',addToFavHandler);
server.get('/getFav',getFavHandler);
server.delete('/deleteFav/:id',deleteFavHandler);
server.put('/updateFav/:id',updateFavHandler);




function getDigimonsHandler(req,res){
    // console.log(req.query);
    const {digimon} = req.query;
    axios.get(`https://digimon-api.vercel.app/api/${digimon}`).then(result=>{
       let digimonArr = result.data.map(digimon=>{
            return(
                new Digimon(digimon)
            );
        })
        // console.log(digimonArr);
        res.send(digimonArr);

    })
}


class Digimon{
    constructor(digimon){
        this.name=digimon.name;
        this.image=digimon.img;
        this.level=digimon.level;
    }
}


function addToFavHandler(req,res){
    // console.log(req.body);
    const{name,image,level}=req.body;

    let newFav = new digimonModel({
        name: name,
        image:image,
        level:level,
    })
    newFav.save();
}


function getFavHandler(req,res){
    digimonModel.find({},(err,digiData)=>{
       res.send(digiData);
    })
}

function deleteFavHandler(req,res){
    // console.log(req.params);
    const {id}=req.params;
    digimonModel.deleteOne({_id:id},(err,deletedInfo)=>{
        digimonModel.find({},(err,digimonData)=>{
            res.send(digimonData);
            // console.log(digimonData);
        })
    })
}


function updateFavHandler(req,res){
    // console.log(req.params);
    // console.log(req.body);
    const {name,image,level}=req.body;
    const {id}=req.params;
    digimonModel.findOne({_id:id},(err,digiData)=>{
        digiData.name=name;
        digiData.image=image;
        digiData.level=level;
        digiData.save().then(()=>{
            digimonModel.find({},(error,digimonData)=>{
                res.send(digimonData);
            })
        })
    })
}
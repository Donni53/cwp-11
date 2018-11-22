const express = require('express');
let actors = require("./actors.json");
const fs = require('fs');
const router = express.Router();


router.get('/readAll', (req, res) => {
    res.send(AllActors());
});

router.post('/read', (req, res) => {
    res.send(actors[actors.findIndex(actor => actor.id == req.body.id)]);
});

router.post('/create', (req, res) => {
    if (ValidCreateActors(req)) {
        req.body.id = Date.now();
        actors.push(req.body);
        fs.writeFile("actors.json", JSON.stringify(actors), "utf8", function () {});
        res.send(AllActors());
    }
    else {
        res.send("{code: 400, message: Request invalid}");
    }
});

router.post('/update', (req, res) => {
    ExistIDactor(req.body.id).then(
        exist => {
            for (let i = 0; i < actors.length; i++) {
                if (actors[i].id == req.body.id) {
                    if (req.body.name!== undefined)
                        actors[i].name = req.body.name;
                    if (req.body.birth !== undefined)
                        actors[i].birth = req.body.birth;
                    if (req.body.films !== undefined && req.body.films > 0)
                        actors[i].films = req.body.films;
                    if (req.body.liked !== undefined && req.body.liked >= 0)
                        actors[i].liked = req.body.liked;
                    if (req.body.photo !== undefined)
                        actors[i].photo = req.body.photo;
                }
            }
            res.send(AllActors());
        },
        error => {
            res.send("{code: 404, message: Not found}");
        });
    fs.writeFile("actors.json", JSON.stringify(actors), "utf8", function () {});
});

router.post('/delete', (req, res) => {
    ExistIDactor(req.body.id).then(
        exist => {
            actors.splice(actors.findIndex(actor => actor.id == req.body.id), 1);
            fs.writeFile("actors.json", JSON.stringify(actors), "utf8", function () {});
            res.send(AllActors());
        },
        error => {
            res.send("{code: 404, message: Not found}");
        });
});


function ExistIDactor(id) {
    return new Promise((resolve, reject) => {
        let exist = 0;
        for (i = 0; i < actors.length; i++) {
            if (actors[i].id == id) {
                resolve("exist");
                exist = 1;
            }
            if ((i == actors.length && exist == 0) || id == undefined) {
                reject("error");
            }
        }
    })
}

function RefreshPositionActor() {
    actors.sort((a, b) => {
        return a.liked - b.liked;
    });
}

function AllActors() {
    RefreshPositionActor()
    return actors;
}

function ValidCreateActors(req) {
    if (req.body.name != undefined && req.body.birth !== undefined && req.body.films !== undefined
        && req.body.liked !== undefined && req.body.photo !== undefined && req.body.films > 0 && req.body.liked >= 0)
        return true;
    else
        return false;
}

module.exports = router;
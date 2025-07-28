var express = require("express");
var app = express();
var port = 2400;
var fileuploader = require("express-fileupload");
var cloudinary = require("cloudinary").v2;

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyBp02qMeE5KcgG618wpWCXvP9VZhvAqR4Y");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


var mysql2 = require("mysql2");

app.listen(port, function () {
    console.log("Server Started at Port no: 2400");
})


app.use(express.static("public"));

app.get("/", function (req, resp) {
    console.log(__dirname);
    console.log(__filename);

    let path = __dirname + "/index.html";
    resp.sendFile(path);
})

app.use(express.urlencoded(true));
app.use(express.json());
app.use(fileuploader());

cloudinary.config({
    cloud_name: 'dc4d29lw3',
    api_key: '225346154842257',
    api_secret: '--dWykZvFAFvnzhzPMlkcl9net8' // Click 'View API Keys' above to copy your API secret
});




// let dbConfig = "mysql://avnadmin:AVNS_bQ3CJKDJDEa2iFRFeDi@mysql-1917bd63-adityajindal704-0cd0.j.aivencloud.com:20741/defaultdb"

// let dbConfig="mysql://avnadmin:AVNS_KxsS7BghA-dc8srp-X6@mysql-37844c70-hasandeepaiven.c.aivencloud.com:21007/defaultdb"

// let mySqlVen = mysql2.createConnection(dbConfig);

// mySqlVen.connect(function (errKuch) {
//     if (errKuch == null)
//         console.log("AiVen Connnected Successfully");
//     else
//         console.log(errKuch.message);
// })

const pool = mysql2.createPool({
    host: 'mysql-39797539-hasandeep021-d917.f.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_Bqm8D7biZWapQSMIsqM',
    database: 'defaultdb',
    port: 22521,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("AiVen Connnected Successfully");

console.log("Node.js is connecting to this host:", pool.config.connectionConfig.host);

// console.log("MySQL Connection Pool created. The server is ready for database queries.");

app.get("/server-signup", function (req, resp) {
    let txtEmail = req.query.id;
    let txtPwd = req.query.txtPwd;
    let comboUser = req.query.comboUser;
    console.log(txtEmail);

    pool.query("insert into users2025 values(?,?,?,1,current_date())", [txtEmail, txtPwd, comboUser], function (errKuch) {
        if (errKuch == null)
            resp.send("recorded successfully");
        else
            console.log(errKuch.message);
    })

})

app.get("/do_login", function (req, resp) {
    let txtEmail2 = req.query.txtEmail2;
    let txtPwd2 = req.query.txtPwd2;

    const sql = "select * from users2025 where txtEmail = ? and txtPwd = ?";
    pool.query(sql, [txtEmail2, txtPwd2], function (err, results) {
        if (err) {
            console.log(err.message);
            return resp.status(500).json({ status: "error", message: "Database error." });
        }

        if (results.length === 0) {
            return resp.json({ status: "invalid", message: "Invalid credentials." });
        }

        // User was found, now check their status
        const user = results[0];
        if (user.status === 1) {
            // Success: Send a success status and the user's email
            resp.json({ status: "success", email: user.txtEmail, userType: user.comboUser });
        } else {
            // User is blocked
            resp.json({ status: "blocked", message: "This account is blocked." });
        }
    });
});

app.post("/do_registration", async function (req, resp) {

    let picurl = "";
    if (req.files != null) {
        let fName = req.files.picupload.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.picupload.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {


            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
        });
    }
    else
        picurl = "nopic.jpg";


    let emailid = req.body.emailid;
    let orgname = req.body.orgname;
    let regnumber = req.body.regnumber;
    let address = req.body.address;
    let sports = req.body.sports;
    let website = req.body.website;
    let insta = req.body.insta;
    let head = req.body.head;
    let contact = req.body.contact;

    console.log(emailid);

    pool.query(
        "insert into regorg(emailid, picurl, orgname, regnumber, address, sports, website, insta, head, contact, dos) values(?,?,?,?,?,?,?,?,?,?,current_date())",
        [emailid, picurl, orgname, regnumber, address, sports, website, insta, head, contact],
        function (errKuch) {
            if (errKuch == null)
                resp.send("recorded successfully");
            else
                resp.send(errKuch.message);
        }
    );


})
// --------------------------------------------- pans



app.post("/change-password", function (req, resp) {
    const { email, oldPassword, newPassword } = req.body;

    // 1. Check if the old password is correct
    const checkSql = "SELECT * FROM users2025 WHERE txtEmail = ? AND txtPwd = ?";
    pool.query(checkSql, [email, oldPassword], function (err, result) {
        if (err) {
            console.log(err.message);
            return resp.status(500).send("Database error.");
        }

        if (result.length === 0) {
            // No user found with that email and OLD password
            return resp.status(400).send("Incorrect old password.");
        }

        // 2. If old password was correct, update to the new password
        const updateSql = "UPDATE users2025 SET txtPwd = ? WHERE txtEmail = ?";
        pool.query(updateSql, [newPassword, email], function (err, updateResult) {
            if (err) {
                console.log(err.message);
                return resp.status(500).send("Error updating password.");
            }
            resp.send("Password updated successfully!");
        });
    });
});



app.post("/update-user", async function (req, resp) {
    let picurl = "";
    if (req.files != null) //user wants to Update Profile Pic
    {
        let fName = req.files.picupload.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.picupload.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
        });
    }
    else
        picurl = req.body.hdn;


    let emailid = req.body.emailid;
    let orgname = req.body.orgname;
    let regnumber = req.body.regnumber;
    let address = req.body.address;
    let sports = req.body.sports;
    let website = req.body.website;
    let insta = req.body.insta;
    let head = req.body.head;
    let contact = req.body.contact;


    pool.query("update regorg set orgname=? ,picurl=?,regnumber=?, address=?,sports=?,website=?,insta=?,head=?,contact=? where emailid=?", [orgname, picurl, regnumber, address, sports, website, insta, head, contact, emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send("updated Successfulllyyy");
            else
                resp.send("Inavlid email Id");
        }
        else
            resp.send(errKuch.message)
    })

})

app.get("/get-one", function (req, resp) {
    let emailid = req.query.emailid;
    pool.query("select * from regorg where emailid=?", [emailid], function (err, allRecords) {
        if (allRecords.length == 0)
            resp.send("No Record Found");
        else
            resp.json(allRecords);
    })
})

app.post("/Post_event", function (req, resp) {
    

    let emailid = req.body.emailid;
    let eventname = req.body.eventname;
    let doe = req.body.date;
    let Address = req.body.Address;
    let toe = req.body.time;
    let inputState = req.body.inputState;
    let Category = req.body.Category;
    let minage = req.body.minage;
    let contact = req.body.contact;
    let maxage = req.body.maxage;
    let lastDate = req.body.lastDate;
    let fee = req.body.fee;
    let pMny = req.body.pMny;
    let otherinfo = req.body.otherinfo;

    pool.query("insert into post_event values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [null, emailid, eventname, doe, Address, toe, inputState, Category, minage, contact, maxage, lastDate, fee, pMny, otherinfo], function (errKuch, result) {
        if (errKuch == null) {

            if (result.affectedRows == 1)
                resp.send("published Successfulllyyy");
            else
                resp.send("Inavlid email Id");
        }
        else
            resp.send(errKuch.message);
    })



})

app.get("/do-fetch-all-users", function (req, resp) {

    let emailid = req.query.data;

    pool.query("select * from post_event where emailid = ?", [emailid], function (err, allRecords) {
        resp.json(allRecords);
    })
})

app.get("/delete-one", function (req, resp) {
    console.log(req.query)
    let rid = req.query.rid;

    pool.query("delete from post_event where rid=?", [rid], function (errkuch, result) {

        if (errkuch == null) {
            if (result.affectedRows == 1) {
                resp.send("Deleted Successfully");
            }

            else {
                resp.send("invalid")
            }
        }

        else
            resp.send(errkuch);
    })
})

async function RajeshBansalKaChirag(imgurl) {
    const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {

            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())

    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const jsonData = JSON.parse(cleaned);
    console.log(jsonData);

    return jsonData

}

app.get("/dash_admin.html", function (req, resp) {
    // Make sure the file is in your main project folder or /public
    let path = __dirname + "/public/dash_admin.html";
    resp.sendFile(path);
});

app.get("/tournament-finder", function (req, resp) {
    let path = __dirname + "/public/tournament-finder.html";
    resp.sendFile(path);
});
app.get("/filter-tournaments", function (req, resp) {
    const { city, sport } = req.query; // Age has been removed

    if (!city || !sport) {
        return resp.status(400).send("City and sport are required.");
    }

    const sqlQuery = "SELECT * FROM post_event WHERE inputState = ? AND Category = ?";

    pool.query(sqlQuery, [city, sport], function (err, results) {
        if (err) {
            console.error("Database query error:", err.message);
            return resp.status(500).send("Error querying the database.");
        }
        resp.json(results);
    });
});

// This route gets all the unique game/sport categories from your events table
app.get("/get-distinct-games", function (req, resp) {
    pool.query("SELECT DISTINCT Category FROM post_event", (err, results) => {
        if (err) {
            return resp.status(500).send("Database error.");
        }
        const games = results.map(row => row.Category);
        resp.json(games);
    });
});



app.get("/admin/get-all-users", function (req, resp) {

    pool.query("SELECT txtEmail, comboUser, status, dos FROM users2025", (err, results) => {

        if (err) {

            console.error("Admin fetch users error:", err.message);
            return resp.status(500).send("Database error.");

        }
        resp.json(results);
    });
});

// Route to get all registered organization details
app.get("/admin/get-all-orgs", function (req, resp) {
    pool.query("SELECT * FROM regorg", (err, results) => {
        if (err) {
            console.error("Admin fetch orgs error:", err.message);
            return resp.status(500).send("Database error.");
        }
        resp.json(results);
    });
});

// Route to get all registered player details
app.get("/admin/get-all-players", function (req, resp) {
    pool.query("SELECT * FROM player_details", (err, results) => {
        if (err) {
            console.error("Admin fetch players error:", err.message);
            return resp.status(500).send("Database error.");
        }
        resp.json(results);
    });
});

app.get("/admin/update-user-status", function (req, resp) {
    const { email, status } = req.query;

    if (!email || !status) {
        return resp.status(400).send("Email and status are required.");
    }

    pool.query("UPDATE users2025 SET status = ? WHERE txtEmail = ?", [status, email], (err, result) => {
        if (err) {
            console.error("Admin update status error:", err.message);
            return resp.status(500).send("Database error.");
        }
        if (result.affectedRows > 0) {
            resp.send("Status updated successfully");
        } else {
            resp.status(404).send("User not found.");
        }
    });
});


app.post("/do_player-details", async function (req, resp) {

    let picurl2 = "";
    if (req.files != null) {
        let fName = req.files.pic_upload.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.pic_upload.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {


            picurl2 = picUrlResult.url;   

            console.log(picurl2);
        });
    }
    else
        picurl2 = "nopic.jpg";




    let picurl1 = "";
    if (req.files != null) {
        let fName = req.files.adhaarupload.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.adhaarupload.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(async function (picUrlResult) {


            picurl1 = picUrlResult.url;

            let jsonData = await RajeshBansalKaChirag(picUrlResult.url);//will give u the url of ur pic on cloudinary server
            // resp.send(jsonData);
            var gender = jsonData.gender;
            var dob = jsonData.dob;
            var name = jsonData.name;
            var adhaar_number = jsonData.adhaar_number;

            // mySqlVen.query(
            //     "insert into player_details2(name, adhaar_number, gender,dob2) values(?,?,?,?)",
            //     [name, adhaar_number, gender,dob2],
            //     function (errKuch) {
            //        if(errKuch!=null){
            //         resp.send(errKuch.message);
            //        }
            //     }
            // );
            console.log(picurl1);

            let emailid = req.body.emailid;

            let games = req.body.games;
            let address = req.body.address;
            let otherinfo = req.body.otherinfo;
            let contact = req.body.contact;

            console.log(emailid);

            pool.query(
                "insert into player_details(name, adhaar_number, gender,dob,emailid, picurl1,picurl2, games, address, otherinfo, contact) values(?,?,?,?,?,?,?,?,?,?,?)",
                [name, adhaar_number, gender, dob, emailid, picurl1, picurl2, games, address, otherinfo, contact],
                function (errKuch) {
                    if (errKuch == null)
                        resp.send("recorded successfully");
                    else
                        resp.send(errKuch.message);
                }
            );
        });
    }
    else
        picurl1 = "nopic.jpg";


})

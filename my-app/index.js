// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
var cookieParser = require("cookie-parser");

/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";
app.use(cookieParser());

/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

/**
 * Proxy to UM REST API
 */
const url = require('url');
const proxy = require('express-http-proxy');
const apiProxy = proxy('localhost:8080/cmsbs', {
  proxyReqPathResolver: req => url.parse(req.baseUrl).path
});

/**
 * Routes Definitions
 */
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});
app.use('/p/*', apiProxy);
app.use('/cmsbs/*', apiProxy);
app.get("/user", (req, res) => {
  // UMSESSIONID aus den Cookies auslesen und an den UM weiterschicken

  if (req.cookies["UMSESSIONID"] !== undefined) {
    console.log("UMSESSIONID: ", req.cookies["UMSESSIONID"]);
    const http = require("http");
    const options = {
      hostname: "localhost",
      port: 8080,
      path: "/cmsbs/rest/de.pinuts.cmsbs.auth2.Auth/c.json/my-app",
      method: "GET",
      headers: {
        Cookie: "UMSESSIONID=" + req.cookies["UMSESSIONID"],
      },
    };

    const umreq = http.request(options, (umres) => {
      umres.on("data", (d) => {
        let umdata = JSON.parse(d);
        let userProfile = umdata.data.ses;
        //console.log(userProfile);
        res.render("user", {
          title: "Profile",
          userProfile: userProfile,
        });
      });
    });
    umreq.on("error", (error) => {
      console.error(error);
    });

    umreq.end();
  } else {
    res.render("user", {
      title: "Profile",
      userProfile: {},
      loginGroups: {},
    });
  }
});
/**
 * Server Activation
 */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});

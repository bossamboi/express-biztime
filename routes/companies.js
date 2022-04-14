"use strict"
//biztime database setup

const express = require("express");
const { ValueError, NotFoundError } = require("../expressError");
const db = require("../db");
const router = new express.Router();

//app.use("/companies")

/** Return list of all companies */
router.get("/", async (req,res) => {

  const results = await db.query(
    `SELECT code, name
      FROM companies;`);

  const companies = results.rows;
  if (!companies) {
    throw new NotFoundError;
  }
  return res.json({ companies });

});

/** Return company by code */
router.get("/:code", async (req,res) => {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1;`, [code]);

  const company = results.rows[0];

  if (!company) {
    throw new NotFoundError;
  }
  return res.json({ company });
});




// router.get("/good-search",
//   async function (req, res, next) {
//     const type = req.query.type;

//     const results = await db.query(
//       `SELECT id, name, type
//                FROM users
//                WHERE type = $1`, [type]);
//     const users = results.rows;
//     return res.json({ users });

module.exports = router;
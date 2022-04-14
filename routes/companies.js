"use strict";

//biztime database setup

const express = require("express");
const slugify = require("slugify");
const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const router = new express.Router();

//app.use("/companies")

/** Return list of all companies */
router.get("/", async (req, res) => {
	const results = await db.query(
		`SELECT code, name
      FROM companies;`
	);

	const companies = results.rows;

	return res.json({ companies });
});

/** Return company by code */
router.get("/:code", async (req, res) => {
	const code = req.params.code;

	const results = await db.query(
		`SELECT code, name, description
      FROM companies
      WHERE code = $1;`,
		[code]
	);

	const company = results.rows[0];

	if (!company) {
		throw new NotFoundError();
	}

	const iResults = await db.query(
		`SELECT id
      FROM invoices
      WHERE comp_code = $1`,
		[code]
	);

	const invoices = iResults.rows.map((inv) => inv.id);
	company.invoices = invoices;

	return res.json({ company });
});

/** Create new company */
router.post("/", async (req, res) => {
	const { name, description } = req.body;

	const code = slugify(name, {
		lower: true,
		replacement: "_",
	});

	const results = await db.query(
		`INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
		[code, name, description]
	);
	const company = results.rows[0];
	return res.status(201).json({ company });
});

/** Edit a company */
router.put("/:code", async (req, res) => {
	const code = req.params.code;

	const { name, description } = req.body;

	if (!name || !description) {
		throw new BadRequestError();
	}

	const results = await db.query(
		`UPDATE companies
      SET name=$1,
          description=$2
      WHERE code=$3
      RETURNING code, name, description`,
		[name, description, code]
	);
	const company = results.rows[0];

	if (!company) {
		throw new NotFoundError();
	}

	return res.json({ company });
});

/** Delete a company */
router.delete("/:code", async (req, res) => {
	const results = await db.query("DELETE FROM companies WHERE code=$1", [
		req.params.code,
	]);

	if (!results.rowCount) {
		throw new NotFoundError();
	}

	return res.json({ status: "deleted" });
});

module.exports = router;

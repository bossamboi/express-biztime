"use strict";

//biztime database setup

const express = require("express");
const { NotFoundError } = require("../expressError");
const db = require("../db");
const router = new express.Router();

//app.use("/invoices")

/** Return list of all invoices */
router.get("/", async (req, res) => {
	const results = await db.query(
		`SELECT id, comp_code
      FROM invoices;`
	);

	const invoices = results.rows;
	if (!invoices) {
		throw new NotFoundError();
	}
	return res.json({ invoices });
});

/** Return one invoice*/
router.get("/:id", async (req, res) => {
	const iResults = await db.query(
		`SELECT id, amt, paid, add_date, paid_date
            FROM invoices
            WHERE id = $1`,
		[req.params.id]
	);
	const invoice = iResults.rows[0];

	if (!invoice) {
		throw new NotFoundError();
	}

	const cResults = await db.query(
		`SELECT code, name, description
            FROM invoices
            JOIN companies ON invoices.comp_code = companies.code
            WHERE invoices.id = $1`,
		[req.params.id]
	);
	const company = cResults.rows[0];

	invoice.company = company;

	return res.json({ invoice });
});

module.exports = router;

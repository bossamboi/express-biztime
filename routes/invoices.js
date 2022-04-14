"use strict";

//biztime database setup

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const router = new express.Router();


/** Return list of all invoices */
router.get("/", async (req, res) => {
	const results = await db.query(
		`SELECT id, comp_code
      FROM invoices
			ORDER BY comp_code;`
	);

	const invoices = results.rows;

	return res.json({ invoices });
});


/** Return one invoice*/
router.get("/:id", async (req, res) => {

	const results = await db.query(
		`SELECT code, name, description, id, amt, paid, add_date, paid_date
            FROM invoices
            JOIN companies ON invoices.comp_code = companies.code
            WHERE invoices.id = $1;`,
		[req.params.id]
	);

	const result = results.rows[0];

	if (!result) {
		throw new NotFoundError();
	}

	const invoice = {
		invoice:{
			id: result.id,
			amt: result.amt,
			paid: result.paid,
			add_date: result.add_date,
			paid_date: result.paid_date,
			company: {
				code: result.code,
				name: result.name,
				description: result.description
			}
		}
	}
	return res.json(invoice);
});


/** Adds new invoice */
router.post("/", async (req, res) => {
	const { comp_code, amt } = req.body;

	try {
		const results = await db.query(
			`INSERT INTO invoices (comp_code, amt)
				VALUES ($1, $2)
				RETURNING id, comp_code, amt, paid, add_date, paid_date;`,
			[comp_code, amt]
		);

		const invoice = results.rows[0];

		return res.status(201).json({ invoice });

	} catch {
		throw new BadRequestError();
	}
});


/** Updates invoice amt. */
router.put("/:id", async (req, res) => {
	const { amt } = req.body;

	try {
		const result = await db.query(
			`UPDATE invoices
					SET amt=$1
					WHERE id=$2
					RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[amt, req.params.id]
		);

		const invoice = result.rows[0];

		if (!invoice) {
			throw new NotFoundError();
		}
		return res.json({ invoice });

	} catch (err) {
		if (!(err instanceof NotFoundError)) {
			throw new BadRequestError();
		}
		throw new NotFoundError();
	}
});


/**Deletes Invoice */
router.delete("/:id", async (req, res) => {
	const results = await db.query(
		`DELETE FROM invoices WHERE id=$1`,
		[req.params.id]
	);

	if (!results.rowCount) {
		throw new NotFoundError();
	}

	return res.json({ status: "deleted" });
});


module.exports = router;
const express = require("express");

const db = require("../db");

const {
    requireAdmin
} = require("../middleware/auth");

const router = express.Router();


// CHECK PROMO

router.post("/check", async (req, res) => {

    try {

        const {
            code,
            subtotal
        } = req.body;

        const result =
            await db.query(
                `
                SELECT *
                FROM promo_codes
                WHERE UPPER(code)=UPPER($1)
                AND active=true
                AND
                (
                    expires_at IS NULL
                    OR expires_at > NOW()
                )
                AND
                (
                    max_uses IS NULL
                    OR used_count < max_uses
                )
                `,
                [code]
            );

        if (!result.rows.length) {

            return res.status(404).json({
                success: false,
                message:
                    "Promo kod yaroqsiz yoki muddati tugagan."
            });

        }

        const promo =
            result.rows[0];

        if (
            Number(subtotal) <
            Number(promo.min_order)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    `Minimal buyurtma ${promo.min_order} so‘m.`
            });

        }

        let discount = 0;

        if (
            promo.discount_type ===
            "percent"
        ) {

            discount =
                Math.floor(
                    Number(subtotal) *
                    Number(promo.discount_value) /
                    100
                );

        } else {

            discount =
                Number(
                    promo.discount_value
                );

        }

        discount =
            Math.min(
                discount,
                Number(subtotal)
            );

        res.json({

            success: true,

            data: {
                code: promo.code,
                discount
            }

        });

    } catch {

        res.status(500).json({
            success: false,
            message:
                "Promo tekshirishda xato."
        });

    }

});


// ADMIN LIST

router.get(
    "/",
    requireAdmin,
    async (req, res) => {

        const result =
            await db.query(
                `
                SELECT *
                FROM promo_codes
                ORDER BY id DESC
                `
            );

        res.json({
            success: true,
            data: result.rows
        });

    }
);


// ADMIN CREATE

router.post(
    "/",
    requireAdmin,
    async (req, res) => {

        const {
            code,
            discount_type,
            discount_value,
            min_order,
            max_uses,
            expires_at
        } = req.body;

        const result =
            await db.query(
                `
                INSERT INTO promo_codes
                (
                    code,
                    discount_type,
                    discount_value,
                    min_order,
                    max_uses,
                    expires_at
                )
                VALUES
                ($1,$2,$3,$4,$5,$6)
                RETURNING *
                `,
                [
                    String(code).toUpperCase(),
                    discount_type,
                    Number(discount_value),
                    Number(min_order || 0),
                    max_uses
                        ? Number(max_uses)
                        : null,
                    expires_at || null
                ]
            );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });

    }
);


// DELETE

router.delete(
    "/:id",
    requireAdmin,
    async (req, res) => {

        await db.query(
            `
            DELETE FROM promo_codes
            WHERE id=$1
            `,
            [Number(req.params.id)]
        );

        res.json({
            success: true
        });

    }
);


module.exports = router;

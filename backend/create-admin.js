require("dotenv").config();

const bcrypt = require("bcryptjs");

const db = require("./db");

async function main() {

    const email =
        process.env.ADMIN_PHONE || process.env.ADMIN_EMAIL;

    const password =
        process.env.ADMIN_PASSWORD;

    if (!email || !password) {

        throw new Error(
            "ADMIN_PHONE (yoki ADMIN_EMAIL) yoki ADMIN_PASSWORD yo'q."
        );

    }


    const phone =
        email;


    const hash =
        await bcrypt.hash(
            password,
            12
        );


    const exists =
        await db.query(
            `
            SELECT id
            FROM users
            WHERE phone=$1
            `,
            [phone]
        );


    if (exists.rows.length) {

        await db.query(
            `
            UPDATE users
            SET
                password_hash=$1,
                role='admin',
                name='Lavash N1 Admin'
            WHERE phone=$2
            `,
            [
                hash,
                phone
            ]
        );

    } else {

        await db.query(
            `
            INSERT INTO users
            (
                name,
                phone,
                password_hash,
                role
            )
            VALUES
            (
                'Lavash N1 Admin',
                $1,
                $2,
                'admin'
            )
            `,
            [
                phone,
                hash
            ]
        );

    }


    console.log(
        "Admin yaratildi:",
        email
    );


    await db.end();

}


main()
    .catch(error => {

        console.error(error);

        process.exit(1);

    });

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(120) NOT NULL,

    phone VARCHAR(30) UNIQUE NOT NULL,

    password_hash TEXT,

    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin','manager')),

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    category VARCHAR(100) NOT NULL,

    description TEXT DEFAULT '',

    price INTEGER NOT NULL CHECK (price >= 0),

    image TEXT DEFAULT '',

    available BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,

    code VARCHAR(50) UNIQUE NOT NULL,

    discount_type VARCHAR(20) NOT NULL,

    discount_value INTEGER NOT NULL,

    min_order INTEGER NOT NULL DEFAULT 0,

    max_uses INTEGER,

    used_count INTEGER NOT NULL DEFAULT 0,

    expires_at TIMESTAMP,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id)
        ON DELETE SET NULL,

    customer_name VARCHAR(120) NOT NULL,

    phone VARCHAR(30) NOT NULL,

    address TEXT NOT NULL,

    note TEXT DEFAULT '',

    subtotal INTEGER NOT NULL DEFAULT 0,

    discount INTEGER NOT NULL DEFAULT 0,

    delivery_fee INTEGER NOT NULL DEFAULT 0,

    total INTEGER NOT NULL DEFAULT 0,

    promo_code VARCHAR(50),

    status VARCHAR(30) NOT NULL DEFAULT 'new',

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,

    order_id BIGINT NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    product_id INTEGER
        REFERENCES products(id)
        ON DELETE SET NULL,

    product_name VARCHAR(150) NOT NULL,

    price INTEGER NOT NULL,

    quantity INTEGER NOT NULL CHECK (quantity > 0),

    subtotal INTEGER NOT NULL
);


CREATE INDEX IF NOT EXISTS idx_orders_user_id
ON orders(user_id);


CREATE INDEX IF NOT EXISTS idx_orders_status
ON orders(status);


CREATE INDEX IF NOT EXISTS idx_orders_created_at
ON orders(created_at);


CREATE INDEX IF NOT EXISTS idx_products_category
ON products(category);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);

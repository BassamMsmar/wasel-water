import sqlite3
conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()
try:
    cur.execute("SELECT id, name, flag FROM products_product;")
    rows = cur.fetchall()
    print("Products before:", rows)
except sqlite3.OperationalError as e:
    print("Error:", e)
conn.close()

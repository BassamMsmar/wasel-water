import sqlite3
conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()
try:
    cur.execute("UPDATE products_product SET flag = NULL;")
    conn.commit()
    print("Cleaned flag successfully")
except sqlite3.OperationalError as e:
    print("Error:", e)
conn.close()

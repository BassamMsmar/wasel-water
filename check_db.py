import sqlite3
conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()
try:
    cur.execute("PRAGMA table_info(products_product);")
    rows = cur.fetchall()
    for r in rows:
        print(r)
except Exception as e:
    print(e)
conn.close()


file_path = r'e:\Projects\wasel-water\static\ar\css\main.css'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if '.product-card' in line:
            print(f'{i+1}: {line.strip()}')

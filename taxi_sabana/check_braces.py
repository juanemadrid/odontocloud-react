
def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    for i, line in enumerate(lines):
        line = line.split('//')[0] # ignore comments
        for j, char in enumerate(line):
            if char == '{':
                stack.append((i + 1, j + 1))
            elif char == '}':
                if not stack:
                    print(f"Extra closing brace at line {i + 1}, col {j + 1}")
                    return
                stack.pop()
    
    if stack:
        print(f"Unclosed braces: {len(stack)}")
        for item in stack[-1:]:
            print(f"Last unclosed brace at line {item[0]}, col {item[1]}")
    else:
        print("Braces are balanced.")

check_balance(r"e:\copia de seguridad\taxi_sabana\lib\pantallas\autenticacion\home_pasajero.dart")

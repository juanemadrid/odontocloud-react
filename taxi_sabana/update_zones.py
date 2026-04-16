import json
import os

file_path = r'e:\copia de seguridad\taxi_sabana\assets\sincelejo_barrios.json'

def update_zones():
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    count_c4 = 0
    count_c5 = 0
    
    for barrio in data:
        comuna = barrio.get('comuna', '')
        nombre = barrio.get('nombre_barrio', '')
        
        # Rule 1: Comuna 4 -> CENTRAL OESTE
        if comuna == 'Comuna 4':
            barrio['zona'] = 'CENTRAL OESTE'
            count_c4 += 1
            
        # Rule 2: Comuna 5 -> CENTRAL (Default)
        # Exceptions: Villa María -> SUR
        if comuna == 'Comuna 5':
            if nombre == 'Villa María':
                 barrio['zona'] = 'SUR'
            elif nombre in ['Majagual', 'Plaza de Majagual']:
                 barrio['zona'] = 'CENTRAL'
            else:
                 # Check if currently CENTRO, update to CENTRAL? 
                 # User said "Comuna 5 is Central". 
                 # Existing JSON had "CENTRO". I will change to "CENTRAL" to be consistent?
                 # Or keep "CENTRO"? User said "Central". 
                 # Let's use "CENTRAL" for Comuna 5 to match Comuna 4's "CENTRAL OESTE" style.
                 if barrio['zona'] == 'CENTRO': 
                    barrio['zona'] = 'CENTRAL'
            count_c5 += 1
            
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
        
    print(f"Updated {count_c4} barrios in Comuna 4 to CENTRAL OESTE.")
    print(f"Updated {count_c5} barrios in Comuna 5 (Majagual corrected to CENTRAL, Villa Maria SUR).")

if __name__ == '__main__':
    update_zones()

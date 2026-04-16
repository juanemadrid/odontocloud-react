import json

def normalize(s):
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u'
    }
    s = s.lower().strip()
    for k, v in replacements.items():
        s = s.replace(k, v)
    return s

def resolve(query_addr):
    with open('e:/copia de seguridad/taxi_sabana/assets/sincelejo_barrios.json', 'r', encoding='utf-8') as f:
        barrios = json.load(f)
    
    query = normalize(query_addr)
    print(f"Address: {query_addr}")
    print(f"Normalized: {query}")
    
    for i, b in enumerate(barrios):
        bNameRaw = b.get('nombre_barrio', '')
        bName = normalize(bNameRaw)
        
        if not bName: continue
        
        # Exact logic from Dart:
        # if (bName == queryNorm || bName.contains(queryNorm) || queryNorm.contains(bName))
        
        match = False
        if bName == query: match = True
        elif bName in query: match = True # query.contains(bName)
        elif query in bName: match = True # bName.contains(query)
        
        if match:
            print(f"✅ MATCH FOUND at Index {i}:")
            print(f"   Barrio: {bNameRaw}") # Original name
            print(f"   Normalized Barrio: {bName}")
            print(f"   Zone: {b.get('zona')}")
            return

    print("❌ NO MATCH FOUND")

# Test cases
addresses = [
    "Cl. 43 A Bis # 17A-3 Majagual, Sincelejo, Sucre, Colombia",
    "Sincelejo, Colombia",
    "Majagual, Sincelejo",
    "Gran Colombia"
]

for a in addresses:
    print("-" * 50)
    resolve(a)

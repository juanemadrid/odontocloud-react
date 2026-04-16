
import 'dart:convert';
import 'dart:io';

String normalize(String s) {
   final replacements = {
     'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u'
   };
   s = s.toLowerCase().trim();
   replacements.forEach((k, v) {
     s = s.replaceAll(k, v);
   });
   return s;
}

void resolve(String queryAddr, List<dynamic> barrios) {
  final query = normalize(queryAddr);
  print("");
  print("-" * 50);
  print("Address: $queryAddr");
  print("Normalized: $query");
  
  for (int i = 0; i < barrios.length; i++) {
    final b = barrios[i];
    final bNameRaw = (b['nombre_barrio'] ?? '').toString();
    final bName = normalize(bNameRaw);
    
    if (bName.isEmpty) continue;
    
    // Logic from ZonaResolver
    bool match = false;
    if (bName == query) match = true;
    else if (query.contains(bName)) match = true;
    else if (bName.contains(query)) match = true;
    
    if (match) {
      print("✅ MATCH FOUND at Index $i:");
      print("   Barrio: $bNameRaw");
      print("   Normalized Barrio: $bName");
      print("   Zone: ${b['zona']}");
      return; 
    }
  }
  print("❌ NO MATCH FOUND");
}

void main() async {
  final file = File('assets/sincelejo_barrios.json');
  final content = await file.readAsString();
  final List<dynamic> barrios = jsonDecode(content);
  
  final addresses = [
    "Cl. 43 A Bis # 17A-3 Majagual, Sincelejo, Sucre, Colombia",
    "Sincelejo, Colombia",
    "Majagual, Sincelejo",
    "Gran Colombia",
    "Cl 43 A Bis # 17A-3 Majagual"
  ];
  
  for (final a in addresses) {
    resolve(a, barrios);
  }
}

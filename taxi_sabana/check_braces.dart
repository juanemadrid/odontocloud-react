
import 'dart:io';

void main() {
  final file = File('lib/pantallas/autenticacion/home_conductor.dart');
  final lines = file.readAsLinesSync();
  
  int braceCount = 0;
  List<int> openLines = [];

  for (int i = 0; i < lines.length; i++) {
    String line = lines[i].trim();
    // naive comment removal
    if (line.startsWith('//')) continue;
    
    // Process char by char to handle multiple on one line
    for (int c = 0; c < line.length; c++) {
        if (line[c] == '{') {
            braceCount++;
            openLines.add(i + 1);
        } else if (line[c] == '}') {
            braceCount--;
            if (openLines.isNotEmpty) openLines.removeLast();
            
            // Print when we close a major block near our target area
            if (i > 1200 && i < 1450 && braceCount < 5) { // Assuming class + method + try is deep enough
                print('Line ${i+1}: Closing brace found. Level now: $braceCount');
            }
        }
    }
    
    if (braceCount < 0) {
        print('ERROR: Negative brace count at line ${i+1}');
        return;
    }
  }
  
  print('Final brace count: $braceCount');
  if (braceCount > 0) {
      print('Unclosed braces starting lines: ${openLines.take(5)}...');
  }
}

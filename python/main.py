#!/usr/bin/env python3
# python/main.py
import sys
import json
import importlib

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments: module method params"}))
        return
    
    module_name = sys.argv[1]
    method_name = sys.argv[2]
    
    # Handle params - try to parse JSON, if it fails, treat as string
    params = {}
    if len(sys.argv) > 3:
        try:
            # Try to parse as JSON
            params = json.loads(sys.argv[3])
        except json.JSONDecodeError:
            # If it's not valid JSON, treat it as a string parameter
            params = {"prompt": sys.argv[3]}
    
    try:
        # Import module dynamically
        module = importlib.import_module(module_name)
        method = getattr(module, method_name)
        result = method(**params)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()

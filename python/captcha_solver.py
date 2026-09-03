# python/captcha_solver.py
import sys
import json
import asyncio
import traceback

def solve_captcha_from_file(image_path):
    """Solve CAPTCHA from an image file"""
    try:
        from captcha_solver import CaptchaSolver
        solver = CaptchaSolver()
        result = solver.solve_from_file(image_path)
        return {"success": True, "text": result}
    except Exception as e:
        return {"success": False, "error": str(e), "traceback": traceback.format_exc()}

async def solve_captcha_from_url(url):
    """Solve CAPTCHA from a URL"""
    try:
        from captcha_solver import CaptchaSolver
        import requests
        from PIL import Image
        from io import BytesIO

        response = requests.get(url)
        image = Image.open(BytesIO(response.content))
        
        solver = CaptchaSolver()
        result = solver.solve_from_image(image)
        return {"success": True, "text": result}
    except Exception as e:
        return {"success": False, "error": str(e), "traceback": traceback.format_exc()}

async def solve_captcha_on_page(url, selector='iframe[src*="recaptcha"]'):
    """Solve reCAPTCHA on a webpage using Playwright"""
    try:
        from captcha_solver import CaptchaSolver
        from playwright.async_api import async_playwright
        
        solver = CaptchaSolver()
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Navigate to page
            await page.goto(url, wait_until='networkidle')
            
            # Wait for CAPTCHA
            await page.wait_for_selector(selector, timeout=30000)
            
            # Solve CAPTCHA
            solved = await solver.solve_on_page(page)
            
            await browser.close()
            
            if solved:
                return {"success": True, "solved": True}
            else:
                return {"success": False, "solved": False, "error": "Could not solve CAPTCHA"}
                
    except Exception as e:
        return {"success": False, "error": str(e), "traceback": traceback.format_exc()}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing action"}))
        return
    
    action = sys.argv[1]
    
    if action == "solve_file":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Missing image path"}))
            return
        result = solve_captcha_from_file(sys.argv[2])
        print(json.dumps(result))
        
    elif action == "solve_url":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Missing URL"}))
            return
        result = asyncio.run(solve_captcha_from_url(sys.argv[2]))
        print(json.dumps(result))
        
    elif action == "solve_page":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Missing page URL"}))
            return
        selector = sys.argv[3] if len(sys.argv) > 3 else 'iframe[src*="recaptcha"]'
        result = asyncio.run(solve_captcha_on_page(sys.argv[2], selector))
        print(json.dumps(result))
        
    else:
        print(json.dumps({"error": f"Unknown action: {action}"}))

if __name__ == "__main__":
    main()

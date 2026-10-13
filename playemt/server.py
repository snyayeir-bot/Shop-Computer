"""
Bank Payment Slip Scanner - Complete Server & API
គាំទ្រការស្គែន slip ធនាគារគ្រប់ប្រភេទ (ACLEDA, ABA, Bakong, Wing, Canadia, TrueMoney, etc.)
"""

import os
import sys
import json
import io
import base64
import cv2
import dotenv
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image

# Force UTF-8 encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

# Load environment variables (.env)
dotenv.load_dotenv()

# Check dependencies
try:
    # pyrefly: ignore [missing-import]
    from pyzbar.pyzbar import decode as pyzbar_decode
    PYZBAR_AVAILABLE = True
except ImportError:
    PYZBAR_AVAILABLE = False

try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class BankSlipScanner:
    """Class សម្រាប់ស្គែន និងស្រង់ទិន្នន័យពីបង្កាន់ដៃផ្ទេរប្រាក់ (Bank Slip)"""
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI-API-KEY")
        if self.api_key and GEMINI_AVAILABLE:
            print("✨ Gemini AI Vision ដំណើរការរួចរាល់...")
            self.client = genai.Client(api_key=self.api_key)
        else:
            print("⚠️ មិនមាន GEMINI_API_KEY ត្រឹមត្រូវទេក្នុង .env")
            self.client = None

    def parse_khqr_tags(self, qr_text: str) -> dict:
        """ស្រង់ទិន្នន័យពី KHQR (Bakong EMVCo)៖ Tag 53 (រូបិយប័ណ្ណ៖ 840=USD, 116=KHR) និង Tag 54 (ចំនួនទឹកប្រាក់)"""
        info = {}
        if not qr_text or not isinstance(qr_text, str) or len(qr_text) < 10:
            return info
        try:
            i = 0
            while i < len(qr_text) - 4:
                tag = qr_text[i:i+2]
                length_str = qr_text[i+2:i+4]
                if not (tag.isdigit() and length_str.isdigit()):
                    break
                length = int(length_str)
                val = qr_text[i+4:i+4+length]
                i = i + 4 + length
                if tag == '53':
                    # ISO 4217 Currency Code
                    if val == '840':
                        info['qr_currency'] = 'USD'
                    elif val == '116':
                        info['qr_currency'] = 'KHR'
                elif tag == '54':
                    info['qr_amount'] = val
        except Exception:
            pass
        return info

    def scan_qr_code(self, img_pil):
        """ស្គែន QR Code / KHQR (Bakong) ពីលើ Slip"""
        qr_text = None
        try:
            if PYZBAR_AVAILABLE:
                decoded = pyzbar_decode(img_pil)
                for obj in decoded:
                    qr_text = obj.data.decode('utf-8', errors='ignore')
                    break
        except Exception:
            pass

        # Fallback ស្គែនតាម OpenCV
        if not qr_text:
            try:
                import numpy as np
                cv_img = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
                qr_detector = cv2.QRCodeDetector()
                data, bbox, _ = qr_detector.detectAndDecode(cv_img)
                if data:
                    qr_text = data
            except Exception:
                pass

        if qr_text:
            parsed = self.parse_khqr_tags(qr_text)
            return {
                "qr_data": qr_text,
                "qr_found": True,
                "qr_currency": parsed.get("qr_currency"),
                "qr_amount": parsed.get("qr_amount")
            }

        return {"qr_data": None, "qr_found": False, "qr_currency": None, "qr_amount": None}

    def extract_with_gemini(self, img_pil: Image.Image) -> dict:
        """ប្រើ Gemini AI Vision ដើម្បីស្រង់ទិន្នន័យ Slip បានយ៉ាងសុក្រឹតបំផុត"""
        if not self.client:
            return None

        # Convert palette/RGBA images to clean RGB
        if img_pil.mode in ("RGBA", "P", "LA"):
            img_pil = img_pil.convert("RGB")

        prompt = """
        You are an expert OCR & Document Analyzer for Cambodian Bank Payment Slips (បង្កាន់ដៃផ្ទេរប្រាក់).
        Analyze this bank transfer slip (e.g. ACLEDA Bank, ABA Bank, Bakong, Wing, Canadia, TrueMoney, etc.) carefully.
        
        CRITICAL RULES FOR CURRENCY DETECTION (ការកំណត់រូបិយប័ណ្ណ ៛ KHR ឬ $ USD):
        - Check the currency symbol and text next to the amount:
          * If it says "KHR", "៛", "រៀល", or if the amount is in thousands without cents (e.g. 10,000, 20,000, 40,000, 80,000 ៛), the currency MUST be "KHR".
          * If it says "USD", "$", "ដុល្លារ", or has decimals/cents (e.g. 5.00, 10.00, 25.50), the currency MUST be "USD".
          * Always return strictly "KHR" or "USD" in the "currency" field.

        Extract the following fields accurately and return ONLY valid JSON:
        {
            "bank_name": "ឈ្មោះធនាគារ (e.g. ACLEDA Bank, ABA Bank, Bakong, Wing, etc.)",
            "transaction_type": "ប្រភេទប្រតិបត្តិការ (e.g. ប្រតិបត្តិការ QR, ផ្ទេរប្រាក់)",
            "amount": "ចំនួនទឹកប្រាក់ជាលេខសុទ្ធ (e.g. 40000 ឬ 10.00) កុំដាក់សញ្ញារូបិយប័ណ្ណក្នុងលេខនេះ",
            "currency": "KHR ឬ USD",
            "sender_name": "ឈ្មោះអ្នកផ្ញើ / គណនីកាត់ប្រាក់",
            "sender_account": "លេខគណនី ឬលេខទូរស័ព្ទអ្នកផ្ញើ",
            "receiver_name": "ឈ្មោះអ្នកទទួលប្រាក់",
            "receiver_account": "លេខគណនី ឬលេខទូរស័ព្ទអ្នកទទួល",
            "transaction_id": "លេខយោង / លេខកូដប្រតិបត្តិការ (Reference / Trx ID)",
            "date": "កាលបរិច្ឆេទប្រតិបត្តិការ",
            "time": "ពេលវេលាប្រតិបត្តិការ"
        }
        Return ONLY valid JSON without markdown wrapping or backticks.
        """

        # Models to try with automatic fallback in case of high demand (503)
        candidate_models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
        last_error = None

        for model_name in candidate_models:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=[img_pil, prompt]
                )
                text_resp = response.text.strip()

                # Clean markdown formatting if present
                if text_resp.startswith("```json"):
                    text_resp = text_resp[7:]
                if text_resp.startswith("```"):
                    text_resp = text_resp[3:]
                if text_resp.endswith("```"):
                    text_resp = text_resp[:-3]

                parsed = json.loads(text_resp.strip())
                return parsed
            except Exception as e:
                last_error = e
                print(f"⚠️ Gemini ({model_name}) Warning: {e}. កំពុងសាកល្បងម៉ូដែលបន្ទាប់...")
                continue

        print(f"⚠️ Gemini Vision Error: ម៉ូដែលទាំងអស់មិនអាចឆ្លើយតបបានទេ: {last_error}")
        return None

    def scan_image(self, img_pil: Image.Image) -> dict:
        """Process slip image from PIL Image"""
        qr_info = self.scan_qr_code(img_pil)
        
        # Extract via AI
        data = self.extract_with_gemini(img_pil)
        if not data:
            data = {
                "bank_name": "Unknown",
                "transaction_type": None,
                "amount": None,
                "currency": None,
                "sender_name": None,
                "sender_account": None,
                "receiver_name": None,
                "receiver_account": None,
                "transaction_id": None,
                "date": None,
                "time": None
            }
        
        if qr_info.get("qr_currency"):
            data["currency"] = qr_info["qr_currency"]
        if qr_info.get("qr_amount") and not data.get("amount"):
            data["amount"] = qr_info["qr_amount"]

        data.update(qr_info)

        # Print detailed report to Terminal
        self.print_terminal_report(data)

        return data

    def print_terminal_report(self, data: dict):
        """បង្ហាញព័ត៌មានលម្អិតនៃការស្គែនវិក្កយបត្រលើ Terminal យ៉ាងស្រស់ស្អាត"""
        amt_str = str(data.get('amount') or '0')
        curr = str(data.get('currency') or 'USD').upper()
        
        try:
            amt_num = float(amt_str.replace(',', ''))
            is_khr = curr in ['KHR', '៛', 'RIEL'] or (amt_num >= 1000 and 'USD' not in curr and '$' not in curr)
            credits = round(amt_num / 4000.0, 2) if is_khr else round(amt_num, 2)
            calc_info = f"+{credits:,.2f} Credits ({'អត្រា ៤,០០០៛ = ១ Credit' if is_khr else 'អត្រា $1 = 1 Credit'})"
        except Exception:
            calc_info = "N/A"

        print("\n" + "="*62, flush=True)
        print("🧾 [RECEIPT SCANNER] លទ្ធផលស្គែនវិក្កយបត្រ (SLIP SCAN RESULT):", flush=True)
        print("="*62, flush=True)
        print(f"🏦 ធនាគារ (Bank):          {data.get('bank_name') or 'N/A'}", flush=True)
        print(f"💰 ទឹកប្រាក់ (Amount):       {amt_str} {curr}", flush=True)
        print(f"💱 រូបិយប័ណ្ណ (Currency):     {curr} {'(ប្រាក់រៀល ៛)' if 'KHR' in curr or '៛' in curr else '(ប្រាក់ដុល្លារ $)'}", flush=True)
        print(f"✨ CREDITS ទទួលបាន:       {calc_info}", flush=True)
        print(f"👤 អ្នកផ្ញើ (Sender):        {data.get('sender_name') or 'N/A'} (គណនី: {data.get('sender_account') or 'N/A'})", flush=True)
        print(f"📥 អ្នកទទួល (Receiver):      {data.get('receiver_name') or 'N/A'} (គណនី: {data.get('receiver_account') or 'N/A'})", flush=True)
        print(f"🔖 លេខប្រតិបត្តិការ (Trx ID): {data.get('transaction_id') or 'N/A'}", flush=True)
        print(f"📅 កាលបរិច្ឆេទ (Date/Time):   {data.get('date') or 'N/A'} {data.get('time') or ''}", flush=True)
        if data.get('qr_found'):
            print(f"📱 KHQR Code Payload:      រកឃើញ (Currency={data.get('qr_currency')}, Amount={data.get('qr_amount')})", flush=True)
        else:
            print("📱 KHQR Code Payload:      មិនមាន QR កូដ (ស្គែនដោយ AI Vision)", flush=True)
        print("="*62 + "\n", flush=True)

    def scan_file_path(self, file_path: str) -> dict:
        """Process slip image from local file path"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"រកមិនឃើញរូបភាព: {file_path}")
        img_pil = Image.open(file_path)
        return self.scan_image(img_pil)


# ----------------------------------------------------
# Flask REST API Server Setup
# ----------------------------------------------------
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)
scanner = BankSlipScanner()


@app.route("/", methods=["GET"])
def index():
    """Route មេសម្រាប់បង្ហាញ UI index.html"""
    index_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "index.html")
    if os.path.exists(index_path):
        return send_file(index_path)
    return jsonify({
        "message": "Bank Slip Scanner API Server is running.",
        "api_endpoint": "POST /api/scan-slip"
    })


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "online",
        "gemini_ready": bool(scanner.client),
        "pyzbar_ready": PYZBAR_AVAILABLE
    })


@app.route("/api/scan-slip", methods=["POST"])
def api_scan_slip():
    """
    API Endpoint មេសម្រាប់ទទួលរូបភាព Slip មកស្គែន
    គាំទ្រ:
      1. multipart/form-data (key: file, image, ឬ slip)
      2. application/json (key: image_base64)
    """
    img_pil = None

    # ១. ទទួលជា File Upload (Form Data)
    if 'file' in request.files:
        img_pil = Image.open(request.files['file'].stream)
    elif 'image' in request.files:
        img_pil = Image.open(request.files['image'].stream)
    elif 'slip' in request.files:
        img_pil = Image.open(request.files['slip'].stream)

    # ២. ទទួលជា Base64 JSON
    elif request.is_json:
        req_data = request.get_json()
        if 'image_base64' in req_data:
            base64_str = req_data['image_base64']
            if ',' in base64_str:
                base64_str = base64_str.split(',')[1]
            img_bytes = base64.b64decode(base64_str)
            img_pil = Image.open(io.BytesIO(img_bytes))

    if img_pil is None:
        return jsonify({
            "success": False,
            "error": "សូមផ្ញើរូបភាពតាមរយៈ 'file' (form-data) ឬ 'image_base64' (JSON)"
        }), 400

    try:
        # ដំណើរការស្គែន
        result = scanner.scan_image(img_pil)
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ----------------------------------------------------
# Main Execution Entry
# ----------------------------------------------------
if __name__ == "__main__":
    # បើដំណើរការ command ជាមួយ argument រូបភាព (e.g. python server.py slip.jpg)
    if len(sys.argv) > 1 and sys.argv[1].lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.bmp')):
        image_path = sys.argv[1]
        print(f"📸 កំពុងស្គែនរូបភាព: {image_path}")
        res = scanner.scan_file_path(image_path)
        print("\n" + "=" * 60)
        print(" 📋 លទ្ធផលស្គែន (Extracted Slip Details)")
        print("=" * 60)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        print("=" * 60)
    else:
        # ដំណើរការ Server API (Port 5005 ដើម្បីកុំឱ្យជាន់គ្នាជាមួយ Node Backend 5000)
        port = int(os.getenv("PORT", 5005))
        print("=" * 60)
        print(f" 🚀 Bank Slip Scanner API Server ដំណើរការលើ http://localhost:{port}")
        print(f" 📖 API Endpoint: POST http://localhost:{port}/api/scan-slip")
        print("=" * 60)
        app.run(host="0.0.0.0", port=port, debug=False)

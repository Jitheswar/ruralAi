# Mobile OCR Auth Checklist

## Goal
Verify the prescription scanner always sends `Authorization: Bearer <token>` to `POST /api/ocr/prescription`.

## Preconditions
1. API server running on `http://10.0.2.2:8000` (Android emulator) or configured base URL.
2. Mobile app user is logged in with a valid Supabase session.
3. At least one sample prescription image available.

## Steps
1. Open the mobile app and log in.
2. Navigate to `Prescription Scanner`.
3. Choose image from camera or gallery.
4. Capture network traffic with one of:
   - React Native debugger network inspector
   - proxy tool (Charles/mitmproxy)
   - API server request logs
5. Locate the `POST /api/ocr/prescription` request.

## Expected Results
1. Request includes header: `Authorization: Bearer <jwt>`.
2. Backend does not return `401 Missing Authorization header`.
3. Response contains:
   - `prescription.raw_text`
   - `prescription.ocr_engine`
   - `prescription.ocr_confidence`
   - `prescription.warnings`

## Negative Test
1. Force logout and retry scanner upload.
2. Expected: client-side error indicating login is required; request should not proceed without token.

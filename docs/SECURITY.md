# Security notes

- All public inputs are validated on both the frontend and backend.
- File uploads are restricted to `.txt`, `.pdf`, and `.docx` and scanned for valid signatures before processing.
- The application rejects empty or malformed documents and rejects oversized files.
- Uploaded files are not executed and are only parsed as text.
- The backend uses CORS, rate limiting, security headers, and generic error responses.
- Environment variables hold secrets rather than hardcoded credentials.
- Do not store uploaded articles by default; if history is offered, consent must be explicit and deletion must be supported.

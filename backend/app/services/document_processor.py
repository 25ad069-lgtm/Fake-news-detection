import os
import re
import zipfile
from io import BytesIO
from pathlib import Path

import pypdf
from docx import Document
from fastapi import UploadFile

ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx"}
MAX_TEXT_LENGTH = 20000


def _has_pdf_signature(data: bytes) -> bool:
    return data.startswith(b"%PDF")


def _is_docx(data: bytes) -> bool:
    try:
        with zipfile.ZipFile(BytesIO(data)) as zf:
            names = set(zf.namelist())
            return "word/document.xml" in names
    except zipfile.BadZipFile:
        return False


def validate_filename(filename: str | None) -> str:
    if not filename:
        raise ValueError("A file is required.")
    safe_name = Path(filename).name
    if not safe_name or safe_name in {".", ".."}:
        raise ValueError("Invalid filename.")
    ext = Path(safe_name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type. Allowed formats: .txt, .pdf, .docx")
    return safe_name


def extract_text_from_upload(file: UploadFile, max_size_bytes: int = 5 * 1024 * 1024) -> str:
    if file is None:
        raise ValueError("No file uploaded.")

    filename = validate_filename(file.filename)
    data = file.file.read()
    if len(data) == 0:
        raise ValueError("Uploaded document is empty.")
    if len(data) > max_size_bytes:
        raise ValueError("Uploaded file exceeds the 5 MB upload limit.")

    extension = Path(filename).suffix.lower()
    text = ""

    if extension == ".txt":
        if not _looks_like_text(data):
            raise ValueError("The text file does not contain readable content.")
        try:
            text = data.decode("utf-8-sig")
        except UnicodeDecodeError:
            try:
                text = data.decode("latin-1")
            except UnicodeDecodeError as exc:
                raise ValueError("Text file is not decodable as valid UTF-8 or Latin-1 text.") from exc
    elif extension == ".pdf":
        if not _has_pdf_signature(data):
            raise ValueError("The PDF file signature is invalid.")
        try:
            reader = pypdf.PdfReader(BytesIO(data))
            pages = []
            for page in reader.pages:
                content = page.extract_text() or ""
                pages.append(content)
            text = "\n".join(pages)
        except Exception as exc:  # pragma: no cover - defensive but user-facing generic error
            raise ValueError("The PDF could not be parsed reliably.") from exc
    elif extension == ".docx":
        if not _is_docx(data):
            raise ValueError("The DOCX file signature is invalid.")
        try:
            doc = Document(BytesIO(data))
            text = "\n".join(paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip())
        except Exception as exc:
            raise ValueError("The DOCX file could not be parsed reliably.") from exc

    cleaned = normalize_text(text)
    if not cleaned:
        raise ValueError("The uploaded document does not contain readable text.")
    if len(cleaned) > MAX_TEXT_LENGTH:
        raise ValueError(f"The extracted text exceeds the {MAX_TEXT_LENGTH} character limit.")
    return cleaned


def normalize_text(raw_text: str) -> str:
    text = raw_text.replace("\x00", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _looks_like_text(data: bytes) -> bool:
    sample = data[:2048].decode("utf-8", errors="ignore")
    stripped = sample.strip()
    return bool(stripped) and not all(ch in "\x00\ufffd" for ch in stripped)

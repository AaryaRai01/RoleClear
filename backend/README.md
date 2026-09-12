# RoleClear Smart Apply Backend

Run:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Health: http://127.0.0.1:8000/health
Swagger: http://127.0.0.1:8000/docs

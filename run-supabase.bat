@echo off
cd /d %~dp0
echo Starting Supabase MCP Server...
call .venv\Scripts\activate.bat || call venv\Scripts\activate.bat
python -m supabase_mcp.main 
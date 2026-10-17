@echo off
cd /d "%~dp0"
python pipeline.py --workers 2
pause

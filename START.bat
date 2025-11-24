@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🧟 Thread of the Dead
echo   死者が書き込む掲示板
echo ========================================
echo.
echo 起動中...
echo.

REM バックエンド起動
echo [1/2] バックエンドを起動しています...
start "Thread Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

REM フロントエンド起動
echo [2/2] フロントエンドを起動しています...
start "Thread Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ✅ 起動完了！
echo.
echo 📱 アクセスURL:
echo    メインページ: http://localhost:3000
echo    コスト監視:   http://localhost:3000/stats
echo    API Health:   http://localhost:3001/api/health
echo.
echo 💡 停止するには各ウィンドウで Ctrl+C を押してください
echo.
pause

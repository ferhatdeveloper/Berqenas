@echo off

echo [GO BACKEND] Başlatılıyor...
start "Go Backend" cmd /k "cd backend\go && go run main.go"

echo [NODE BACKEND] Bağımlılıklar yükleniyor...
cd backend\node
call npm install
echo [NODE BACKEND] Başlatılıyor...
start "Node Backend" cmd /k "node app.js"
cd ..\..

echo [FRONTEND] Bağımlılıklar yükleniyor...
cd src
call npm install
echo [FRONTEND] Başlatılıyor...
start "Frontend" cmd /k "npm run dev"
cd ..

echo Tüm servisler başlatıldı. Her biri ayrı terminalde çalışıyor.
pause 
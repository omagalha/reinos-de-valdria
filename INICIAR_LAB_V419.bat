@echo off
setlocal
title Reinos de Valdria - Classes e combate v4.19

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado.
  echo Instale a versao LTS em https://nodejs.org e execute este arquivo novamente.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando as dependencias pela primeira vez...
  call npm install
  if errorlevel 1 (
    echo Nao foi possivel instalar as dependencias.
    pause
    exit /b 1
  )
)

echo Iniciando classes e combate Phaser v4.19...
call npm run dev:lab

endlocal

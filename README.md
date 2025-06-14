# Frontend - Inventario

Este repositorio contiene el frontend del módulo de **inventario y despacho** del sistema Construtem.

## 🛠️ Tecnologías
- Next.js
  
## 🚀 Funcionalidades
- Visualización del stock en bodegas y sucursales.
- Registro y actualización de productos.
- Gestión de despachos y movimientos de inventario.

## Requisitos

- Docker Desktop instalado
- Git instalado  

## Instalación (entorno de desarrollo)

1. Clonar el repositorio en el directorio deseado:

*Desde la terminal debe situarse en el directorio que desee clonar repo (ej: "C:\Users\Admin\Desktop") y ejecutar siguiente comando*

<details>

<summary>**¿Cómo situarse en C:\Users\Admin\Desktop?**</summary>

1. Abrir terminal (Ya sea powershell, cmd, git bash, etc)
2. Te encontrarás situado en C:\Users\Admin o algo así
3. Debes ejecutar el comando
```bash
cd .\Desktop\
```
*Cualquier consulta escribirme a wsp +56979828311*
</details>

```bash
git clone https://github.com/Construtem/frontend-inventario
cd frontend-inventario
```
2. Correr aplicación desde directorio creado (ej "C:\Users\Admin\Desktop\frontend-inventario"),
ejecutando el siguiente comando:
```bash
docker compose up
```
*Luego de ejecutar este comando, su app se encontrará corriendo en el puerto 3000 en "http://localhost:3000"*

## Contribución

1. Crea una rama para tu funcionalidad/tarea:

```bash
git switch -c feature/<nombre-funcionalidad>
```

2. Realiza cambios y haz commit:

```bash
git add <archivos-cambiados>
git commit -m "<descripcion pequeña del cambio>"
```

3. Pushea tus cambios de la rama:

```bash
git push origin feature/<nombre-funcionalidad> 
```

4. Crea un Pull Request (PR) a la rama ´develop´ desde GitHub para que sea revisado por otro desarrollador
   
## Figma actualizado (14-06-2025)

Recomendado el presionar la tecla "R" para reiniciar el flujo del prototipo

```
https://www.figma.com/proto/ygP5mPt65d8en1cby2jYLy/Vistas-para-primer-sprint?node-id=296-2563&p=f&t=wcbC6NsTfl34sHR5-1&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=243%3A39
```

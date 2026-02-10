# 🚀 Guía Rápida - Subir a GitHub

## Paso 1: Inicializar Git (solo primera vez)

```bash
# Inicializar repositorio
git init

# Configurar tu usuario (si no lo hiciste antes)
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

## Paso 2: Crear repositorio en GitHub

1. Ve a https://github.com
2. Click en "New repository" (botón verde)
3. Nombre: `catalogo-productos` (o el que prefieras)
4. Descripción: "Catálogo web de productos con búsqueda"
5. Público o Privado (elige según prefieras)
6. **NO** marques "Add README" (ya lo tenemos)
7. Click en "Create repository"

## Paso 3: Subir tu código

```bash
# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit - Catálogo de productos mejorado"

# Conectar con GitHub (reemplaza TU-USUARIO y TU-REPO)
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git

# Subir al repositorio
git branch -M main
git push -u origin main
```

## Actualizaciones futuras

Cuando hagas cambios:

```bash
# Ver qué cambió
git status

# Agregar cambios
git add .

# Hacer commit con mensaje descriptivo
git commit -m "Descripción de los cambios"

# Subir cambios
git push
```

## 🌐 Activar GitHub Pages (hosting gratis)

1. En tu repositorio de GitHub, ve a **Settings**
2. En el menú lateral, click en **Pages**
3. En "Source", selecciona la rama **main**
4. Click en **Save**
5. ¡Espera 1-2 minutos y tu sitio estará en:
   `https://TU-USUARIO.github.io/TU-REPO`

## 📌 Comandos útiles

```bash
# Ver el estado de los archivos
git status

# Ver el historial de commits
git log --oneline

# Ver diferencias antes de commit
git diff

# Deshacer cambios no guardados
git checkout -- archivo.js

# Crear una nueva rama para experimentar
git checkout -b nueva-funcionalidad
```

## 🆘 Problemas comunes

**"Permission denied":**
```bash
# Configura tu token de GitHub como contraseña
# O usa SSH: https://docs.github.com/es/authentication/connecting-to-github-with-ssh
```

**"Repository not found":**
```bash
# Verifica la URL del repositorio
git remote -v

# Si está mal, corrígela:
git remote set-url origin https://github.com/USUARIO-CORRECTO/REPO-CORRECTO.git
```

**Conflictos al hacer push:**
```bash
# Primero trae los cambios
git pull origin main

# Resuelve conflictos si los hay
# Luego haz push
git push
```

## 📱 Siguiente paso

Una vez subido, personaliza:
- `PRODUCTOS.csv` con tus productos reales
- Agrega tus imágenes a las carpetas FOTOS
- Ajusta los colores en `styles.css`
- Modifica el README con tu información

---

💡 **Tip**: Haz commits frecuentes con mensajes claros. Es mejor muchos commits pequeños que uno gigante.

# 🤖 IBATÍN Chatbot Server

Backend seguro para el asistente virtual iBotin de Fundación IBATÍN.

## 🚀 Inicio Rápido

### 1. Instalar dependencias (solo la primera vez)

```bash
npm install
```

### 2. Configurar variables de entorno

Creá un archivo `.env` en esta carpeta con:

```env
OPENAI_API_KEY=tu_api_key_aqui
ASSISTANT_ID=tu_assistant_id_aqui
PORT=3001
```

### 3. Iniciar el servidor

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3001`

## ✅ Verificar que funciona

Abrí en tu navegador:
- **Health check:** http://localhost:3001/api/health

Deberías ver un JSON con `"status": "ok"`

## 🔧 Solución de Problemas

### El chatbot no se conecta

1. **Verificá que el servidor esté corriendo**
   - Debe estar activo en la terminal
   - Buscá el mensaje: "🤖 IBATÍN Chatbot Server - ACTIVO"

2. **Verificá el puerto**
   - Por defecto usa el puerto 3001
   - Si está ocupado, cambiá el `PORT` en `.env`

3. **Verificá las credenciales**
   - Asegurate de que `OPENAI_API_KEY` sea válida
   - Verificá que `ASSISTANT_ID` sea correcto

### Error de conexión en el navegador

Si ves "No puedo conectarme al servidor":
- Asegurate de que el servidor esté corriendo
- Verificá que no haya firewall bloqueando localhost:3001
- Recargá la página web

## 📝 Endpoints

- `GET /api/health` - Verificar estado del servidor
- `POST /api/thread` - Crear nueva conversación
- `POST /api/chat` - Enviar mensaje al asistente

## 🛠️ Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# Modo desarrollo (igual que start)
npm run dev
```

## 💡 Notas

- **Mantené la terminal abierta** mientras uses el chatbot
- El servidor debe estar corriendo para que el chatbot funcione
- Las API keys nunca se exponen al navegador (seguridad)
- Cada sesión crea un nuevo thread automáticamente

## 📞 Soporte

Si tenés problemas, verificá:
1. ✅ Servidor corriendo
2. ✅ Variables de entorno configuradas
3. ✅ Puerto 3001 disponible
4. ✅ Conexión a internet activa

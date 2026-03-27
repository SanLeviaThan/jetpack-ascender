# Jetpack Ascender

**Jetpack Ascender** es un juego arcade de supervivencia vertical desarrollado con **Phaser 3**, centrado en partidas rápidas, progresión por altura, competencia por récord y esa clásica sensación de **“una partida más”**.

El objetivo del jugador es ascender usando un jetpack, administrar bien el combustible, esquivar peligros, sobrevivir a los enemigos y llegar cada vez más alto atravesando distintas capas atmosféricas mientras intenta superar su mejor marca.

---

## Descripción general

Jetpack Ascender fue pensado como una experiencia fácil de entender, pero difícil de dominar.

La idea base del juego es simple:

- subir lo más alto posible
- sobrevivir el mayor tiempo posible
- administrar combustible
- evitar enemigos y peligros
- mejorar partida tras partida
- superar tu mejor distancia
- competir en el ranking online

El juego busca combinar:

- **inmediatez arcade**
- **desafío retro**
- **partidas cortas y rejugables**
- **progresión visual clara**
- **motivación por puntaje y récord**

---

## Estado del proyecto

> **Estado actual: En desarrollo**

Jetpack Ascender ya es jugable, pero sigue en desarrollo activo.  
La versión actual ya cuenta con el bucle principal de juego, sistema de puntaje/ranking, HUD, sistema de vidas, combustible y progresión por capas de altura.

En futuras actualizaciones pueden agregarse:

- nuevos tipos de enemigos
- más variedad visual y ambiental
- nuevos eventos durante la partida
- mejoras de balance
- mejores transiciones entre capas
- coleccionables y recompensas
- mejoras visuales y sonoras

Se aceptan sugerencias, ideas y feedback para seguir mejorándolo.

---

## Características principales

### Jugabilidad principal
- Supervivencia vertical
- Movimiento con jetpack
- Progresión por altura
- Gestión de combustible
- Sistema de vidas / salud
- Dificultad creciente con el avance
- Reinicio rápido para rejugar enseguida

### Estructura arcade
- Diseñado para partidas cortas e intensas
- Enfoque en récord y supervivencia
- Filosofía de “probar otra vez”
- Fácil de aprender, más difícil de dominar

### Progresión e inmersión
- Distintas capas o zonas atmosféricas
- HUD con información útil en tiempo real
- Sensación constante de ascenso
- Presión progresiva orientada al puntaje

### Ranking online
- Tabla global integrada con **Supabase**
- Sistema de nombre único por jugador
- Actualización del mejor récord
- Rejugabilidad competitiva

### Audio
- Sonido generado mediante **WebAudio API**
- Sin depender de archivos de audio externos
- Enfoque liviano para mantener el proyecto ágil

---

## Tecnologías utilizadas

- **HTML5**
- **CSS3**
- **JavaScript**
- **Phaser 3**
- **Supabase** para ranking / leaderboard
- **WebAudio API** para efectos y audio dinámico

---

## Objetivos de diseño

Jetpack Ascender fue desarrollado alrededor de varios objetivos claros:

### 1. Jugabilidad inmediata
Que el jugador pueda entrar, entender el objetivo y empezar a jugar sin vueltas.

### 2. Rejugabilidad fuerte
Que las partidas sean cortas, tensas y den ganas de intentarlo una vez más.

### 3. Progreso por habilidad
Que cada intento sirva para mejorar movimiento, reflejos y toma de decisiones.

### 4. Identidad arcade
Que se sienta como una experiencia arcade moderna con alma retro, no como un juego lento o recargado.

### 5. Entrega liviana por navegador
Que funcione directo en web con la menor fricción posible.

---

## Bucle de juego

Una partida típica sigue esta estructura:

1. Iniciar el juego
2. Controlar al personaje con el jetpack
3. Ascender a través del escenario
4. Esquivar enemigos y peligros
5. Administrar combustible y sobrevivir
6. Alcanzar una mayor altura
7. Perder la partida
8. Comparar o registrar el puntaje
9. Reintentar de inmediato

Ese es el corazón del juego.

---

## Controles

> Ajustar esta sección si los controles finales cambian.

### Teclado
- **Izquierda / Derecha** → mover al personaje
- **Impulso / jetpack** → ascender
- **Interacción con menú** → teclado

Si en la versión final usás otra distribución de teclas, esta sección se actualiza con los controles exactos.

---

## Información mostrada en pantalla

El HUD está pensado para dar información constante durante la partida.

Puede incluir:

- altura actual
- nivel de combustible
- vidas o salud
- datos de puntaje
- capa o zona actual

Esto ayuda a reforzar la sensación de progresión vertical y tensión constante.

---

Modo testeo: Jetpack Ascender se encuentra actualmente en fase de pruebas. Esta versión está disponible para testear mecánicas, dificultad, rendimiento y sensaciones generales de juego. Si encontrás errores o tenés ideas para mejorarlo, toda devolución suma. Podés probarlo acá: https://sanleviathan.github.io/jetpack-ascender/

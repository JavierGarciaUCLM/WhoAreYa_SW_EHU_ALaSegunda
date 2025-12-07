# Milestone 8: Número de Camiseta

## Array `attribs`

**Propósito:** Define la lista de atributos que se comparan y muestran para cada jugador adivinado.

**Funcionamiento:** Se añadió el atributo `'number'` al final del array, incrementando el número de atributos de 5 a 6. Este array se utiliza para iterar sobre todos los atributos durante la comparación y visualización.

## Función `check()`

**Propósito:** Compara un atributo específico del jugador adivinado con el jugador misterioso y determina si coincide, es mayor o menor.

**Funcionamiento:** Se añadió una condición específica para manejar el atributo del número de camiseta. La lógica es similar a la de la edad: si los números coinciden, devuelve "correct"; si el número adivinado es menor que el del jugador misterioso, devuelve "higher" (indicando que el jugador misterioso tiene un número mayor); si es mayor, devuelve "lower" (indicando que el jugador misterioso tiene un número menor).

## Función `setContent()`

**Propósito:** Genera el contenido visual que se mostrará para cada uno de los atributos del jugador adivinado.

**Funcionamiento:** Se añadió la lógica para procesar y formatear el número de camiseta. Primero se verifica el resultado de la comparación mediante la función check. Luego se crea una cadena de texto con el número del jugador. Si el número no coincide, se añade una flecha hacia arriba si el jugador misterioso tiene un número mayor, o una flecha hacia abajo si tiene un número menor. Finalmente, este valor formateado se añade al array de retorno como sexto elemento.

## Función `showContent()`

**Propósito:** Renderiza visualmente la fila completa con todos los atributos del jugador adivinado en la interfaz.

**Funcionamiento:** Se ajustó el ancho de cada contenedor de atributo para distribuir equitativamente los 6 atributos en lugar de 5, asegurando que todos quepan en una sola fila horizontal.

## Resultado final

El juego ahora muestra 6 atributos por jugador en lugar de 5. Cada fila de intento incluye: nacionalidad, liga, equipo, posición, edad y número de camiseta. El número de camiseta se muestra con indicadores visuales cuando no coincide: flecha arriba si el jugador misterioso tiene un número mayor, flecha abajo si tiene un número menor. Si coincide exactamente, se muestra en verde junto con los demás atributos correctos.

## Listado de cambios

1. Se añadió `'number'` al array `attribs` para incluir el número de camiseta en las comparaciones.
2. Se modificó la función `check()` para manejar la comparación del número de camiseta con lógica similar a la edad.
3. Se modificó la función `setContent()` para generar el display formateado del número de camiseta con indicadores de flecha.
4. Se modificó la función `showContent()` para cambiar el ancho de los contenedores de `w-1/5` a `w-1/6` y acomodar 6 atributos.

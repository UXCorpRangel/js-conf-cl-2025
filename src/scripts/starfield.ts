export class StarField {
  // Elemento canvas donde se dibuja
  private readonly canvas: HTMLCanvasElement
  // Contexto de renderizado 2D del canvas
  private readonly context: CanvasRenderingContext2D | null

  // Lista de estrellas (posición, opacidad, velocidad)
  private stars: Array<{ x: number, y: number, alpha: number, speed: number }> = []

  // Lista de cometas (posición, velocidad, cola, opacidad)
  private comets: Array<{
    x: number // Posición X
    y: number // Posición Y
    tail: number[] // Puntos de la cola del cometa
    speedX: number // Velocidad horizontal
    speedY: number // Velocidad vertical
    opacity: number // Opacidad
  }> = []

  // Dimensiones del canvas
  private canvasWidth: number
  private canvasHeight: number

  // Constantes configurables
  private readonly STAR_COUNT = 200 // Número total de estrellas
  private readonly COMET_PROBABILITY = 0.005 // Probabilidad de generar un cometa en cada frame
  private readonly STAR_RADIUS = 1.5 // Radio de las estrellas
  private readonly STAR_COLOR = '255, 255, 255' // Color de las estrellas y cometas (RGB)

  constructor(canvas: HTMLCanvasElement) {
    // Inicializar el canvas y el contexto 2D
    this.canvas = canvas
    this.context = this.canvas.getContext('2d')
    this.canvasWidth = this.getCanvasWidth()
    this.canvasHeight = this.getCanvasHeight()

    if (this.context) {
      // Inicializar estrellas, cometas y animación
      this.initStars()
      this.resizeCanvas()
      this.initComets()
      this.animate()
      // Actualizar dimensiones al cambiar el tamaño de la ventana
      window.addEventListener('resize', this.onResize.bind(this))
    } else {
      console.error('El contexto 2D no se pudo obtener.')
    }
  }

  // Obtener el ancho actual del canvas
  private getCanvasWidth(): number {
    return this.canvas.clientWidth
  }

  // Obtener la altura actual del canvas
  private getCanvasHeight(): number {
    return this.canvas.clientHeight
  }

  // Ajustar las dimensiones del canvas al tamaño actual
  private resizeCanvas(): void {
    this.canvas.width = this.canvasWidth
    this.canvas.height = this.canvasHeight
  }

  // Crear estrellas iniciales con posiciones y parámetros aleatorios
  private initStars(): void {
    this.stars = []

    for (let i = 0; i < this.STAR_COUNT; i++) {
      this.stars.push({
        x: Math.random() * this.canvasWidth, // Posición X aleatoria
        y: Math.random() * this.canvasHeight, // Posición Y aleatoria
        alpha: Math.random(), // Transparencia inicial
        speed: Math.random() * 0.005 + 0.002 // Velocidad de parpadeo
      })
    }
  }

  // Crear cometas iniciales que se mueven desde el borde derecho
  private initComets(): void {
    for (let i = 0; i < 2; i++) {
      const y = Math.random() * this.canvasHeight // Altura aleatoria
      this.comets.push({
        x: this.canvasWidth, // Posición inicial en el borde derecho
        y,
        speedX: -(Math.random() * 3 + 2), // Velocidad horizontal hacia la izquierda
        speedY: -(Math.random() * 2 - 1), // Velocidad vertical (arriba o abajo)
        tail: [], // Inicialmente sin cola
        opacity: 1 // Completamente visible al inicio
      })
    }
  }

  // Dibujar todas las estrellas en el canvas
  private drawStars(): void {
    if (!this.context) return

    this.stars.forEach((star) => {
      // Actualizar la transparencia de la estrella para simular parpadeo
      star.alpha += star.speed
      if (star.alpha > 1 || star.alpha < 0) {
        star.speed = -star.speed // Invertir la dirección del parpadeo
      }

      if (this.context) {
        // Dibujar la estrella como un círculo
        this.context.fillStyle = `rgba(${this.STAR_COLOR}, ${Math.abs(star.alpha)})`
        this.context.beginPath()
        this.context.arc(star.x, star.y, this.STAR_RADIUS, 0, Math.PI * 2)
        this.context.fill()
      }
    })
  }

  // Generar un nuevo cometa desde un borde del canvas
  private generateComet(): void {
    if (Math.random() < this.COMET_PROBABILITY) {
      const edge = Math.floor(Math.random() * 4) // Borde aleatorio (0: derecha, 1: izquierda, 2: arriba, 3: abajo)
      let x, y, speedX, speedY

      if (edge === 0) {
        // Desde el borde derecho
        x = this.canvasWidth
        y = Math.random() * this.canvasHeight
        speedX = -(Math.random() * 3 + 2)
        speedY = Math.random() * 2 - 1
      } else if (edge === 1) {
        // Desde el borde izquierdo
        x = 0
        y = Math.random() * this.canvasHeight
        speedX = Math.random() * 3 + 2
        speedY = Math.random() * 2 - 1
      } else if (edge === 2) {
        // Desde el borde superior
        x = Math.random() * this.canvasWidth
        y = 0
        speedX = Math.random() * 2 - 1
        speedY = Math.random() * 3 + 2
      } else {
        // Desde el borde inferior
        x = Math.random() * this.canvasWidth
        y = this.canvasHeight
        speedX = Math.random() * 2 - 1
        speedY = -(Math.random() * 3 + 2)
      }

      // Añadir el cometa a la lista
      this.comets.push({
        x,
        y,
        speedX,
        speedY,
        tail: [],
        opacity: 1
      })
    }
  }

  // Dibujar todos los cometas en el canvas
  private drawComets(): void {
    if (!this.context) return

    // Filtrar cometas que han desaparecido (opacidad <= 0)
    this.comets = this.comets.filter((comet) => comet.opacity > 0)

    this.comets.forEach((comet) => {
      // Dibujar la cabeza del cometa como un círculo brillante
      if (this.context) {
        this.context.fillStyle = `rgba(${this.STAR_COLOR}, ${comet.opacity})`
        this.context.beginPath()
        this.context.arc(comet.x, comet.y, this.STAR_RADIUS * 2, 0, Math.PI * 2)
        this.context.fill()
      }

      // Añadir posición actual a la cola
      comet.tail.push(comet.x, comet.y)
      if (comet.tail.length > 40) comet.tail.splice(0, 2) // Limitar la longitud de la cola

      // Dibujar la cola como una línea
      if (this.context) {
        this.context.strokeStyle = `rgba(${this.STAR_COLOR}, ${comet.opacity * 0.5})`
        this.context.lineWidth = 2
        this.context.beginPath()
        this.context.moveTo(comet.tail[0], comet.tail[1])

        for (let i = 2; i < comet.tail.length; i += 2) {
          this.context.lineTo(comet.tail[i], comet.tail[i + 1])
        }

        this.context.stroke()
      }

      // Actualizar posición y opacidad del cometa
      comet.x += comet.speedX
      comet.y += comet.speedY
      comet.opacity -= 0.005 // Reducir la opacidad con el tiempo
    })
  }

  // Ciclo de animación
  private animate(): void {
    if (!this.context) return

    // Limpiar el canvas para el siguiente frame
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

    // Dibujar estrellas y cometas
    this.drawStars()
    this.generateComet()
    this.drawComets()

    // Solicitar el próximo frame de animación
    requestAnimationFrame(this.animate.bind(this))
  }

  // Actualizar dimensiones del canvas y reconfigurar estrellas tras un cambio de tamaño
  private onResize(): void {
    this.canvasWidth = this.getCanvasWidth()
    this.canvasHeight = this.getCanvasHeight()
    this.resizeCanvas()
    this.initStars() // Reposicionar las estrellas según las nuevas dimensiones
  }
}

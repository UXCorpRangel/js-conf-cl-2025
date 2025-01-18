import type { ParallaxEffectOptions } from '@contracts'

export class ParallaxEffect {
  private container: HTMLElement | null
  private children: HTMLElement[]
  private maxDisplacement: number
  private isVisible: boolean = false
  private observer: IntersectionObserver

  constructor(options: ParallaxEffectOptions) {
    const {
      containerSelector,
      childsSelector,
      maxDisplacement,
      visibilityThreshold = 0.1
    } = options

    // Selecciona el contenedor principal
    this.container = document.querySelector(containerSelector)
    if (!this.container) {
      throw new Error(
        `El contenedor con selector "${containerSelector}" no fue encontrado.`
      )
    }

    // Selecciona los elementos hijos
    this.children = Array.from(this.container.querySelectorAll(childsSelector))
    if (this.children.length === 0) {
      throw new Error(
        `No se encontraron elementos con el selector "${childsSelector}" dentro del contenedor.`
      )
    }

    this.maxDisplacement = maxDisplacement

    // Configura el IntersectionObserver
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.isVisible = entry.isIntersecting // Actualiza el estado de visibilidad
      },
      { threshold: visibilityThreshold, rootMargin: '0px 0px 0px 70%' } // Umbral de visibilidad
    )

    // Observa el contenedor
    this.observer.observe(this.container)

    // Asocia el evento de desplazamiento
    this.initScrollListener()
  }

  /**
   * Inicializa el listener para el evento de desplazamiento.
   */
  private initScrollListener() {
    window.addEventListener('scroll', this.handleScroll.bind(this), {
      passive: true
    })
  }

  /**
   * Aplica el efecto parallax a los elementos hijos.
   * Solo se ejecuta si el contenedor es visible.
   */
  private handleScroll() {
    if (!this.isVisible) return

    const offset = this.container!.getBoundingClientRect().top // Posición del contenedor respecto al viewport

    const totalChildren = this.children.length

    this.children.forEach((child, index) => {
      // Hacer que el primer hijo se mueva mucho más en relación al scroll
      // Los hijos del fondo se mueven mucho menos.
      const displacementMultiplier = 1 + (1 - index / (totalChildren - 1)) * 0.05 // Multiplicador progresivo más grande para el primer hijo
      const maxDisplacementForChild = this.maxDisplacement * displacementMultiplier

      // Calcula el desplazamiento de la capa considerando la velocidad adicional
      const targetTranslateY = Math.max(
        Math.min(
          (offset * (index + 1)) / totalChildren,
          maxDisplacementForChild
        ),
        -maxDisplacementForChild
      )

      // Suaviza el cambio usando una interpolación (con un coeficiente de suavizado)
      const currentTranslateY = parseFloat(child.style.transform.replace('translateY(', '').replace('px)', '')) || 0
      const smoothTranslateY = currentTranslateY + (targetTranslateY - currentTranslateY) * 0.1 // 0.1 es el factor de suavizado

      // Aplica la transformación suavizada
      child.style.transform = `translateY(${smoothTranslateY}px)`
    })
  }
}

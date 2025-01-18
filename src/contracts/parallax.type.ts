export interface ParallaxEffectOptions {
  containerSelector: string // Selector del contenedor del efecto parallax
  childsSelector: string // Selector de los elementos hijos a los que aplicar el efecto
  maxDisplacement: number // Desplazamiento máximo en píxeles
  visibilityThreshold?: number // Umbral de visibilidad (por defecto, 10%)
}

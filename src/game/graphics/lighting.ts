import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import type { Scene } from '@babylonjs/core/scene'

export function configureIsometricPbrLighting(scene: Scene) {
  const ambient = new HemisphericLight('ambient', new Vector3(.2, 1, .1), scene)
  ambient.intensity = .72
  ambient.diffuse = new Color3(.86, .96, .92)
  ambient.groundColor = new Color3(.26, .38, .31)

  const sun = new DirectionalLight('sun', new Vector3(-.65, -1, -.45), scene)
  sun.position = new Vector3(30, 45, 28)
  sun.intensity = 1.45
  sun.autoCalcShadowZBounds = true

  const shadows = new ShadowGenerator(1024, sun, true)
  shadows.usePercentageCloserFiltering = true
  shadows.filteringQuality = ShadowGenerator.QUALITY_MEDIUM
  shadows.bias = .0008
  shadows.normalBias = .018
  shadows.darkness = .2

  return { ambient, sun, shadows }
}

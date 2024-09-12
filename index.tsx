'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default function Component() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 20)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    const envMaps = [
      { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1%20(8)-MiNonMb0xwwD70KVwiSneYIUhOMT2P.JPG', title: '愛知県豊川市　日本列島公園', color: 0x00ff00 },
      { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pano_16-flJTojdvb80JPY0dNeJUaRvKNg5Ufv.webp', title: 'Aurora and Milyway', color: 0xff00ff },
      { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pano_7-EJyYUUjkU7rkwGkCaAuWwcjUSOrLB9.webp', title: 'infinity netscape', color: 0x00ffff },
      { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pano_5-mBddDY2j140gQU66Q74bOgaqrwq6s8.webp', title: 'vivid painting world', color: 0xff0000 },
      { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pano_9-08OHh1hDWECDqYcmDvFJ43jIjsetnS.webp', title: 'white museum', color: 0x0000ff },
      { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pano_14-VFJTj5Btsh6TaOlPiAOWh01c411QMW.webp', title: 'Neon Metropolis', color: 0xffff00 },
      { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pano_21-S0YQh6OAA5wEBiYBY8F9B696u1ASSa.webp', title: 'Futuristic Oasis', color: 0xff00ff },
    ]

    const spheres: THREE.Mesh[] = []
    const titles: THREE.Sprite[] = []

    envMaps.forEach((envMap, index) => {
      const size = 0.8 + Math.random() * 0.4 // Random size between 0.8 and 1.2
      const geometry = new THREE.SphereGeometry(size, 32, 32)
      const texture = new THREE.TextureLoader().load(envMap.url)
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide })
      const sphere = new THREE.Mesh(geometry, material)
      
      // Increased range for random positions
      sphere.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      )
      
      scene.add(sphere)
      spheres.push(sphere)

      // Add neon glow
      const glowGeometry = new THREE.SphereGeometry(size * 1.1, 32, 32)
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          c: { type: "f", value: 0.5 },
          p: { type: "f", value: 1.4 },
          glowColor: { type: "c", value: new THREE.Color(envMap.color) },
          viewVector: { type: "v3", value: camera.position }
        },
        vertexShader: `
          uniform vec3 viewVector;
          varying float intensity;
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
            intensity = pow( dot(normalize(viewVector), actual_normal), 6.0 );
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying float intensity;
          void main() {
            vec3 glow = glowColor * intensity;
            gl_FragColor = vec4( glow, 1.0 );
          }
        `,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      })

      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
      glowMesh.position.set(sphere.position.x, sphere.position.y, sphere.position.z)
      scene.add(glowMesh)

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.width = 512
      canvas.height = 128
      context.fillStyle = 'rgba(0, 0, 0, 0)'
      context.fillRect(0, 0, canvas.width, canvas.height)

      const japaneseFont = '16px DotGothic16'
      const englishFont = '24px Orbitron'

      context.font = japaneseFont
      context.fillStyle = 'white'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      
      const lines = envMap.title.split(' ')
      if (lines[0].match(/[ぁ-んァ-ン]/)) {
        context.font = japaneseFont
        context.fillText(lines[0], 256, 32)
        if (lines[1]) {
          context.font = englishFont
          context.fillText(lines[1], 256, 96)
        }
      } else {
        context.font = englishFont
        context.fillText(envMap.title, 256, 64)
      }

      const titleTexture = new THREE.CanvasTexture(canvas)
      const titleMaterial = new THREE.SpriteMaterial({ map: titleTexture })
      const titleSprite = new THREE.Sprite(titleMaterial)
      titleSprite.scale.set(4, 1, 1)
      titleSprite.position.set(sphere.position.x, sphere.position.y - size - 1, sphere.position.z)
      scene.add(titleSprite)
      titles.push(titleSprite)
    })

    // Add sun-like sphere
    const sunGeometry = new THREE.SphereGeometry(1, 32, 32)
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    const sun = new THREE.Mesh(sunGeometry, sunMaterial)
    sun.position.set(40, 40, -40)
    scene.add(sun)

    // Particle system for space background
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCnt = 10000
    const posArray = new Float32Array(particlesCnt * 3)
    const colorsArray = new Float32Array(particlesCnt * 3)

    for (let i = 0; i < particlesCnt * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100
      colorsArray[i] = Math.random()
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    let activeIndex = -1
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    window.addEventListener('click', onMouseClick)
    window.addEventListener('touchend', onTouchEnd)

    function onMouseClick(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      checkIntersection()
    }

    function onTouchEnd(event: TouchEvent) {
      const touch = event.changedTouches[0]
      mouse.x = (touch.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1
      checkIntersection()
    }

    function checkIntersection() {
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(spheres)
      if (intersects.length > 0) {
        const index = spheres.indexOf(intersects[0].object as THREE.Mesh)
        if (index !== activeIndex) {
          resetSpheresScale()
          activeIndex = index
          spheres[activeIndex].scale.setScalar(1.2)
          controls.target.copy(spheres[activeIndex].position)
        }
      }
    }

    function resetSpheresScale() {
      spheres.forEach(sphere => sphere.scale.setScalar(1))
    }

    function animate() {
      requestAnimationFrame(animate)
      controls.update()
      particlesMesh.rotation.x += 0.0002
      particlesMesh.rotation.y += 0.0002
      renderer.render(scene, camera)
      titles.forEach((title, index) => {
        title.quaternion.copy(camera.quaternion)
      })
    }

    animate()

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', onWindowResize)

    return () => {
      window.removeEventListener('click', onMouseClick)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', onWindowResize)
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="w-full h-screen" />
}

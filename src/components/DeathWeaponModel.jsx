import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export function DeathWeaponModel({ hovered }) {
    const group = useRef()
    const { scene } = useGLTF('/constant/death_weapon/scene.gltf')

    useFrame((state, delta) => {
        if (!group.current) return
        group.current.rotation.y += delta * (hovered ? 0.4 : 0.15)
        group.current.position.y =
            Math.sin(state.clock.elapsedTime * 0.8) * 0.08
    })

    return (
        <group ref={group}>
            <primitive
                object={scene}
                scale={0.012}
                rotation={[-Math.PI * 0.05, 0, 0]}
            />
        </group>
    )
}

useGLTF.preload('/constant/death_weapon/scene.gltf')

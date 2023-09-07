import { OrbitControls, useGLTF } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { Physics, RigidBody, CuboidCollider, BallCollider, quat, CylinderCollider, InstancedRigidBodies } from '@react-three/rapier'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Experience()
{

    const cubeCount = 300
    const instances = useMemo(() => 
    {
        const instances = []

        for (let i = 0; i < cubeCount; i++) {
           instances.push({
                key: 'instance_' + i,
                position: [
                    (Math.random() - 0.5) * 8,
                    6 + i * 0.2,
                    (Math.random() - 0.5) * 8
                ],
                rotation: [Math.random(),Math.random(),Math.random()]
           })
            
        }

        return instances
    }, [])
    // const cubes = useRef()

    // useEffect(() => 
    // {
    //     for(let i = 0; i < cubeCount; i++)
    //     {
    //         const matrix = new THREE.Matrix4()
    //         matrix.compose(
    //             new THREE.Vector3(i * 2),
    //             new THREE.Quaternion,
    //             new THREE.Vector3(1,1,1)
    //         )
    //         cubes.current.setMatrixAt(i, matrix)
    //     }
    // }, [])

    const burger = useGLTF('./hamburger.glb')

    const [ hitSound ] = useState(() => new Audio('./hit.mp3'))

    const cube = useRef()
    const twister = useRef()

    const cubeJump = () =>
    {
        const mass = cube.current.mass()
        cube.current.applyImpulse({x: 0, y: 5 * mass, z: 0})
        cube.current.applyTorqueImpulse({
            x: Math.random() - 0.5, 
            y: Math.random() - 0.5, 
            z: Math.random() - 0.5
        })
    }

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const eulerRotatiom = new THREE.Euler(0, time * 3, 0)
        const quaternionRotation = new THREE.Quaternion()
        quaternionRotation.setFromEuler(eulerRotatiom)
        twister.current.setNextKinematicRotation(quaternionRotation)

        const angle = time * 0.5
        const x = Math.cos(angle)  * 3
        const z = Math.sin(angle)  * 3

        twister.current.setNextKinematicTranslation( {x: x, y: - 0.8, z: z})
    })

    const collisionEnter = ()  => 
    {
        // hitSound.currentTime = 0
        // hitSound.volume = Math.random()
        // hitSound.play()
    }

    return <>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 1.5 } />
        <ambientLight intensity={ 0.5 } />

        <Physics debug={false} gravity={[0, -9.81, 0]}>

            <RigidBody
                position={[0, - 0.8, 0]}
                friction={0}
                type='kinematicPosition'
                ref={twister}
                onCollisionEnter={collisionEnter}
            >
                <mesh castShadow scale={[0.4, 0.4, 3]}>
                    <boxGeometry/>
                    <meshStandardMaterial color={'red'}/>
                </mesh>
            </RigidBody>

            <RigidBody colliders='ball'>
                <mesh castShadow position={ [ - 1.5, 2, 0 ] }>
                    <sphereGeometry />
                    <meshStandardMaterial color="orange" />
                </mesh>
            </RigidBody>

            <RigidBody position={ [ 1.5, 2, 0 ] } ref={cube} restitution={0} friction={0.7} colliders={false}>
                <mesh castShadow onClick={cubeJump}>
                    <boxGeometry />
                    <meshStandardMaterial color="mediumpurple" />
                </mesh>   
                <CuboidCollider args={[0.5, 0.5, 0.5]} mass={2}/>             
            </RigidBody>

            <RigidBody type='fixed' friction={0.7} >
                <mesh receiveShadow position-y={ - 1.25 }>
                    <boxGeometry args={ [ 10, 0.5, 10 ] } />
                    <meshStandardMaterial color="greenyellow" />
                </mesh>
            </RigidBody>

            <RigidBody position={[0, 4, 0]} colliders={false}>
                <CylinderCollider args={[0.5, 1.25]}/>
                <primitive object={burger.scene} scale={0.25} />
            </RigidBody>

            <RigidBody type='fixed'>
                <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, 5.5]}/>
                <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, - 5.5]}/>
                <CuboidCollider args={[0.5, 2, 5]} position={[5.5, 1, 0]}/>
                <CuboidCollider args={[0.5, 2, 5]} position={[-5.5, 1, 0]}/>
            </RigidBody>

            <InstancedRigidBodies instances={instances}>
                <instancedMesh castShadow args={[null, null, cubeCount ]}>
                    <boxGeometry/>
                    <meshStandardMaterial color={'tomato'}/>
                </instancedMesh>
            </InstancedRigidBodies>
                
        </Physics>


    </>
}
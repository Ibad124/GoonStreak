import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useState, useRef } from "react";
import { motion } from "framer-motion-3d";

function Avatar({ level, mood = "happy" }) {
  const avatarRef = useRef();
  const { scene } = useGLTF("/avatar.glb");
  const [hovering, setHovering] = useState(false);

  useFrame((state) => {
    if (hovering) {
      avatarRef.current.rotation.y += 0.01;
    }
  });

  return (
    <motion.group
      ref={avatarRef}
      animate={{
        scale: hovering ? 1.1 : 1,
        y: hovering ? 0.2 : 0,
      }}
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
    >
      <primitive object={scene} />
      {/* Level indicator */}
      <mesh position={[0, 2, 0]}>
        <textGeometry args={[`Level ${level}`]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>
    </motion.group>
  );
}

export default function UserAvatar3D({ level, mood }) {
  return (
    <div className="w-32 h-32 rounded-full overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Avatar level={level} mood={mood} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

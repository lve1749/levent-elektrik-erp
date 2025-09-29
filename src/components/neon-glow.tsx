import { TextReveal } from '@/components/ui/text-reveal';

export default function NeonGlowExample() {
  return (
    <TextReveal variant="blur" className="text-xl font-bold text-foreground" staggerDelay={0.08}>
      Neon Blur
    </TextReveal>
  );
}

import Link from 'next/link';
import {
  PageHeader,
  Button,
  FeatureCard,
  Container,
} from '@aiapps/ui-components';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <PageHeader
          title="AI Game Audio Generator"
          subtitle="Powered by Gemini Lyria RealTime"
          gradient={{ from: 'blue-600', to: 'purple-600' }}
        />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/audio/create">
            <Button variant="primary" size="lg">
              음악 생성하기
            </Button>
          </Link>
          <Link href="/audio/library">
            <Button variant="secondary" size="lg">
              라이브러리 보기
            </Button>
          </Link>
        </div>

        <Container maxWidth="lg" centered className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🎵"
              title="실시간 생성"
              description="WebSocket 기반 실시간 스트리밍으로 빠르게 음악을 생성합니다"
            />
            <FeatureCard
              icon="🎮"
              title="게임 음악 특화"
              description="BGM, 효과음 등 게임에 최적화된 오디오를 생성합니다"
            />
            <FeatureCard
              icon="⚙️"
              title="세밀한 조정"
              description="BPM, 밀도, 밝기, 악기 등을 자유롭게 조정할 수 있습니다"
            />
          </div>
        </Container>
      </div>
    </main>
  );
}

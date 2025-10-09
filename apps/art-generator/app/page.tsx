import Link from 'next/link';
import {
  PageHeader,
  Button,
  FeatureCard,
  Container,
} from '@aiapps/ui-components';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <PageHeader
          title="AI 2D Game Art Generator"
          subtitle="Powered by Gemini 2.5 Flash Image"
          gradient={{ from: 'purple-600', to: 'pink-600' }}
        />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/art/create">
            <Button variant="primary" size="lg">
              아트 생성하기
            </Button>
          </Link>
          <Link href="/art/library">
            <Button variant="secondary" size="lg">
              라이브러리 보기
            </Button>
          </Link>
        </div>

        <Container maxWidth="xl" centered className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FeatureCard
              icon="🎨"
              title="Text-to-Image"
              description="프롬프트로 원하는 게임 아트를 즉시 생성합니다"
            />
            <FeatureCard
              icon="✏️"
              title="이미지 편집"
              description="기존 이미지를 AI로 편집하고 개선합니다"
            />
            <FeatureCard
              icon="🖼️"
              title="이미지 합성"
              description="여러 이미지를 하나로 합성합니다"
            />
            <FeatureCard
              icon="🎭"
              title="스타일 전이"
              description="원하는 스타일을 이미지에 적용합니다"
            />
          </div>
        </Container>
      </div>
    </main>
  );
}

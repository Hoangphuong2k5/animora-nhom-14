import type { Language } from '@/types';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  suggestedAction?: {
    labelVi: string;
    labelEn: string;
    path: string;
  };
}

const getApiBaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_SERVER_API ||
    'http://localhost:5000/api/v1'
  );
};

/**
 * Gửi tin nhắn tới API Backend Trợ lý AI (Google Gemini + Guardrails)
 */
export async function sendPetCareChatMessage(
  prompt: string,
  history: AiChatMessage[],
  lang: Language
): Promise<Omit<AiChatMessage, 'id' | 'createdAt'>> {
  const isVi = lang === 'vi';
  const baseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        history: (history || [])
          .filter((msg) => msg && msg.content && msg.id !== 'ai-welcome')
          .map((msg) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(errorJson?.message || `HTTP error ${response.status}`);
    }

    const resData = await response.json();
    const replyText =
      resData?.data?.reply ||
      resData?.message ||
      (isVi
        ? 'Xin lỗi, trợ lý AI chưa có phản hồi thích hợp.'
        : 'Sorry, AI assistant could not provide a response.');

    const firstService = resData?.data?.suggested_services?.[0];
    let suggestedAction = undefined;

    if (firstService) {
      suggestedAction = {
        labelVi: `Đặt dịch vụ: ${firstService.name || 'Khám'}`,
        labelEn: `Book: ${firstService.name || 'Exam'}`,
        path: `/dat-lich?service=${firstService.id || firstService.kind || 'kham-tong-quat'}`,
      };
    } else if (
      resData?.data?.guardrail === 'prescription_request' ||
      resData?.data?.guardrail === 'emergency'
    ) {
      suggestedAction = {
        labelVi: 'Đặt lịch khám với Bác sĩ ngay',
        labelEn: 'Book a Vet Exam Now',
        path: '/dat-lich?service=kham-tong-quat',
      };
    }

    return {
      role: 'assistant',
      content: replyText,
      suggestedAction,
    };
  } catch (error) {
    console.error('Lỗi khi gọi API AI Backend:', error);
    return {
      role: 'assistant',
      content: isVi
        ? 'Rất tiếc, hiện tại không thể kết nối tới máy chủ AI Animora. Vui lòng kiểm tra lại Backend (cổng 5000) đã được khởi chạy chưa.'
        : 'Unable to connect to Animora AI server. Please make sure the Backend server is running on port 5000.',
      suggestedAction: {
        labelVi: 'Đặt lịch khám trực tiếp',
        labelEn: 'Book In-Clinic Visit',
        path: '/dat-lich',
      },
    };
  }
}

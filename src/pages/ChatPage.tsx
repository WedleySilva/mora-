import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, MessageSquare, Send, ShieldCheck } from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { useMora } from '../context/MoraContext';
import { chatService } from '../services/chatService';
import { Conversation } from '../types/mora';

export function ChatPage() {
  const { user, loginWithDemo, refreshUnreadCount } = useMora();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedConvId = searchParams.get('conversa');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(requestedConvId);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    chatService
      .listConversations(user.id)
      .then((list) => {
        setConversations(list);
        if (requestedConvId && list.some((c) => c.id === requestedConvId)) {
          setSelectedId(requestedConvId);
        } else if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [user, requestedConvId]);

  const activeConversation = conversations.find((c) => c.id === selectedId) || null;

  useEffect(() => {
    if (user && activeConversation) {
      const hasUnread =
        user.id === activeConversation.proprietarioId
          ? activeConversation.naoLidasParaProprietario > 0
          : activeConversation.naoLidasParaInteressado > 0;

      if (hasUnread) {
        chatService.markAsRead(activeConversation.id, user.id).then(() => {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConversation.id
                ? {
                    ...c,
                    naoLidasParaProprietario:
                      user.id === c.proprietarioId ? 0 : c.naoLidasParaProprietario,
                    naoLidasParaInteressado:
                      user.id === c.interessadoId ? 0 : c.naoLidasParaInteressado,
                  }
                : c
            )
          );
          refreshUnreadCount();
        });
      }
    }
  }, [activeConversation?.id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.mensagens.length]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-5">
        <MessageSquare className="w-10 h-10 text-[#123F52] mx-auto opacity-75" />
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#123F52]">
          Central de Mensagens Mora+
        </h1>
        <p className="text-sm sm:text-base text-[#737B80]">
          Entre com uma conta demonstrativa para visualizar conversas entre proprietários e
          interessados e testar o envio de mensagens.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => loginWithDemo('usr-juliana')}
            className="px-5 py-3 rounded-xl bg-[#F59A16] hover:bg-[#DC860B] text-white text-sm font-semibold cursor-pointer"
          >
            Entrar como Juliana (Interessada)
          </button>
          <button
            type="button"
            onClick={() => loginWithDemo('usr-carlos')}
            className="px-5 py-3 rounded-xl bg-[#123F52] hover:bg-[#0D2E3D] text-white text-sm font-semibold cursor-pointer"
          >
            Entrar como Seu Carlos (Proprietário)
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !messageText.trim()) return;
    setSending(true);
    try {
      const updated = await chatService.sendMessage(
        activeConversation.id,
        user.id,
        user.nome,
        messageText.trim()
      );
      setConversations((prev) => [
        updated,
        ...prev.filter((c) => c.id !== updated.id),
      ]);
      setMessageText('');
    } finally {
      setSending(false);
    }
  };

  const quickReplies =
    user.role === 'proprietario'
      ? [
          'Podemos agendar uma visita ao imóvel esta semana?',
          'Você possui referências de experiências anteriores?',
          'As condições do acordo estão detalhadas no anúncio.',
        ]
      : [
          'Gostaria de agendar uma visita para conhecer o imóvel.',
          'Tenho disponibilidade imediata para início.',
          'Podemos alinhar os detalhes pelo checklist da Mora+?',
        ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F5F6F7] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#123F52]">
              Mensagens entre participantes
            </h1>
            <p className="text-xs sm:text-sm text-[#737B80]">
              Histórico organizado das negociações e agendamentos de visita · Conectado como{' '}
              <strong className="text-[#123F52]">{user.nome}</strong>
            </p>
          </div>
          <Link
            to="/explorar"
            className="text-xs font-semibold text-[#123F52] hover:text-[#F59A16]"
          >
            Explorar mais oportunidades →
          </Link>
        </div>

        {loading ? (
          <div className="h-[520px] bg-white rounded-2xl border border-slate-200 animate-pulse" />
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <p className="font-display text-lg font-bold text-[#123F52]">
              Nenhuma conversa iniciada ainda
            </p>
            <p className="text-sm text-[#737B80]">
              Abra qualquer oportunidade e clique em “Enviar mensagem ao proprietário” para iniciar
              um diálogo.
            </p>
            <Link
              to="/explorar"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#123F52] text-white text-sm font-semibold"
            >
              Ver oportunidades
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
            {/* Conversation List */}
            <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 divide-y divide-slate-100 max-h-[320px] lg:max-h-[640px] overflow-y-auto">
              {conversations.map((conv) => {
                const isSelected = conv.id === activeConversation?.id;
                const otherName =
                  user.id === conv.proprietarioId ? conv.interessadoNome : conv.proprietarioNome;
                const otherRole =
                  user.id === conv.proprietarioId ? 'Interessado(a)' : 'Proprietário(a)';
                const unread =
                  user.id === conv.proprietarioId
                    ? conv.naoLidasParaProprietario
                    : conv.naoLidasParaInteressado;
                const lastMsg = conv.mensagens[conv.mensagens.length - 1];

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(conv.id);
                      setSearchParams({ conversa: conv.id }, { replace: true });
                    }}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#EAF1F4]/70' : 'hover:bg-[#F5F6F7]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                      <SafeImage
                        src={conv.oportunidadeImagem}
                        alt={conv.oportunidadeTitulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-display text-sm font-bold text-[#123F52] truncate">
                          {otherName}
                        </p>
                        {unread > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-[#F59A16] text-white text-[10px] font-bold tabular-nums">
                            {unread}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-[#737B80]">
                        {otherRole} ·{' '}
                        {conv.modalidade === 'trabalho' ? 'Trabalho' : 'Ocupação'}
                      </p>
                      <p className="text-xs text-[#111820] truncate mt-1">
                        {lastMsg?.texto || conv.oportunidadeTitulo}
                      </p>
                    </div>
                  </button>
                );
              })}
            </aside>

            {/* Active Thread */}
            {activeConversation && (
              <section className="lg:col-span-8 flex flex-col justify-between">
                {/* Thread Header */}
                <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-base font-bold text-[#123F52]">
                        {user.id === activeConversation.proprietarioId
                          ? activeConversation.interessadoNome
                          : activeConversation.proprietarioNome}
                      </h2>
                      <span className="text-xs text-[#737B80] inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#F59A16]" />
                        Conta verificada
                      </span>
                    </div>
                    <p className="text-xs text-[#737B80] mt-0.5 line-clamp-1">
                      Assunto: {activeConversation.oportunidadeTitulo}
                    </p>
                  </div>

                  <Link
                    to={`/oportunidade/${activeConversation.oportunidadeId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#123F52] hover:text-[#F59A16] whitespace-nowrap shrink-0"
                  >
                    <span>Ver anúncio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Messages History */}
                <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[380px] bg-[#F5F6F7]/60">
                  <div className="text-center text-[11px] text-[#737B80] py-1">
                    Histórico protegido para transparência de condições combinadas antes da
                    formalização.
                  </div>

                  {activeConversation.mensagens.map((msg) => {
                    const isMine = msg.remetenteId === user.id;
                    const time = new Date(msg.enviadaEm).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            isMine
                              ? 'bg-[#123F52] text-white rounded-br-sm'
                              : 'bg-white border border-slate-200 text-[#111820] rounded-bl-sm'
                          }`}
                        >
                          <p>{msg.texto}</p>
                        </div>
                        <span className="text-[10px] text-[#737B80] mt-1 px-1 tabular-nums">
                          {msg.remetenteNome.split(' ')[0]} · {time}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Reply Chips + Input */}
                <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setMessageText(q)}
                        className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-[#F5F6F7] hover:bg-[#EAF1F4] text-[#123F52] border border-slate-200 transition-colors cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2.5">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Escreva sua mensagem para alinhar visita ou condições..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#123F52]"
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F59A16] hover:bg-[#DC860B] text-white text-sm font-semibold disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Enviar</span>
                    </button>
                  </form>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

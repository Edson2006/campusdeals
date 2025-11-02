import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Notification from '../components/Notification';
import {
  getUserConversations,
  sendConversationMessage,
  subscribeToConversationMessages,
  subscribeToUserConversations
} from '../services/firestoreService';
import { useAuthContext } from '../context/AuthContext';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  if (typeof timestamp.toDate === 'function') return formatTimestamp(timestamp.toDate());
  if (timestamp instanceof Date) {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  }
  if (typeof timestamp === 'number') {
    return formatTimestamp(new Date(timestamp));
  }
  if (timestamp?.seconds) {
    return formatTimestamp(new Date(timestamp.seconds * 1000));
  }
  return '';
};

const safeSnapshotDocs = (snapshot) => snapshot?.docs?.map((doc) => ({ id: doc.id, ...doc.data() })) || [];

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [toast, setToast] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true, state: { redirectTo: conversationId ? `/messages/${conversationId}` : '/messages' } });
    }
  }, [loading, user, navigate, conversationId]);

  useEffect(() => {
    if (!user) return () => {};

    let unsubscribeRealtime = () => {};
    const init = async () => {
      try {
        const initial = await getUserConversations(user.uid);
        setConversations(initial);
      } catch (error) {
        console.error('Erreur chargement conversations:', error);
        setToast({
          type: 'error',
          title: 'Conversations indisponibles',
          message: "Impossible de charger la messagerie pour le moment."
        });
      } finally {
        setInitialLoading(false);
      }

      unsubscribeRealtime = subscribeToUserConversations(user.uid, (snapshot) => {
        setConversations(safeSnapshotDocs(snapshot));
      });
    };

    init();

    return () => {
      unsubscribeRealtime();
    };
  }, [user]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return () => {};
    }
    setMessagesLoading(true);
    const unsubscribe = subscribeToConversationMessages(conversationId, (snapshot) => {
      setMessages(safeSnapshotDocs(snapshot));
      setMessagesLoading(false);
    });

    return () => {
      setMessages([]);
      unsubscribe();
    };
  }, [conversationId]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === conversationId) || null,
    [conversationId, conversations]
  );

  const handleSelectConversation = (id) => {
    navigate(id ? `/messages/${id}` : '/messages');
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || !conversationId || isSending) return;

    setIsSending(true);
    try {
      await sendConversationMessage(conversationId, trimmed);
      setInputValue('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setToast({
        type: 'error',
        title: "Message non envoyé",
        message: error?.message || "Impossible d'envoyer le message."
      });
    } finally {
      setIsSending(false);
    }
  };

  const renderSidebar = () => (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur">
      <div className="px-6 py-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Conversations</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {initialLoading ? (
          <p className="px-3 text-xs text-white/60">Chargement...</p>
        ) : conversations.length ? (
          <ul className="space-y-2">
            {conversations.map((conversation) => {
              const isActive = conversation.id === conversationId;
              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? 'border-indigo-300/60 bg-indigo-500/25 text-white shadow shadow-indigo-500/30'
                        : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em]">
                      <span className="truncate">{conversation.annonceTitle || 'Annonce'}</span>
                      <span className="text-white/50">{formatTimestamp(conversation.updatedAt)}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {conversation.lastMessage?.content || 'Nouvelle conversation'}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-3 text-xs text-white/60">Aucune conversation pour le moment.</p>
        )}
      </div>
    </aside>
  );

  const renderMessages = () => {
    if (!conversationId) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-dashed border-white/20 bg-white/5 text-center text-sm text-white/60">
          <p>Choisis une conversation pour commencer à discuter.</p>
        </div>
      );
    }

    if (!activeConversation && !messagesLoading) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-rose-400/40 bg-rose-500/10 p-10 text-center text-sm text-rose-100">
          <p>Cette conversation n&apos;existe plus ou tu n&apos;y as pas accès.</p>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col rounded-[28px] border border-white/10 bg-white/5 backdrop-blur">
        {activeConversation ? (
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Annonce</p>
                <h1 className="mt-2 text-xl font-bold text-white">{activeConversation.annonceTitle}</h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/annonces/${activeConversation.annonceId}`)}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Voir l&apos;annonce
                </button>
              {activeConversation.annoncePrice != null ? (
                <span className="rounded-full border border-emerald-300/50 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">
                  {Number(activeConversation.annoncePrice).toFixed(2)} €
                </span>
              ) : null}
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-6">
          {messagesLoading ? (
            <p className="text-xs text-white/60">Chargement des messages...</p>
          ) : messages.length ? (
            messages.map((message) => {
              const isMine = message.senderId === user?.uid;
              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                      isMine
                        ? 'bg-indigo-500/80 text-white shadow-indigo-500/30'
                        : 'bg-white/10 text-white/90 shadow-slate-900/40'
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="mt-2 block text-[10px] uppercase tracking-[0.3em] text-white/50">
                      {formatTimestamp(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-white/60">Pas encore de messages. Envoie le premier !</p>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="border-t border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Écris ton message..."
              className="flex-1 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              className="rounded-full border border-indigo-300/60 bg-indigo-500/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <NavigationBar />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-16 h-80 w-80 rounded-full bg-indigo-400/25 blur-[160px]" />
        <div className="absolute bottom-0 left-8 h-[420px] w-[420px] rounded-full bg-pink-500/25 blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)]" />
      </div>

      {toast ? (
        <div className="fixed top-6 right-6 z-50">
          <Notification {...toast} onClose={() => setToast(null)} />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-20 pt-32">
        <header className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/annonces')}
              className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white/40 hover:text-white"
            >
              ← Retour aux annonces
            </button>
            <span>Messagerie</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white/40 hover:text-white"
          >
            Accueil
          </button>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[0.38fr_0.62fr]">
          {renderSidebar()}
          {renderMessages()}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

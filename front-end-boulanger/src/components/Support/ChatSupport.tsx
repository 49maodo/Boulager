import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, User, Bot, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useSendMessageMutation } from '@/store/api/chatApi';
import { toast } from 'sonner';
import { addAiMessage, addUserMessage, setSession, clearChat } from '@/store/slices/chatSlice';

export function ChatSupport() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [newMessage, setNewMessage] = useState('');
  const { messages, session_id } = useAppSelector((state) => state.chat);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const isClient = user?.role === 'client';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    dispatch(addUserMessage(messageContent));
    setNewMessage('');

    try {
      const result = await sendMessage({
        agent_name: 'product_support',
        input: messageContent,
      }).unwrap();

      if (result.session_id && !session_id) {
        dispatch(setSession(result.session_id));
      }
      console.log('Message sent successfully');
      dispatch(addAiMessage(result.response));
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error("Erreur lors de l'envoi du message");
      dispatch(addAiMessage("Une erreur s'est produite lors de l'envoi du message."));
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const MessageBubble = ({ message }: { message: any }) => {
    const isAIMessage = message.sender === 'ai';
    const isOwnMessage = message.sender === 'user';

    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          <Avatar className='w-8 h-8 mx-2'>
            <AvatarFallback>{isOwnMessage ? <User className='w-4 h-4' /> : isAIMessage ? <Bot className='w-4 h-4' /> : <User className='w-4 h-4' />}</AvatarFallback>
          </Avatar>

          <div className={`rounded-lg p-3 ${isOwnMessage ? 'bg-primary text-primary-foreground' : isAIMessage ? 'bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800' : 'bg-muted'}`}>
            <p className='text-sm'>{message.contenu}</p>
            <div className={`flex items-center justify-between mt-1 text-xs ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              <span>{formatTime(message.created_at)}</span>
              {isAIMessage && (
                <Badge variant='outline' className='ml-2 text-xs gap-2'>
                  IA <Bot className='w-4 h-4' />
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      <Card className='h-[700px] flex flex-col'>
        <CardHeader className='border-b'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-lg'>{isClient ? 'Conversation avec le support' : 'Messages clients'}</CardTitle>
              <CardDescription>{isClient ? 'Notre équipe et notre IA vous répondent rapidement' : 'Gérez les demandes clients'}</CardDescription>
            </div>
            <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
              <div className='w-2 h-2 bg-primary rounded-full'></div>
              <span>En ligne</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col flex-1 overflow-hidden p-0'>
          {/* Messages */}
          <ScrollArea className='flex-1 p-4'>
            <div className='space-y-1'>
              {messages.length === 0 ? (
                <div className='text-center py-12'>
                  <MessageCircle className='mx-auto h-12 w-12 text-muted-foreground' />
                  <h3 className='mt-4 text-lg font-semibold'>Aucun message</h3>
                  <p className='text-muted-foreground'>{isClient ? 'Démarrez une conversation avec notre équipe' : 'Aucun message client pour le moment'}</p>
                </div>
              ) : (
                <>
                  {messages.map((message: any) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {isSending && (
                    <div className='flex justify-start mb-4'>
                      <div className='flex items-start max-w-[70%] flex-row'>
                        <Avatar className='w-8 h-8 mx-2'>
                          <AvatarFallback>
                            <Bot className='w-4 h-4' />
                          </AvatarFallback>
                        </Avatar>

                        <div className='rounded-lg p-3 bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800 animate-pulse'>
                          <p className='text-sm text-muted-foreground'>L'IA rédige une réponse...</p>
                          <div className='flex items-center justify-between mt-1 text-xs text-muted-foreground'>
                            <span>...</span>
                            <Badge variant='outline' className='ml-2 text-xs gap-2'>
                              IA <Bot className='w-4 h-4' />
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input (reste fixé en bas) */}
          <div className='border-t p-4 shrink-0 bg-background'>
            {messages.length > 0 && (
              <Button variant='destructive' size='sm' className='mb-2' onClick={() => dispatch(clearChat())}>
                Effacer la conversation
              </Button>
            )}
            <form onSubmit={handleSendMessage} className='flex space-x-2'>
              <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={isClient ? 'Tapez votre message...' : 'Répondre au client...'} disabled={isSending} className='flex-1' />
              <Button type='submit' disabled={!newMessage.trim() || isSending}>
                {isSending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
              </Button>
            </form>

            {isClient && <div className='mt-2 text-xs text-muted-foreground'>Notre IA et notre équipe vous répondent généralement en moins de 5 minutes pendant les heures d'ouverture.</div>}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for clients */}
      {isClient && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Questions fréquentes</CardTitle>
            <CardDescription>Cliquez sur une question pour l'envoyer rapidement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-2 sm:grid-cols-2'>
              {['Quel est le statut de ma commande ?', 'Comment modifier ma commande ?', 'Quels sont vos horaires de livraison ?', 'Comment annuler ma commande ?', 'Avez-vous des produits sans gluten ?', 'Comment contacter le livreur ?'].map((question, index) => (
                <Button key={index} variant='outline' size='sm' className='justify-start text-left h-auto p-3' onClick={() => setNewMessage(question)}>
                  {question}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

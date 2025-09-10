import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  contenu: string;
  created_at: string;
}

interface ChatState {
  messages: Message[];
  session_id: string | null;
}

const initialState: ChatState = {
  messages: [],
  session_id: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: Date.now(),
        sender: 'user',
        contenu: action.payload,
        created_at: new Date().toISOString(),
      });
    },
    addAiMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: Date.now(),
        sender: 'ai',
        contenu: action.payload,
        created_at: new Date().toISOString(),
      });
    },
    setSession: (state, action: PayloadAction<string>) => {
      state.session_id = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.session_id = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const { addUserMessage, addAiMessage, setSession, clearChat } = chatSlice.actions;
export default chatSlice.reducer;

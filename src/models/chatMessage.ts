import { Schema, model, Document, Types, models } from 'mongoose';

export type ChatMessageType = 'text' | 'audio' | 'image';

export interface IChatMessage extends Document {
  userId: Types.ObjectId;           // 用户ID
  role: 'user' | 'ai';              // 消息发送方
  type: ChatMessageType;            // 消息类型
  content: string;                  // 文本内容或文件URL
  transcript?: string;              // 语音转文本结果（仅audio类型）
  imageUrl?: string;                // 图片URL（仅image类型）
  conversationId?: Types.ObjectId;  // 会话ID（可选，支持多会话）
  createdAt: Date;
  updatedAt: Date;
}

export type ChatMessage = {
  id: string;
  userId: string;
  role: 'user' | 'ai';
  type: ChatMessageType;
  content: string;
  transcript?: string;
  imageUrl?: string;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
};

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'ai'], required: true },
    type: { type: String, enum: ['text', 'audio', 'image'], required: true },
    content: { type: String, required: true },
    transcript: { type: String }, // 语音转文本
    imageUrl: { type: String },   // 图片URL
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' }, // 可选
  },
  { timestamps: true }
);

export const ChatMessageModel = models.ChatMessage || model<IChatMessage>('ChatMessage', ChatMessageSchema);

export type EditableChatMessage = Omit<ChatMessage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>; 
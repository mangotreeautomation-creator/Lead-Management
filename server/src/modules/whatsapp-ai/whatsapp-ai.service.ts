import { eq, desc, and } from 'drizzle-orm';
import { db } from '../../database/client';
import {
  whatsappAiAccounts,
  whatsappAiConversations,
  whatsappAiMessages,
  customers,
  customerIdentifiers,
  leads,
  leadTouchpoints,
  companies,
} from '../../database/schema/index';

export interface InboundWhatsAppMessagePayload {
  externalConvoId: string;
  senderPhone: string;
  senderName?: string;
  senderType: 'CUSTOMER' | 'AI_AGENT' | 'HUMAN_AGENT' | 'SYSTEM';
  messageType?: string;
  content: string;
  mediaUrl?: string;
  aiModel?: string;
  sentiment?: string;
  intent?: string;
}

export class WhatsAppAiService {
  /**
   * Process incoming or outgoing WhatsApp AI portal message
   */
  async ingestMessage(payload: InboundWhatsAppMessagePayload) {
    const {
      externalConvoId,
      senderPhone,
      senderName,
      senderType,
      messageType = 'text',
      content,
      mediaUrl,
      aiModel,
      sentiment = 'NEUTRAL',
      intent,
    } = payload;

    // 1. Find or create Account
    let account = (await db.select().from(whatsappAiAccounts).limit(1))[0];
    if (!account) {
      const [comp] = await db.select().from(companies).limit(1);
      if (!comp) {
        throw new Error('No company found to associate with WhatsApp AI Account');
      }
      const [newAcc] = await db
        .insert(whatsappAiAccounts)
        .values({
          companyId: comp.id,
          phoneNumberId: 'wa_phone_default_01',
          displayPhoneNumber: '+91 98765 43210',
          name: 'LeadPulse In-House AI Portal',
          provider: 'WHATSAPP_AI_PORTAL',
        })
        .returning();
      account = newAcc;
    }

    // 2. Link or create Customer
    let customerId: string | null = null;
    const [existingCust] = await db.select().from(customers).where(eq(customers.phone, senderPhone)).limit(1);
    if (existingCust) {
      customerId = existingCust.id;
    } else {
      const [newCust] = await db
        .insert(customers)
        .values({
          companyId: account.companyId,
          fullName: senderName || 'WhatsApp User',
          phone: senderPhone,
        })
        .returning();
      customerId = newCust.id;

      await db.insert(customerIdentifiers).values({
        customerId: newCust.id,
        identifierType: 'WHATSAPP',
        identifierValue: senderPhone,
        isPrimary: true,
      });
    }

    // 3. Link or create Lead
    let leadId: string | null = null;
    const [existingLead] = await db.select().from(leads).where(eq(leads.customerId, customerId)).limit(1);
    if (existingLead) {
      leadId = existingLead.id;
    }

    // 4. Find or create Conversation
    let [convo] = await db
      .select()
      .from(whatsappAiConversations)
      .where(eq(whatsappAiConversations.externalConvoId, externalConvoId))
      .limit(1);

    if (!convo) {
      [convo] = await db
        .insert(whatsappAiConversations)
        .values({
          accountId: account.id,
          customerId,
          leadId,
          externalConvoId,
          contactPhone: senderPhone,
          contactName: senderName || 'WhatsApp User',
          stage: 'DISCOVERY',
          intent: intent || 'INQUIRY',
          sentiment,
          unreadCount: senderType === 'CUSTOMER' ? 1 : 0,
          lastMessageAt: new Date(),
        })
        .returning();
    } else {
      await db
        .update(whatsappAiConversations)
        .set({
          unreadCount: senderType === 'CUSTOMER' ? convo.unreadCount + 1 : 0,
          lastMessageAt: new Date(),
          sentiment: sentiment || convo.sentiment,
          intent: intent || convo.intent,
          updatedAt: new Date(),
        })
        .where(eq(whatsappAiConversations.id, convo.id));
    }

    // 5. Insert Message
    const [msg] = await db
      .insert(whatsappAiMessages)
      .values({
        conversationId: convo.id,
        senderType,
        messageType,
        content,
        mediaUrl: mediaUrl || null,
        aiModel: aiModel || null,
        sentiment,
        status: 'delivered',
        sentAt: new Date(),
      })
      .returning();

    // 6. Record Touchpoint on Lead if applicable
    if (leadId) {
      await db.insert(leadTouchpoints).values({
        leadId,
        channel: 'WHATSAPP',
        touchpointType: senderType === 'CUSTOMER' ? 'MESSAGE_RECEIVED' : 'MESSAGE_SENT',
        direction: senderType === 'CUSTOMER' ? 'INBOUND' : 'OUTBOUND',
        summary: `WhatsApp ${senderType === 'CUSTOMER' ? 'from customer' : 'from AI'}: ${content.slice(0, 100)}...`,
        payload: { msgId: msg.id, externalConvoId, senderType },
      });
    }

    return {
      success: true,
      conversationId: convo.id,
      messageId: msg.id,
    };
  }

  /**
   * List conversations
   */
  async listConversations(limit: number = 50) {
    return db
      .select({
        id: whatsappAiConversations.id,
        externalConvoId: whatsappAiConversations.externalConvoId,
        contactName: whatsappAiConversations.contactName,
        contactPhone: whatsappAiConversations.contactPhone,
        stage: whatsappAiConversations.stage,
        intent: whatsappAiConversations.intent,
        sentiment: whatsappAiConversations.sentiment,
        unreadCount: whatsappAiConversations.unreadCount,
        lastMessageAt: whatsappAiConversations.lastMessageAt,
      })
      .from(whatsappAiConversations)
      .orderBy(desc(whatsappAiConversations.lastMessageAt))
      .limit(limit);
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages(conversationId: string) {
    return db
      .select({
        id: whatsappAiMessages.id,
        senderType: whatsappAiMessages.senderType,
        messageType: whatsappAiMessages.messageType,
        content: whatsappAiMessages.content,
        mediaUrl: whatsappAiMessages.mediaUrl,
        aiModel: whatsappAiMessages.aiModel,
        sentiment: whatsappAiMessages.sentiment,
        status: whatsappAiMessages.status,
        sentAt: whatsappAiMessages.sentAt,
      })
      .from(whatsappAiMessages)
      .where(eq(whatsappAiMessages.conversationId, conversationId))
      .orderBy(whatsappAiMessages.sentAt);
  }
}

export const whatsappAiService = new WhatsAppAiService();

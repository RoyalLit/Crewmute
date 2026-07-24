import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';

import { useTheme } from '../../../src/design/theme';
import { spacing, brandColors } from '../../../src/design/tokens';
import { useSocket } from '../../../src/context/SocketContext';
import type { MessageResponseDTO } from '../../../src/api/chatsHooks';
import { useGroupChatHistory } from '../../../src/api/chatsHooks';
import { useAuth } from '../../../src/context/AuthContext';
import { useRideDetailsQuery } from '../../../src/api/ridesHooks';
import { CHAT_BG_LIGHT, CHAT_BG_DARK } from '../../../src/utils/imageAssets';
import { Avatar } from '../../../src/components/Avatar';

export default function GroupChatScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  
  const { session } = useAuth();
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  const flatListRef = useRef<any>(null);
  const [messageText, setMessageText] = useState('');
  const { data: rideData } = useRideDetailsQuery(rideId as string);
  
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGroupChatHistory(rideId as string);

  const messages = data?.pages.flat() || [];

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit('join_ride', rideId);

    const handleReceiveMessage = (message: MessageResponseDTO) => {
      // Add message to cache optimistically
      queryClient.setQueryData(['chat', 'group', rideId], (oldData: any) => {
        if (!oldData) return oldData;
        const newPages = [...oldData.pages];
        newPages[0] = [message, ...newPages[0]]; // Since it's inverted, index 0 is top visually
        return {
          ...oldData,
          pages: newPages,
        };
      });

      // Mark as read not needed for group chat right now
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, isConnected, rideId, session?.user.id, queryClient]);

  const handleSend = () => {
    if (!messageText.trim() || !socket || !isConnected) return;
    
    socket.emit('send_message', {
      rideId,
      isGroupMessage: true,
      content: messageText.trim()
    });

    setMessageText('');
  };

  const renderMessage = ({ item }: { item: MessageResponseDTO }) => {
    const isMe = item.senderId === session?.user.id;

    // We can try to get the sender name from rideData participants if we mapped them
    // For now, we can just show Sender ID or Avatar if we had a participant map
    // The backend doesn't send sender profile in MessageResponseDTO currently, but we could fetch it.
    // We will just show a generic avatar or name if we have it.

    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperOther]}>
        {!isMe && (
          <View style={{ marginRight: 8, alignSelf: 'flex-end', marginBottom: 2 }}>
            <Avatar 
              name={item.senderId.slice(-4)} 
              size="sm" 
            />
          </View>
        )}
        <View style={{ maxWidth: '80%' }}>
          {!isMe && (
            <Text style={{ fontSize: 10, color: colors.text.secondary, marginBottom: 2, marginLeft: 4 }}>
              User {item.senderId.slice(-4)}
            </Text>
          )}
          <View style={[
            styles.messageBubble, 
            isMe ? [styles.messageBubbleMe, { backgroundColor: brandColors.electricViolet }] : [styles.messageBubbleOther, { backgroundColor: isDark ? colors.background.subtle : '#EAEBEE' }]
          ]}>
            <Text style={[styles.messageText, { color: isMe ? '#FFF' : colors.text.primary }]}>
              {item.content}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2 }}>
              <Text style={[styles.timeText, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.text.placeholder }]}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background.card, borderBottomColor: colors.border.default }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text.primary }]} numberOfLines={1}>
            Ride Group Chat
          </Text>
          {rideData?.data && (
            <Text style={[styles.headerStatus, { color: colors.text.secondary }]}>
              {rideData.data.fromCity} to {rideData.data.toCity}
            </Text>
          )}
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ImageBackground 
        source={{ uri: isDark ? CHAT_BG_DARK : CHAT_BG_LIGHT }} 
        style={styles.chatBackground}
        resizeMode="cover"
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(10, 10, 15, 0.85)' : 'rgba(255, 255, 255, 0.8)' }]} />
        
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={brandColors.electricViolet} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            inverted
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messageList}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator size="small" color={colors.text.secondary} style={{ marginVertical: spacing.md }} />
              ) : null
            }
          />
        )}
      </ImageBackground>

      {/* Input Area */}
      <View style={[
        styles.inputContainer, 
        { 
          paddingBottom: Math.max(insets.bottom, spacing.sm),
          backgroundColor: colors.background.card,
          borderTopColor: colors.border.default
        }
      ]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: isDark ? colors.background.primary : '#F0F2F5',
            color: colors.text.primary,
          }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.text.placeholder}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
        />
        <Pressable 
          style={[
            styles.sendButton, 
            { backgroundColor: messageText.trim() ? brandColors.electricViolet : colors.background.subtle }
          ]}
          onPress={handleSend}
          disabled={!messageText.trim()}
        >
          <Ionicons name="send" size={18} color={messageText.trim() ? '#FFF' : colors.text.placeholder} style={{ marginLeft: 2 }} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  headerName: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  headerStatus: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 12,
  },
  chatBackground: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    width: '100%',
  },
  messageWrapperMe: {
    justifyContent: 'flex-end',
  },
  messageWrapperOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageBubbleMe: {
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 15,
    lineHeight: 22,
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 15,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2, // align with input bottom
  },
});

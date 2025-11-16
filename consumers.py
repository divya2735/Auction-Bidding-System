from channels.generic.websocket import AsyncWebsocketConsumer , AsyncJsonWebsocketConsumer
import json
from .models import AuctionItem, AuctionChatMessage
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from jwt import decode as jwt_decode
from django.conf import settings
User = get_user_model()

class AuctionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.auction_id = self.scope['url_route']['kwargs']['auction_id']
        self.group_name = f"auction_{self.auction_id}"
        self.user = self.scope["user"]

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Optional: Notify others that user joined
        if self.user.is_authenticated:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "user_joined",
                    "user": f"{self.user.first_name} {self.user.last_name}",
                    "ticket_id": self.user.ticket_id,
                },
            )

    async def disconnect(self, close_code):
        """Handle user leaving the auction (tab closed / manual leave)"""
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

        if self.user.is_authenticated:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "user_left",
                    "user": f"{self.user.first_name} {self.user.last_name}",
                    "ticket_id": self.user.ticket_id,
                },
            )

    async def receive(self, text_data):
        """Handle messages from frontend (e.g., leave manually)"""
        data = json.loads(text_data)
        action = data.get("action")

        if action == "leave_auction":
            await self.close(code=1000)

    async def user_joined(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_joined",
            "message": f"{event['user']} ({event['ticket_id']}) joined the auction."
        }))

    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_left",
            "message": f"{event['user']} ({event['ticket_id']}) left the auction."
        }))

    async def send_bid_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "bid_update",
            "user": event["user"],
            "ticket_id": event["ticket_id"],
            "amount": event["amount"],
            "message": f"{event['user']} ({event['ticket_id']}) placed a bid of ₹{event['amount']}"
        }))

    async def auction_closed(self, event):
        await self.send(text_data=json.dumps({
            "type": "auction_closed",
            "message": event.get("message", "This auction is now closed.")
        }))


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
        else:
            self.group_name = f"user_{self.scope['user'].id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def auction_notification(self, event):
        await self.send(text_data=json.dumps(event))

#Buyer------------

class BuyerDashboardConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
        else:
            # Join the user-specific group
            self.group_name = f"user_{self.user.id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # Client can subscribe to auctions (optional)
    async def receive_json(self, content):
        auction_id = content.get("auction_id")
        if auction_id:
            await self.channel_layer.group_add(f"auction_{auction_id}", self.channel_name)

    # 🔔 Generic auction update (e.g. new bid, price change)
    async def auction_update(self, event):
        await self.send_json(event["content"])

    # 🔔 Personal confirmation when user places a bid
    async def personal_bid_confirmation(self, event):
        await self.send_json({
            "type": "personal_confirmation",
            "content": event["content"],
        })


class SellerDashboardConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated or not hasattr(self.user, "sellerprofile"):
            await self.close()
        else:
            # Join seller-specific group
            self.group_name = f"seller_{self.user.id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # 🔔 General auction update for seller
    async def seller_update(self, event):
        await self.send_json(event["content"])

    # 🔔 Personal seller notification
    async def personal_seller_notification(self, event):
        await self.send_json({
            "type": "personal_seller_notification",
            "content": event["content"],
        })

class DisputeConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()
        else:
            self.group_name = f"user_{user.id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def dispute_update(self, event):
        await self.send_json(event["content"])

class AuctionChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.auction_id = self.scope["url_route"]["kwargs"]["auction_id"]
        self.room_group_name = f"auction_chat_{self.auction_id}"
        
        # Get token from query string
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        
        # Parse query string to get token
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=', 1)[1]
                break
        
        if not token:
            print(f"❌ No token provided in WebSocket connection for auction {self.auction_id}")
            await self.close(code=4001)
            return
        
        # Authenticate user with JWT token
        try:
            # Verify and decode the JWT token
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            
            # Get user from database
            self.user = await self.get_user(user_id)
            
            if not self.user:
                print(f"❌ User with id {user_id} not found")
                await self.close(code=4002)
                return
            
            print(f"✅ User authenticated: {self.user.email} (ID: {user_id})")
            
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            await self.close(code=4003)
            return
        
        # Join room group - CRITICAL: This must succeed
        try:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            print(f"✅ User {self.user.email} joined room: {self.room_group_name}")
            print(f"   Channel name: {self.channel_name}")
        except Exception as e:
            print(f"❌ Failed to join room group: {e}")
            await self.close(code=4004)
            return
        
        await self.accept()
        print(f"✅ WebSocket connection accepted for {self.user.email}")

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name') and hasattr(self, 'channel_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            if hasattr(self, 'user'):
                print(f"👋 User {self.user.email} left auction chat {self.auction_id}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get("message", "").strip()
            
            if not message:
                print("⚠️ Empty message received, ignoring")
                return
            
            print(f"📨 Message received from {self.user.email}: {message}")
            
            # Save message to database
            chat_message = await self.save_message(self.user, message)
            print(f"💾 Message saved to database with ID: {chat_message.id}")
            
            # Broadcast to room group - CRITICAL
            print(f"📢 Broadcasting to room: {self.room_group_name}")
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",  # This calls the chat_message method below
                    "user": self.user.email,
                    "message": message,
                    "timestamp": chat_message.timestamp.isoformat(),
                }
            )
            print(f"✅ Broadcast complete for message from {self.user.email}")
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON decode error: {e}")
        except Exception as e:
            print(f"❌ Error receiving message: {e}")
            import traceback
            traceback.print_exc()

    async def chat_message(self, event):
        # Send message to WebSocket
        try:
            message_data = {
                "user": event["user"],
                "message": event["message"],
                "timestamp": event["timestamp"],
            }
            print(f"📤 Sending to {self.user.email}: {event['message'][:30]}...")
            await self.send(text_data=json.dumps(message_data))
            print(f"✅ Sent to {self.user.email}")
        except Exception as e:
            print(f"❌ Error sending message to {self.user.email}: {e}")

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, user, message):
        auction = AuctionItem.objects.get(id=self.auction_id)
        return AuctionChatMessage.objects.create(
            auction=auction, 
            sender=user, 
            message=message
        )
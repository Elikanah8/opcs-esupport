import json

try:
    from channels.generic.websocket import AsyncWebsocketConsumer
    CHANNELS_AVAILABLE = True
except ImportError:
    CHANNELS_AVAILABLE = False
    AsyncWebsocketConsumer = object

class TicketConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer that broadcasts ticket events to all connected clients.
    Clients connect to ws://localhost:8000/ws/tickets/ and receive real-time updates.
    """
    GROUP_NAME = "tickets_room"

    async def connect(self):
        await self.channel_layer.group_add(self.GROUP_NAME, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.GROUP_NAME, self.channel_name)

    async def receive(self, text_data):
        pass

    async def ticket_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))

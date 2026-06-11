import json
from channels.generic.websocket import AsyncWebsocketConsumer


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

    # Receive message from WebSocket client (not used — server pushes only)
    async def receive(self, text_data=None, bytes_data=None):
        pass

    # Called by views via channel_layer.group_send — broadcasts to all clients
    async def ticket_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))

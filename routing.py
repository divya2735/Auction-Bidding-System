# auctions/routing.py
from django.urls import re_path
from . import consumers 
from .consumers import DisputeConsumer,AuctionChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/seller-dashboard/$", consumers.SellerDashboardConsumer.as_asgi()),
    re_path(r"ws/buyer-dashboard/$", consumers.BuyerDashboardConsumer.as_asgi()),
    re_path(r"ws/disputes/$", DisputeConsumer.as_asgi()),
    re_path(r"ws/auctions/(?P<auction_id>\d+)/chat/$", AuctionChatConsumer.as_asgi()),

]

# auctions/urls_admin.py
from django.urls import path
from . import admin_views

urlpatterns = [
    # Auction Management
    path("auctions/", admin_views.AdminAuctionListView.as_view(), name="admin-auction-list"),
    path("close-auction/<int:auction_id>/", admin_views.close_auction_api, name="close-auction-api"),
    path("reopen-auction/<int:auction_id>/", admin_views.reopen_auction_api, name="reopen-auction-api"),
    
    # Reports & Analytics
    path('reports/', admin_views.AdminReportView.as_view(), name='admin-reports'),
    path('analytics/', admin_views.AdminAnalyticsView.as_view(), name='admin-analytics'),
    
    # Dispute Management
    path('disputes/', admin_views.DisputeListView.as_view(), name='admin-disputes'),
    path('disputes/<int:pk>/', admin_views.DisputeDetailView.as_view(), name='admin-dispute-detail'),
]